import { GameData, ResultPoints } from '../@types/gameData'
import { OddsData } from '../@types/oddsData'
import { GameRank, OfpData } from '../@types/ofpData'
import { AWAY, HOME, MAX_RANK } from '../constants'
import spreadToWinPercent from '../data/spreadConversion'
import ofpTeamToOddsApiTeam from '../data/teamConversion'

export const calcAvgGamePoints = (game: GameData, totalPoints: number): number => {
  const awayPoints = game[AWAY].pointDist * game[AWAY].winProb * totalPoints
  const homePoints = game[HOME].pointDist * game[HOME].winProb * totalPoints

  return +(awayPoints + homePoints).toFixed(3)
}

export const calcNetResultPoints = (game: GameData, pick: 0 | 1, rank: GameRank, totalPoints: number): ResultPoints => {
  const avgGamePoints = calcAvgGamePoints(game, totalPoints)

  const win = +(rank - avgGamePoints).toFixed(3)
  const lose = +(-avgGamePoints).toFixed(3)
  const avg = +(win * game[pick].winProb + lose * game[1 - pick].winProb).toFixed(3)

  return { avg, lose, win }
}

export const mergeOfpAndOddsData = (ofpGames: OfpData, oddsGames: OddsData): GameData[] => {
  return ofpGames.map((game) => {
    const away = game[AWAY]
    const home = game[HOME]

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

export const generateOutcomes = (games: GameData[]): ResultPoints[][][] => {
  const maxPoints = new Array(games.length).fill(null).reduce((acc: number, _, i) => acc + MAX_RANK - i, 0)
  const outcomes = []

  for (let i = 0; i < games.length; i++) {
    const gameOutcomes = []

    for (let rank = MAX_RANK; rank > MAX_RANK - games.length; rank--) {
      const rankOutcomes = []
      rankOutcomes.push(calcNetResultPoints(games[i], 0, rank as GameRank, maxPoints))
      rankOutcomes.push(calcNetResultPoints(games[i], 1, rank as GameRank, maxPoints))
      gameOutcomes.push(rankOutcomes)
    }

    outcomes.push(gameOutcomes)
  }

  return outcomes
}
