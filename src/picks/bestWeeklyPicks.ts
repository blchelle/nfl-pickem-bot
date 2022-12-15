import cliProgress from 'cli-progress'

import { getFixedGames, GameData, ResultPoints } from '@utils/game'
import { BestPicks, GameToPick, getBestPicks } from '@picks/bestPicks'
import { MAX_RANK } from '@config/constants'
import { chooseK, getExpectedPayout, getWeeklyStats, possibleScenarios } from '@utils/stats'
import weeklyData from '@data/historicalWeeklyData.json'

interface BestProb {
  payout: number
  scenarioProb: number
  winProbs: number[]
  net: number
  games: number[]
  picks: BestPicks
}

export const getBestWeeklyPicks = (games: GameData[], outcomes: ResultPoints[][][]): [BestPicks, number, number[]] => {
  const [fixedGames, fixedRanks] = getFixedGames(games)
  const ranksLeft = new Array(games.length).fill(null).map((_, i) => MAX_RANK - i).filter((rank) => !fixedRanks.has(rank))
  const gameIndexes = new Array(games.length).fill(null).map((_, i) => i).filter((i) => fixedGames[i] === undefined)

  const historicalWeeklyScores = weeklyData.map((week) => week.scores)
  const historicalStats = getWeeklyStats(historicalWeeklyScores)

  let totalIterations = 0
  const combinations = []
  for (let i = 1; i <= 2; i++) {
    const kCombinations = chooseK(gameIndexes, i)
    totalIterations += kCombinations.length * Math.pow(2, i)
    combinations.push(...kCombinations)
  }

  const loadingBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  loadingBar.start(totalIterations, 0)
  let progress = 0

  // Find the best combination, pick combo that maximizes expected money
  const bestProb: BestProb = { payout: 0, net: Number.MIN_SAFE_INTEGER, games: [], picks: { net: Number.MIN_SAFE_INTEGER, picks: [] }, scenarioProb: 0, winProbs: [] }
  for (let i = 0; i < combinations.length; i++) {
    const gameCombination = combinations[i]
    const allScenarios = possibleScenarios(gameCombination.length)

    for (let j = 0; j < allScenarios.length; j++) {
      loadingBar.update(progress++)
      const scenario = allScenarios[j]

      let scenarioProb = 1
      for (let k = 0; k < scenario.length; k++) {
        scenarioProb *= games[gameCombination[k]][scenario[k]].winProb
      }

      const fixed: GameToPick = gameCombination.reduce((acc: GameToPick, curr, i) => ({ ...acc, [curr]: { pick: scenario[i], rank: ranksLeft[i], won: 1 } }), fixedGames)
      const ranksTaken: Set<number> = new Set(Object.values(fixed).map(({ rank }) => rank))
      const result = getBestPicks(outcomes, 0, fixed, ranksTaken)
      const [expectedPayout, winProbs] = getExpectedPayout(historicalStats, scenarioProb, result.net)

      if (expectedPayout > bestProb.payout) {
        bestProb.payout = expectedPayout
        bestProb.games = gameCombination
        bestProb.picks = result
        bestProb.net = result.net
        bestProb.winProbs = winProbs
      }
    }
  }

  loadingBar.update(progress++)
  loadingBar.stop()

  return [bestProb.picks, bestProb.payout, bestProb.winProbs]
}
