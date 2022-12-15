import { displayPicks } from '@utils/display'
import { GameData, ResultPoints } from '@utils/game'
import { BestPicks } from '@picks/bestPicks'

const testGame: GameData[] =
[
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

const testPicks: BestPicks = { net: -2, picks: [[0, 16]] }

describe(displayPicks, () => {
  it('displays net points, expected payout, win probability', () => {
    let output = ''
    jest.spyOn(console, 'log').mockImplementation((log: string) => { output += log ?? '\n' })

    displayPicks(testGame, testOutcomes, testPicks, 2.45, [0.01, 0.02, 0.03])
    const expected = '     Away Team over Home Team          16 confidence     Win:    8.00     Loss:   -3.00     Net:    4.00' +
                    '' +
                    'Net Points Gained: -2.00' +
                    '' +
                    'First Place Probability: 0.0100' +
                    'Second Place Probability: 0.0200' +
                    'Third Place Probability: 0.0300' +
                    '' +
                    'Expected Payout: $2.45'

    expect(output).toBe(expected)
  })
})
