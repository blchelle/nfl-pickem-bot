import { getBestWeeklyPicks } from '@picks/bestWeeklyPicks'

const testGames = [
  [
    { name: 'Away Team 0', pointDist: 0.3, winProb: 0.70 },
    { name: 'Home Team 0', pointDist: 0.1, winProb: 0.30 }
  ],
  [
    { name: 'Away Team 1', pointDist: 0.2, winProb: 0.40 },
    { name: 'Home Team 1', pointDist: 0.4, winProb: 0.60 }
  ]
]

const testOutcomes = [
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

describe(getBestWeeklyPicks, () => {
  it('picks the games that maximize weekly win chance', () => {
    const [picks, winChance] = getBestWeeklyPicks(testGames, testOutcomes)

    expect(picks).toStrictEqual({ net: 11.98, picks: [[1, 16], [1, 15]] })
    expect(winChance).toBeCloseTo(0.072)
  })
})
