import { GameData, ResultPoints } from '@utils/game'
import { getBestSeasonPicks } from '@picks/bestSeasonPicks'

const testGames: GameData[] =
[
  [
    { name: 'Away Team', pointDist: 0.01, winProb: 0.25, locked: false },
    { name: 'Home Team', pointDist: 0.02, winProb: 0.75, locked: false }
  ],
  [
    { name: 'Away Team', pointDist: 0.01, winProb: 0.25, locked: false },
    { name: 'Home Team', pointDist: 0.02, winProb: 0.75, locked: false }
  ]
]

const testOutcomes: ResultPoints[][][] = [
  [
    [
      { avg: 4, lose: -3, win: 8 },
      { avg: 3, lose: -3, win: 8 }
    ]
  ]
]

describe(getBestSeasonPicks, () => {
  it('returns the picks and the weekly win percentage', () => {
    const [picks] = getBestSeasonPicks(testGames, testOutcomes)

    expect(picks).toStrictEqual({ net: 4, picks: [[0, 16]] })
  })
})
