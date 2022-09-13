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
