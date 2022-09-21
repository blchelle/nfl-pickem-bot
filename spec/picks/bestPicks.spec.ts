import { ResultPoints } from '@utils/game'
import { getBestPicks } from '@picks/bestPicks'

const testOutcomes: ResultPoints[][][] = [
  [
    [
      { avg: 3.76, lose: -3.1, win: 6.7 },
      { avg: -2.64, lose: -9.3, win: 12.9 }
    ],
    [
      { avg: 3.06, lose: -3.1, win: 5.7 },
      { avg: -2.94, lose: -9.3, win: 11.9 }
    ]
  ],
  [
    [
      { avg: -3.52, lose: -12.4, win: 9.8 },
      { avg: -0.32, lose: -6.2, win: 3.6 }
    ],
    [
      { avg: -3.92, lose: -12.4, win: 8.8 },
      { avg: -0.92, lose: -6.2, win: 2.6 }
    ]
  ]
]

describe(getBestPicks, () => {
  it('gets best picks with no fixed games', () => {
    const expected = { net: 2.84, picks: [[0, 16], [1, 15]] }
    expect(getBestPicks(testOutcomes)).toStrictEqual(expected)
  })

  it('gets best picks with some fixed games', () => {
    const fixedGames = { 0: { pick: 1, rank: 16, won: 0 } }
    const fixedSeeds = new Set([16])

    const expected = { net: -10.22, picks: [[1, 16], [1, 15]] }
    expect(getBestPicks(testOutcomes, 0, fixedGames, fixedSeeds)).toStrictEqual(expected)
  })
})
