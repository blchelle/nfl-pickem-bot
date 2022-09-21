import cliProgress from 'cli-progress'

import { getFixedGames, GameData, ResultPoints } from '@utils/game'
import { BestPicks, GameToPick, getBestPicks } from '@picks/bestPicks'
import { AVG_STANDARD_DEVIATION, MAX_RANK, NET_TARGET } from '@config/constants'
import { chooseK, possibleScenarios, zScoreToProb } from '@utils/stats'

interface BestProb {
  prob: number
  scenarioProb: number
  winProb: number
  net: number
  games: number[]
  picks: BestPicks
}

export const getBestWeeklyPicks = (games: GameData[], outcomes: ResultPoints[][][]): [BestPicks, number] => {
  const [fixedGames, fixedRanks] = getFixedGames(games)
  const ranksLeft = new Array(games.length).fill(null).map((_, i) => MAX_RANK - i).filter((rank) => !fixedRanks.has(rank))
  const gameIndexes = new Array(games.length).fill(null).map((_, i) => i).filter((i) => fixedGames[i] === undefined)

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

  // Find the best combination, pick combo that maximizes win percentage
  const bestProb: BestProb = { prob: 0, net: Number.MIN_SAFE_INTEGER, games: [], picks: { net: Number.MIN_SAFE_INTEGER, picks: [] }, scenarioProb: 0, winProb: 0 }
  for (let i = 0; i < combinations.length; i++) {
    const gameCombination = combinations[i]
    const allScenarios = possibleScenarios(gameCombination.length)

    for (let j = 0; j < allScenarios.length; j++) {
      loadingBar.update(progress++)
      const scenario = allScenarios[j]

      let probability = 1
      for (let k = 0; k < scenario.length; k++) {
        probability *= games[gameCombination[k]][scenario[k]].winProb
      }

      if (probability < bestProb.prob) continue

      const fixed: GameToPick = gameCombination.reduce((acc: GameToPick, curr, i) => ({ ...acc, [curr]: { pick: scenario[i], rank: ranksLeft[i], won: 1 } }), fixedGames)
      const ranksTaken: Set<number> = new Set(Object.values(fixed).map(({ rank }) => rank))
      const result = getBestPicks(outcomes, 0, fixed, ranksTaken)

      const targetDiff = result.net - NET_TARGET
      const zScore = targetDiff / AVG_STANDARD_DEVIATION
      const winProb = zScoreToProb(zScore)
      const scenarioProb = probability

      probability *= winProb

      if (probability > bestProb.prob) {
        bestProb.prob = probability
        bestProb.scenarioProb = scenarioProb
        bestProb.winProb = winProb
        bestProb.games = gameCombination
        bestProb.picks = result
        bestProb.net = result.net
      }
    }
  }

  loadingBar.update(progress++)
  loadingBar.stop()

  return [bestProb.picks, bestProb.prob]
}
