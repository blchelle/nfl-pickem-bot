import { OddsData } from '@service/odds'
import { OfpData } from '@webscraper/getData'
import { AWAY, HOME } from '@config/constants'
import ofpTeamToOddsApiTeam from '@data/teamConversion'
import noVigOdds from '@data/moneylineConversion'
import { LockedGames } from '@picks/bestPicks'

interface TeamData {
  name: string
  pointDist: number
  winProb: number
  rank?: number
  locked: boolean // Whether the pick has been locked
};

export interface GameData {
  gameIndex: number
  teams: TeamData[]
}

export interface ResultPoints {
  avg: number
  lose: number
  win: number
};

export const calcNetResultPoints = (game: GameData, pick: 0 | 1, rank: number, totalPoints: number): ResultPoints => {
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
        teams: [
          { name: away.team, pointDist: +away.pointsPercent.toFixed(3), winProb: away.state === 'won' ? 1 : 0, rank: away.rank, locked: true },
          { name: home.team, pointDist: +home.pointsPercent.toFixed(3), winProb: home.state === 'won' ? 1 : 0, rank: home.rank, locked: true }
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
    const awaySpreadIndex = ofpTeamToOddsApiTeam(away.team) === mlPrices[0].name.toLowerCase() ? 0 : 1
    const homeSpreadIndex = 1 - awaySpreadIndex

    const [homeWinProb, awayWinProb] = noVigOdds(mlPrices[homeSpreadIndex].price, mlPrices[awaySpreadIndex].price)

    if (away.state === 'in progress' || home.state === 'in progress') {
      return {
        gameIndex: i,
        teams: [
          {
            name: away.team,
            pointDist: +away.pointsPercent.toFixed(3),
            winProb: +awayWinProb.toFixed(3),
            rank: away.rank,
            locked: true
          },
          {
            name: home.team,
            pointDist: +home.pointsPercent.toFixed(3),
            winProb: +homeWinProb.toFixed(3),
            rank: home.rank,
            locked: true
          }
        ]
      }
    }

    return {
      gameIndex: i,
      teams: [
        {
          name: away.team,
          pointDist: +away.pointsPercent.toFixed(3),
          winProb: +awayWinProb.toFixed(3),
          locked: false
        },
        {
          name: home.team,
          pointDist: +home.pointsPercent.toFixed(3),
          winProb: +homeWinProb.toFixed(3),
          locked: false
        }
      ]
    }
  })
}

export const getLockedGames = (games: GameData[]): LockedGames => {
  const lockedGames = games.reduce((acc, game, i) => {
    if (!game.teams[AWAY].locked && !game.teams[HOME].locked) return acc

    const pickedTeam = game.teams[AWAY].rank !== undefined ? AWAY : HOME
    return { ...acc, [i]: { pick: pickedTeam, rank: game.teams[pickedTeam].rank ?? -1 } }
  }, {})

  return lockedGames
}
