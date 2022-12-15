import { WEEKLY_PAYOUTS } from '@config/constants'

export const chooseK = (arr: number[], k: number, prefix: number[] = []): number[][] => {
  if (k === 0) return [prefix]
  return arr.flatMap((v, i) => chooseK(arr.slice(i + 1), k - 1, [...prefix, v]))
}

export const possibleScenarios = (n: number, options: number[] = [0, 1]): number[][] => {
  if (n === 0) return [[]]

  const scenarios = []
  for (let i = 0; i < options.length; i++) {
    scenarios.push(...possibleScenarios(n - 1).map((s) => [options[i], ...s]))
  }

  return scenarios
}

export const zScoreToProb = (zScore: number): number => {
  if (zScore < -6.5) return 0
  if (zScore > 6.5) return 1

  let factK = 1
  let sum = 0
  let term = 1
  let k = 0
  const loopStop = Math.exp(-23)

  while (Math.abs(term) > loopStop) {
    term = 0.3989422804 * Math.pow(-1, k) * Math.pow(zScore, k) / (2 * k + 1) / Math.pow(2, k) * Math.pow(zScore, k + 1) / factK
    sum += term
    k++
    factK *= k
  }

  sum += 0.5
  return sum
}

interface WeeklyStats {
  // The average points above average for each money position
  meanMoneyPointsDelta: number[]

  // The std of average points above average for each money position
  stdMoneyPointsDelta: number[]
}

const average = (array: number[]): number => {
  return array.reduce((mean, num, i) => (mean * i + num) / (i + 1), 0)
}

const std = (array: number[], avg: number): number => {
  const sumOfSquareDeltas = array.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0)
  return Math.sqrt(sumOfSquareDeltas / (array.length - 1))
}

export const getWeeklyStats = (weeklyScores: number[][]): WeeklyStats => {
  // Calculate the mean and std for each week
  const weeklyMeans = weeklyScores.map((scores) => average(scores))

  // Calculate the distance from each money winning position to the weekly average
  const firstPlaceDeltas = weeklyScores.map((scores, i) => scores[0] - weeklyMeans[i])
  const secondPlaceDeltas = weeklyScores.map((scores, i) => scores[1] - weeklyMeans[i])
  const thirdPlaceDeltas = weeklyScores.map((scores, i) => scores[2] - weeklyMeans[i])

  // Calculate the mean delta for each money winning position
  const meanFirstPlaceDelta = average(firstPlaceDeltas)
  const meanSecondPlaceDelta = average(secondPlaceDeltas)
  const meanThirdPlaceDelta = average(thirdPlaceDeltas)

  // Calculate the standard deviation for mean deltas for each money winning position
  const stdFirstPlaceDelta = std(firstPlaceDeltas, meanFirstPlaceDelta)
  const stdSecondPlaceDelta = std(secondPlaceDeltas, meanSecondPlaceDelta)
  const stdThirdPlaceDelta = std(thirdPlaceDeltas, meanThirdPlaceDelta)

  return {
    meanMoneyPointsDelta: [
      meanFirstPlaceDelta,
      meanSecondPlaceDelta,
      meanThirdPlaceDelta
    ],
    stdMoneyPointsDelta: [
      stdFirstPlaceDelta,
      stdSecondPlaceDelta,
      stdThirdPlaceDelta
    ]
  }
}

export const getExpectedPayout = (historicalStats: WeeklyStats, scenarioProb: number, netPoints: number): [number, number[]] => {
  let expectedPayout = 0
  const winProbs: number[] = []

  // Calculate an expected payout for each placement
  for (let place = 0; place < WEEKLY_PAYOUTS.length; place++) {
    const targetDiff = netPoints - historicalStats.meanMoneyPointsDelta[place]
    const zScore = targetDiff / historicalStats.stdMoneyPointsDelta[place]
    const winProb = zScoreToProb(zScore)
    const positionProb = Math.max((winProb * scenarioProb) - winProbs.reduce((sum, curr) => sum + curr, 0), 0)

    expectedPayout += positionProb * WEEKLY_PAYOUTS[place]
    winProbs.push(positionProb)
  }

  return [expectedPayout, winProbs]
}
