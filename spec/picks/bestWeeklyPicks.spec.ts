import { getBestWeeklyPicks } from '@picks/bestWeeklyPicks'
import { Pick } from '@picks/bestPicks'
import { GameData } from '@utils/game'

describe(getBestWeeklyPicks, () => {
  let testGames: GameData[]

  beforeEach(() => {
    testGames = [
      {
        bookmaker: 'none',
        gameIndex: 0,
        early: false,
        locked: false,
        teams: [
          { name: 'Away Team 0', pointDist: 0.3, winProb: 0.70 },
          { name: 'Home Team 0', pointDist: 0.1, winProb: 0.30 }
        ]
      },
      {
        bookmaker: 'none',
        gameIndex: 1,
        early: false,
        locked: false,
        teams: [
          { name: 'Away Team 1', pointDist: 0.2, winProb: 0.40 },
          { name: 'Home Team 1', pointDist: 0.4, winProb: 0.60 }
        ]
      }
    ]
  })

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

  it('can pick aggressively on early games', () => {
    testGames[0].early = true

    const expected: Pick[] = [
      {
        gameIndex: 0,
        netPoints: { avg: -2.64, win: 12.9, lose: -9.3 },
        pick: 1,
        rank: 16
      },
      {
        gameIndex: 1,
        netPoints: { avg: -3.92, win: 8.8, lose: -12.4 },
        pick: 0,
        rank: 15
      }
    ]

    const best = getBestWeeklyPicks(testGames)
    expect(best.picks).toStrictEqual(expected)
  })
})
