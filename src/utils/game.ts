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

    if (matchingGame == null) {
      throw new Error(`could not find a matching game for ${away.team} at ${home.team}`)
    }

    const mlPrices = matchingGame.bookmakers[0].markets[0].outcomes
    const early = isEarlyGame(new Date(matchingGame.commence_time))
    const awaySpreadIndex = ofpTeamToOddsApiTeam(away.team) === mlPrices[0].name.toLowerCase() ? 0 : 1
    const homeSpreadIndex = 1 - awaySpreadIndex

    const [homeWinProb, awayWinProb] = noVigOdds(mlPrices[homeSpreadIndex].price, mlPrices[awaySpreadIndex].price)

    const gameData: GameData = {
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
  const finalLockTime = new Date()
  finalLockTime.setDate(finalLockTime.getDate() + (-1 - finalLockTime.getDay() + 7) % 7 + 1)
  finalLockTime.setUTCHours(17, 0, 0, 0)

  return game.getTime() < finalLockTime.getTime()
}

export const getMaxPoints = (numGames: number): number => {
  const missingGames = MAX_RANK - numGames
  return (MAX_RANK * (MAX_RANK + 1) / 2) - (missingGames * (missingGames + 1) / 2)
}
