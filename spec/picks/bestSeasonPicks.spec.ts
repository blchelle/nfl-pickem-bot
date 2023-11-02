import { GameData } from '@utils/game'
import { getBestSeasonPicks } from '@picks/bestSeasonPicks'
import { BestPicks } from './bestPicks'

const testGames: GameData[] =
[
  {
    bookmaker: 'none',
    gameIndex: 0,
    early: false,
    locked: false,
    teams: [
      { name: 'Away Team', pointDist: 0.2, winProb: 0.25 },
      { name: 'Home Team', pointDist: 0.3, winProb: 0.75 }
    ]
  },
  {
    bookmaker: 'none',
    gameIndex: 1,
    early: false,
    locked: false,
    teams: [
      { name: 'Away Team', pointDist: 0.3, winProb: 0.55 },
      { name: 'Home Team', pointDist: 0.2, winProb: 0.45 }
    ]
  }
]

describe(getBestSeasonPicks, () => {
  it('returns the picks and the weekly win percentage', () => {
    const best = getBestSeasonPicks(testGames)
    const expected: BestPicks = {
      net: 3.82,
      picks: [
        { gameIndex: 0, netPoints: { avg: 3.475, win: 6.7, lose: -6.2 }, pick: 1, rank: 16 },
        { gameIndex: 1, netPoints: { avg: 0.345, win: 5.7, lose: -6.2 }, pick: 0, rank: 15 }
      ]
    }

    expect(best.net).toBeCloseTo(expected.net)
    expect(best.picks).toStrictEqual(expected.picks)
  })
})
