import { getBestWeeklyPicks } from '@picks/bestWeeklyPicks'
import { Pick } from '@picks/bestPicks'

const testGames = [
  {
    gameIndex: 0,
    teams: [
      { name: 'Away Team 0', pointDist: 0.3, winProb: 0.70, locked: false },
      { name: 'Home Team 0', pointDist: 0.1, winProb: 0.30, locked: false }
    ]
  },
  {
    gameIndex: 1,
    teams: [
      { name: 'Away Team 1', pointDist: 0.2, winProb: 0.40, locked: false },
      { name: 'Home Team 1', pointDist: 0.4, winProb: 0.60, locked: false }
    ]
  }
]

describe(getBestWeeklyPicks, () => {
  it('picks the games that maximize weekly win chance', () => {
    const expected: Pick[] = [
      {
        gameIndex: 0,
        netPoints: { avg: -2.94, win: 11.9, lose: -9.3 },
        pick: 1,
        rank: 15
      },
      {
        gameIndex: 1,
        netPoints: { avg: -3.52, win: 9.8, lose: -12.4 },
        pick: 0,
        rank: 16
      }
    ]

    const best = getBestWeeklyPicks(testGames)

    expect(best.picks).toStrictEqual(expected)
  })
})
