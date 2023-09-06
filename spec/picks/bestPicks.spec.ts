import { BestPicks, LockedGames, getBestPicks } from '@picks/bestPicks'
import { GameData } from '@utils/game'

const testGames: GameData[] =
[
  {
    gameIndex: 0,
    teams: [
      { name: 'Away Team', pointDist: 0.2, winProb: 0.25, locked: false },
      { name: 'Home Team', pointDist: 0.3, winProb: 0.75, locked: false }
    ]
  },
  {
    gameIndex: 1,
    teams: [
      { name: 'Away Team', pointDist: 0.3, winProb: 0.55, locked: false },
      { name: 'Home Team', pointDist: 0.2, winProb: 0.45, locked: false }
    ]
  }
]
describe(getBestPicks, () => {
  it('gets best picks with no locked games', () => {
    const expected: BestPicks = {
      net: 3.82,
      picks: [
        { gameIndex: 0, netPoints: { avg: 3.475, win: 6.7, lose: -6.2 }, pick: 1, rank: 16 },
        { gameIndex: 1, netPoints: { avg: 0.345, win: 5.7, lose: -6.2 }, pick: 0, rank: 15 }
      ]
    }
    const result = getBestPicks(testGames)

    expect(result.net).toBeCloseTo(expected.net)
    expect(result.picks).toStrictEqual(expected.picks)
  })

  it('gets best picks with some locked games', () => {
    const lockedGames: LockedGames = { 0: { pick: 1, rank: 16 } }

    const expected: BestPicks = {
      net: 3.82,
      picks: [
        {
          gameIndex: 0,
          netPoints: { avg: 3.475, lose: -6.2, win: 6.7 },
          pick: 1,
          rank: 16
        },
        {
          gameIndex: 1,
          netPoints: { avg: 0.345, lose: -6.2, win: 5.7 },
          pick: 0,
          rank: 15
        }
      ]
    }
    const actual = getBestPicks(testGames, lockedGames)

    expect(actual.net).toBeCloseTo(expected.net)
    expect(actual.picks).toStrictEqual(expected.picks)
  })
})
