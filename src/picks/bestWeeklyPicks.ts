import cliProgress from 'cli-progress'

import { GameData, calcNetResultPoints, getLockedGames, getMaxPoints } from '@utils/game'
import { BestProb, LockedGames, getBestPicks } from '@picks/bestPicks'
import { chooseK, getExpectedPayout, getWeeklyStats, possibleScenarios } from '@utils/stats'
import weeklyData from '@data/historicalWeeklyData.json'
import deepcopy from 'deepcopy'
import { AWAY, HOME, MAX_RANK } from '@config/constants'

/**
 * getBestWeeklyPicks finds the best picks for the week by iterating through all possible combinations of upsets
 * @param games The list of games for the week
 * @returns The best picks and payout for the week
 */
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

  // Establish a baseline by simulating aggressive early picks
  const bestProb = simulateEarlyPicks(games, lockedGames)

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

/**
 * SimulateEarlyPicks finds games that will conclude before the weekly lock-in time and simulates
 * what the expected payout would be if we placed an aggressive pick on that game.
 *
 * Ranking early games aggressively often give us a better expected payout because we can bet conservative
 * on the following games if our early bet hits, or we can bet more aggressively if our early bet misses.
 *
 * @param games The list of games for the week
 * @param lockedGames The list of games that have already been locked in
 * @returns The best picks and payout for an aggressive early pick.
 */
const simulateEarlyPicks = (games: GameData[], lockedGames: LockedGames): BestProb => {
  const earlyGameIndex = games.findIndex(({ early, locked }) => early && !locked)

  const best: BestProb = { payout: -1, net: Number.MIN_SAFE_INTEGER, picks: [], scenarioProb: 1, winProbs: [] }
  if (earlyGameIndex === -1) return best

  // Find the maximum available rank we can put on the game
  const lockedRanks = new Set(Object.values(lockedGames).map(({ rank }) => rank))
  let maxAvailableRank = 0
  for (let rank = MAX_RANK; rank > MAX_RANK - games.length; rank--) {
    if (!lockedRanks.has(rank)) {
      maxAvailableRank = rank
      break
    }
  }

  const gamesCopy = deepcopy(games)
  gamesCopy[earlyGameIndex].locked = true

  for (let pick = AWAY; pick <= HOME; pick++) {
    gamesCopy[earlyGameIndex].teams[pick].rank = maxAvailableRank
    gamesCopy[earlyGameIndex].teams[1 - pick].rank = undefined

    // Scenario 1: Our pick wins
    gamesCopy[earlyGameIndex].teams[pick].winProb = 1
    gamesCopy[earlyGameIndex].teams[1 - pick].winProb = 0
    const bestIfWin = getBestWeeklyPicks(gamesCopy)

    // Scenario 2: Our pick loses
    gamesCopy[earlyGameIndex].teams[pick].winProb = 0
    gamesCopy[earlyGameIndex].teams[1 - pick].winProb = 1
    const bestIfLoss = getBestWeeklyPicks(gamesCopy)

    // Calculate the expected payout for this pick
    const payout = bestIfWin.payout * games[earlyGameIndex].teams[pick].winProb + bestIfLoss.payout * games[earlyGameIndex].teams[1 - pick].winProb
    const net = bestIfWin.net * games[earlyGameIndex].teams[pick].winProb + bestIfLoss.net * games[earlyGameIndex].teams[1 - pick].winProb

    const winProbs = [0, 0, 0]
    for (let i = 0; i < bestIfWin.winProbs.length; i++) {
      winProbs[i] += bestIfWin.winProbs[i] * games[earlyGameIndex].teams[pick].winProb + bestIfLoss.winProbs[i] * games[earlyGameIndex].teams[1 - pick].winProb
    }

    if (payout > best.payout) {
      bestIfWin.picks[earlyGameIndex].netPoints = calcNetResultPoints(
        games[earlyGameIndex],
        pick,
        maxAvailableRank,
        getMaxPoints(games.length)
      )

      best.payout = payout
      best.net = net
      best.picks = bestIfWin.picks // The only pick that matters is the early game, the others will be recalculated later
      best.winProbs = winProbs
    }
  }

  return best
}
