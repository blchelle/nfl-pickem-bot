import { getFixedGames, GameData, ResultPoints } from '@utils/game'
import { BestPicks, getBestPicks } from '@picks/bestPicks'
import { getExpectedPayout, getWeeklyStats } from '@utils/stats'
import weeklyData from '@data/historicalWeeklyData.json'

export const getBestSeasonPicks = (games: GameData[], outcomes: ResultPoints[][][]): [BestPicks, number, number[]] => {
  const [fixedGames, fixedRanks] = getFixedGames(games)
  const seasonPicks = getBestPicks(outcomes, 0, fixedGames, fixedRanks)

  const historicalWeeklyScores = weeklyData.map((week) => week.scores)
  const historicalStats = getWeeklyStats(historicalWeeklyScores)

  const [expectedPayout, winProbs] = getExpectedPayout(historicalStats, 1, seasonPicks.net)

  return [seasonPicks, expectedPayout, winProbs]
}
