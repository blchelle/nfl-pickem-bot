import { chooseK, possibleScenarios, zScoreToProb } from '../../src/utils/stats'

describe(chooseK, () => {
  it('works with choose 0', () => {
    expect(chooseK([1, 2, 3], 0)).toStrictEqual([[]])
  })

  it('works with choose 1', () => {
    expect(chooseK([1, 2, 3], 1)).toStrictEqual([[1], [2], [3]])
  })

  it('works with choose 2', () => {
    expect(chooseK([1, 2, 3], 2)).toStrictEqual([[1, 2], [1, 3], [2, 3]])
  })

  it('works with choose 3', () => {
    expect(chooseK([1, 2, 3], 3)).toStrictEqual([[1, 2, 3]])
  })
})

describe(possibleScenarios, () => {
  it('works for n = 1', () => {
    expect(possibleScenarios(0)).toStrictEqual([[]])
  })

  it('works for n = 1', () => {
    expect(possibleScenarios(1)).toStrictEqual([[0], [1]])
  })

  it('works for n = 2', () => {
    expect(possibleScenarios(2)).toStrictEqual([[0, 0], [0, 1], [1, 0], [1, 1]])
  })
})

describe(zScoreToProb, () => {
  it('gives 0 for a zScore less than -6.5', () => {
    expect(zScoreToProb(-7)).toBe(0)
  })

  it('gives 1 for a zScore greater than 6.5', () => {
    expect(zScoreToProb(7)).toBe(1)
  })

  it('gives 0.5 for a zScore of 0', () => {
    expect(zScoreToProb(0)).toBe(0.5)
  })
})
