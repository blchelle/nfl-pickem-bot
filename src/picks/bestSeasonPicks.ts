import { getFixedGames, GameData, ResultPoints } from '@utils/game'
import { BestPicks, getBestPicks } from '@picks/bestPicks'
import { AVG_STANDARD_DEVIATION, NET_TARGET } from '@config/constants'
import { zScoreToProb } from '@utils/stats'

export const getBestSeasonPicks = (games: GameData[], outcomes: ResultPoints[][][]): [BestPicks, number] => {
  const [fixedGames, fixedRanks] = getFixedGames(games)
  const seasonPicks = getBestPicks(outcomes, 0, fixedGames, fixedRanks)

  const targetDiff = seasonPicks.net - NET_TARGET
  const zScore = targetDiff / AVG_STANDARD_DEVIATION
  const winProb = zScoreToProb(zScore)

  return [seasonPicks, winProb]
}
