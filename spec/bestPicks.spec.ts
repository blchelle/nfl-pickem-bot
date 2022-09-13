import { ResultPoints } from "../src/@types/gameData"
import { getBestPicks } from "../src/bestPicks"

const testOutcomes: ResultPoints[][][] = [
  [
    [
      { avg: 4, lose: -3, win: 8 },
      { avg: 3, lose: -3, win: 8 },
    ],
    [
      { avg: 3.5, lose: -3, win: 7 },
      { avg: 2.5, lose: -3, win: 7 },
    ]
  ],
  [
    [
      { avg: 1.5, lose: -1, win: 9 },
      { avg: 2, lose: -1, win: 9 },
    ],
    [
      { avg: 0.5, lose: -1, win: 8 },
      { avg: 1, lose: -1, win: 8 },
    ]
  ]
]

describe(getBestPicks, () => {
  it('gets best picks with no fixed games', () => {
    const  expected = { net: 5.5,picks: [[0, 15], [1, 16]] };
    expect(getBestPicks(testOutcomes)).toStrictEqual(expected)
  })

  it('gets best picks with some fixed games', () => {
    const fixedGames = { 0: { pick: 1, rank: 16, won: 0 } }
    const fixedSeeds = new Set([16])

    const expected = { net: -2, picks: [[1, 16], [1, 15]] };
    expect(getBestPicks(testOutcomes, 0, fixedGames, fixedSeeds)).toStrictEqual(expected)
  })
})
