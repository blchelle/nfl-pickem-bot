import { OddsData } from '@service/odds'
import { OfpData } from '@webscraper/getData'
import { AWAY, HOME, MAX_RANK } from '@config/constants'
import ofpTeamToOddsApiTeam from '@data/teamConversion'
import noVigOdds from '@data/moneylineConversion'
import { LockedGames } from '@picks/bestPicks'

interface TeamData {
  name: string
  pointDist: number
  winProb: number
  rank?: number
};

export interface GameData {
  bookmaker: string
  gameIndex: number
  early: boolean
  locked: boolean
  teams: TeamData[]
}

export interface ResultPoints {
  avg: number
  lose: number
  win: number
};

export const calcNetResultPoints = (game: GameData, pick: number, rank: number, totalPoints: number): ResultPoints => {
  const pickPoints = game.teams[pick].pointDist * totalPoints
  const nonPickPoints = game.teams[1 - pick].pointDist * totalPoints

  const win = +(rank - pickPoints).toFixed(3)
  const lose = +(-nonPickPoints).toFixed(3)
  const avg = +(win * game.teams[pick].winProb + lose * game.teams[1 - pick].winProb).toFixed(3)

  return { avg, lose, win }
}

export const mergeOfpAndOddsData = (ofpGames: OfpData, oddsGames: OddsData): GameData[] => {
  return ofpGames.map((game, i) => {
    const away = game[AWAY]
    const home = game[HOME]

    // Some games have happened in the past (ie TNF), these games won't have odds
    if (away.state === 'won' || home.state === 'won') {
      return {
        bookmaker: 'none',
        gameIndex: i,
        early: true,
        locked: true,
        teams: [
          { name: away.team, pointDist: +away.pointsPercent.toFixed(3), winProb: away.state === 'won' ? 1 : 0, rank: away.rank },
          { name: home.team, pointDist: +home.pointsPercent.toFixed(3), winProb: home.state === 'won' ? 1 : 0, rank: home.rank }
        ]
      }
    }

    const matchingGame = oddsGames.find((game) => (
      ofpTeamToOddsApiTeam(away.team) === game.away_team.toLowerCase() &&
      ofpTeamToOddsApiTeam(home.team) === game.home_team.toLowerCase()
    ))

    if (matchingGame === undefined) {
      throw new Error(`could not find a matching game for ${away.team} at ${home.team}`)
    }

    // Use pinnable if they're available
    const pinnacleIndex = matchingGame.bookmakers.findIndex((bookmaker) => bookmaker.key === 'pinnacle')
    const bookmakerIndex = pinnacleIndex === -1 ? 0 : pinnacleIndex
    const bookmakerName = matchingGame.bookmakers[bookmakerIndex].key

    const mlPrices = matchingGame.bookmakers[bookmakerIndex].markets[0].outcomes

    const early = isEarlyGame(new Date(matchingGame.commence_time))
    const awaySpreadIndex = ofpTeamToOddsApiTeam(away.team) === mlPrices[0].name.toLowerCase() ? 0 : 1
    const homeSpreadIndex = 1 - awaySpreadIndex

    const [homeWinProb, awayWinProb] = noVigOdds(mlPrices[homeSpreadIndex].price, mlPrices[awaySpreadIndex].price)

    const gameData: GameData = {
      bookmaker: bookmakerName,
      gameIndex: i,
      early,
      locked: false,
      teams: [
        {
          name: away.team,
          pointDist: +away.pointsPercent.toFixed(3),
          winProb: +awayWinProb.toFixed(3)
        },
        {
          name: home.team,
          pointDist: +home.pointsPercent.toFixed(3),
          winProb: +homeWinProb.toFixed(3)
        }
      ]
    }

    if (away.state === 'in progress' || home.state === 'in progress') {
      gameData.locked = true
      gameData.teams[AWAY].rank = away.rank
      gameData.teams[HOME].rank = home.rank
    }

    return gameData
  })
}

export const getLockedGames = (games: GameData[]): LockedGames => {
  const lockedGames = games.reduce((acc, game, i) => {
    if (!game.locked) return acc

    const pickedTeam = game.teams[AWAY].rank !== undefined ? AWAY : HOME
    return { ...acc, [i]: { pick: pickedTeam, rank: game.teams[pickedTeam].rank ?? -1 } }
  }, {})

  return lockedGames
}

const isEarlyGame = (game: Date): boolean => {
  // Wednesday - Saturday games are always early
  if (game.getUTCDay() >= 3) return true

  // Monday, Tuesday games are never early
  if (game.getUTCDay() >= 1) return false

  // Sunday games are early if they're expected to finish before 17:00 UTC
  // This is particularly important for games in Europe which typically start 3.5 hours before
  // the morning waves of games in the US.
  //
  // The average nfl game takes 3 hours and 12 minutes, so we'll say 3 hours 20 minutes to be safe.
  return game.getUTCHours() + (game.getUTCMinutes() / 60) + 3 + (20 / 60) < 17
}

export const getMaxPoints = (numGames: number): number => {
  const missingGames = MAX_RANK - numGames
  return (MAX_RANK * (MAX_RANK + 1) / 2) - (missingGames * (missingGames + 1) / 2)
}
