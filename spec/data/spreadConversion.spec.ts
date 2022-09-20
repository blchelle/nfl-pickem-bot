import spreadToWinPercent from '@data/spreadConversion'

describe(spreadToWinPercent, () => {
  it('gives a 0.5 win chance when spread is 0', () => {
    expect(spreadToWinPercent(0)).toBe(0.5)
  })

  it('gives a 0 win chance when spread is 17', () => {
    expect(spreadToWinPercent(17)).toBe(0)
  })

  it('gives a 0 win chance when spread is greater than 17', () => {
    expect(spreadToWinPercent(20)).toBe(0)
  })

  it('gives a 1 win chance when spread is -17', () => {
    expect(spreadToWinPercent(-17)).toBe(1)
  })

  it('gives a 1 win chance when spread is less than -17', () => {
    expect(spreadToWinPercent(-20)).toBe(1)
  })
})
