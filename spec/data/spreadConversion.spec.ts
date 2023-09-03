import noVigOdds from '@data/moneylineConversion'

describe(noVigOdds, () => {
  it('gives 50% odds when the price is the same', () => {
    expect(noVigOdds(1.95, 1.95)).toEqual([0.5, 0.5])
  })
})
