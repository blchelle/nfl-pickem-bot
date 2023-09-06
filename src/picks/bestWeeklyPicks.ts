import cliProgress from 'cli-progress'

import { GameData, calcNetResultPoints, getLockedGames } from '@utils/game'
import { BestProb, getBestPicks } from '@picks/bestPicks'
import { chooseK, getExpectedPayout, getWeeklyStats, possibleScenarios } from '@utils/stats'
import weeklyData from '@data/historicalWeeklyData.json'
import deepcopy from 'deepcopy'
import { MAX_RANK } from '@config/constants'

export const getBestWeeklyPicks = (games: GameData[]): BestProb => {
  const missingGames = MAX_RANK - games.length
  const maxPoints = ((MAX_RANK * (MAX_RANK + 1)) / 2) - (missingGames * (missingGames + 1) / 2)

  const lockedGames = getLockedGames(games)
  const gameIndexes = games.map(({ gameIndex }) => gameIndex)

  const historicalWeeklyScores = weeklyData.map((week) => week.scores)
  const historicalStats = getWeeklyStats(historicalWeeklyScores)

  let totalIterations = 0
  const combinations = []
  for (let i = 1; i <= 4; i++) {
    const kCombinations = chooseK(gameIndexes, i)
    totalIterations += kCombinations.length * Math.pow(2, i)
    combinations.push(...kCombinations)
  }

  // Establish a baseline by making conservative picks for every game
  const bestProb: BestProb = { payout: -1, net: Number.MIN_SAFE_INTEGER, picks: [], scenarioProb: 0, winProbs: [] }

  const loadingBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  loadingBar.start(totalIterations, 0)
  let progress = 0

  // Find the best combination, pick combo that maximizes expected money
  for (let i = 0; i < combinations.length; i++) {
    const gameCombination = combinations[i]
    const allScenarios = possibleScenarios(gameCombination.length)

    for (let j = 0; j < allScenarios.length; j++) {
      loadingBar.update(progress++)
      const scenario = allScenarios[j]

      let scenarioProb = 1
      for (let k = 0; k < scenario.length; k++) {
        scenarioProb *= games[gameCombination[k]].teams[scenario[k]].winProb
      }

      // Create a copy of games where we give our pick a 100% win probability
      const gamesCopy = deepcopy(games)
      for (let k = 0; k < scenario.length; k++) {
        gamesCopy[gameCombination[k]].teams[scenario[k]].winProb = 1
        gamesCopy[gameCombination[k]].teams[1 - scenario[k]].winProb = 0
      }

      const result = getBestPicks(gamesCopy, lockedGames)
      const [expectedPayout, winProbs] = getExpectedPayout(historicalStats, scenarioProb, result.net)

      if (expectedPayout > bestProb.payout) {
        // The net points data for each of the "assumed" picks is innacurate because we set the winProb to 1
        // Here, we need to recalculate the net points for each pick.
        result.picks.forEach((pick) => {
          pick.netPoints = calcNetResultPoints(games[pick.gameIndex], pick.pick, pick.rank, maxPoints)
        })
        result.net = result.picks.reduce((acc, pick) => acc + pick.netPoints.avg, 0)

        bestProb.payout = expectedPayout
        bestProb.picks = result.picks
        bestProb.net = result.net
        bestProb.winProbs = winProbs
      }
    }
  }

  loadingBar.update(progress++)
  loadingBar.stop()

  return bestProb
}
