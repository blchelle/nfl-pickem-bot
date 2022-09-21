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
  it('displays picks and net points', () => {
    let output = ''
    jest.spyOn(console, 'log').mockImplementation((log: string) => { output += log ?? '\n' })

    displayPicks(testGame, testOutcomes, testPicks)
    const expected = '     Away Team over Home Team          16 confidence     Win:    8.00     Loss:   -3.00     Net:    4.00\n' +
                     'Net Points Gained: -2.000'

    expect(output).toBe(expected)
  })

  it('displays win percentage, if given', () => {
    let output = ''
    jest.spyOn(console, 'log').mockImplementation((log: string) => { output += log ?? '\n' })

    displayPicks(testGame, testOutcomes, testPicks, 0.5)
    const expected = '     Away Team over Home Team          16 confidence     Win:    8.00     Loss:   -3.00     Net:    4.00\n' +
                    'Net Points Gained: -2.000' +
                    'Win Probability: 0.500'

    expect(output).toBe(expected)
  })
})
