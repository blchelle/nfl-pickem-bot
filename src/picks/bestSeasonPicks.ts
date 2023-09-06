import { GameData, getLockedGames } from '@utils/game'
import { BestProb, getBestPicks } from '@picks/bestPicks'
import { getExpectedPayout, getWeeklyStats } from '@utils/stats'
import weeklyData from '@data/historicalWeeklyData.json'

export const getBestSeasonPicks = (games: GameData[]): BestProb => {
  const lockedGames = getLockedGames(games)
  const seasonPicks = getBestPicks(games, lockedGames)

  const historicalWeeklyScores = weeklyData.map((week) => week.scores)
  const historicalStats = getWeeklyStats(historicalWeeklyScores)

  const [expectedPayout, winProbs] = getExpectedPayout(historicalStats, 1, seasonPicks.net)

  return {
    picks: seasonPicks.picks,
    payout: expectedPayout,
    winProbs,
    net: seasonPicks.net,
    scenarioProb: 1
  }
}
