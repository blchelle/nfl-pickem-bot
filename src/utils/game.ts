import { GameData, ResultPoints } from '../@types/gameData'
import { OddsData } from '../@types/oddsData'
import { OfpData } from '../@types/ofpData'
import { GameToPick } from '../bestPicks'
import { AWAY, HOME, MAX_RANK } from '../constants'
import spreadToWinPercent from '../data/spreadConversion'
import ofpTeamToOddsApiTeam from '../data/teamConversion'

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
    if (away.won !== undefined && home.won !== undefined) {
      return [
        { name: away.team, pointDist: +away.pointsPercent.toFixed(3), winProb: +away.won, rank: away.rank },
        { name: home.team, pointDist: +home.pointsPercent.toFixed(3), winProb: +home.won, rank: home.rank }
      ]
    }

    const matchingGame = oddsGames.find((game) => (
      ofpTeamToOddsApiTeam(away.team) === game.away_team.toLowerCase() &&
      ofpTeamToOddsApiTeam(home.team) === game.home_team.toLowerCase()
    ))

    if (matchingGame == null) {
      throw new Error(`could not find a matching game for ${away.team} at ${home.team}`)
    }

    const spreads = matchingGame.bookmakers[0].markets[0].outcomes
    const awaySpreadIndex = ofpTeamToOddsApiTeam(away.team) === spreads[0].name.toLowerCase() ? 0 : 1
    const homeSpreadIndex = 1 - awaySpreadIndex

    return [
      {
        name: away.team,
        pointDist: +away.pointsPercent.toFixed(3),
        winProb: +spreadToWinPercent(spreads[awaySpreadIndex].point).toFixed(3)
      },
      {
        name: home.team,
        pointDist: +home.pointsPercent.toFixed(3),
        winProb: +spreadToWinPercent(spreads[homeSpreadIndex].point).toFixed(3)
      }
    ]
  })
}

export const getFixedGames = (games: GameData[]): [GameToPick, Set<number>] => {
  const fixedGames = games.reduce<GameToPick>((acc, game, i) => {
    if (Math.abs(game[AWAY].winProb - game[HOME].winProb) !== 1) return acc

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
