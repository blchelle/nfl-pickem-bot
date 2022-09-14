import { GameData, ResultPoints } from './@types/gameData'
import { BestPicks, getBestPicks } from './bestPicks'
import { AVG_STANDARD_DEVIATION, NET_TARGET } from './constants'
import { getFixedGames } from './utils/game'
import { zScoreToProb } from './utils/stats'

export const getBestSeasonPicks = (games: GameData[], outcomes: ResultPoints[][][]): [BestPicks, number] => {
  const [fixedGames, fixedRanks] = getFixedGames(games)
  const seasonPicks = getBestPicks(outcomes, 0, fixedGames, fixedRanks)

  const targetDiff = seasonPicks.net - NET_TARGET
  const zScore = targetDiff / AVG_STANDARD_DEVIATION
  const winProb = zScoreToProb(zScore)

  return [seasonPicks, winProb]
}
