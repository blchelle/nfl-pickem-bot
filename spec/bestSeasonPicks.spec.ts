import { GameData, ResultPoints } from '../src/@types/gameData'
import { getBestSeasonPicks } from '../src/bestSeasonPicks'

const testGames: GameData[] =
[
  [
    { name: 'Away Team', pointDist: 0.01, winProb: 0.25 },
    { name: 'Home Team', pointDist: 0.02, winProb: 0.75 }
  ],
  [
    { name: 'Away Team', pointDist: 0.01, winProb: 0.25 },
    { name: 'Home Team', pointDist: 0.02, winProb: 0.75 }
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
    const [picks, winChance] = getBestSeasonPicks(testGames, testOutcomes)

    expect(picks).toStrictEqual({ net: 4, picks: [[0, 16]] })
    expect(winChance).toBeCloseTo(0.073)
  })
})
