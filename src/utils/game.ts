import { OddsData } from '@service/odds'
import { OfpData } from '@webscraper/getData'
import { GameToPick } from '@picks/bestPicks'
import { AWAY, HOME, MAX_RANK } from '@config/constants'
import ofpTeamToOddsApiTeam from '@data/teamConversion'
import noVigOdds from '@data/moneylineConversion'

interface TeamData {
  name: string
  pointDist: number
  winProb: number
  rank?: number
  locked: boolean // Whether the pick has been locked
};

export type GameData = TeamData[]

export interface ResultPoints {
  avg: number
  lose: number
  win: number
};

export const calcNetResultPoints = (game: GameData, pick: 0 | 1, rank: number, totalPoints: number): ResultPoints => {
  const pickPoints = game[pick].pointDist * totalPoints
  const nonPickPoints = game[1 - pick].pointDist * totalPoints

  const win = +(rank - pickPoints).toFixed(3)
  const lose = +(-nonPickPoints).toFixed(3)
  const avg = +(win * game[pick].winProb + lose * game[1 - pick].winProb).toFixed(3)

  return { avg, lose, win }
}

export const mergeOfpAndOddsData = (ofpGames: OfpData, oddsGames: OddsData): GameData[] => {
  return ofpGames.map((game) => {
    const away = game[AWAY]
    const home = game[HOME]

    // Some games have happened in the past (ie TNF), these games won't have odds
    if (away.state === 'won' || home.state === 'won') {
      return [
        { name: away.team, pointDist: +away.pointsPercent.toFixed(3), winProb: away.state === 'won' ? 1 : 0, rank: away.rank, locked: true },
        { name: home.team, pointDist: +home.pointsPercent.toFixed(3), winProb: home.state === 'won' ? 1 : 0, rank: home.rank, locked: true }
      ]
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
      return [
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

    return [
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
  })
}

export const getFixedGames = (games: GameData[]): [GameToPick, Set<number>] => {
  const fixedGames = games.reduce<GameToPick>((acc, game, i) => {
    if (!game[AWAY].locked && !game[HOME].locked) return acc

    const pickedTeam = game[AWAY].rank !== undefined ? AWAY : HOME
    return { ...acc, [i]: { pick: pickedTeam, rank: game[pickedTeam].rank ?? -1, won: game[pickedTeam].winProb } }
  }, {})
  const fixedRanks = new Set<number>(Object.values(fixedGames).map(({ rank }) => rank))

  return [fixedGames, fixedRanks]
}

export const generateOutcomes = (games: GameData[]): ResultPoints[][][] => {
  const maxPoints = new Array(games.length).fill(null).reduce((acc: number, _, i) => acc + MAX_RANK - i, 0)
  const outcomes = []

  for (let i = 0; i < games.length; i++) {
    const gameOutcomes = []

    for (let rank = MAX_RANK; rank > MAX_RANK - games.length; rank--) {
      const rankOutcomes = []
      rankOutcomes.push(calcNetResultPoints(games[i], 0, rank, maxPoints))
      rankOutcomes.push(calcNetResultPoints(games[i], 1, rank, maxPoints))
      gameOutcomes.push(rankOutcomes)
    }

    outcomes.push(gameOutcomes)
  }

  return outcomes
}
