import { displayPicks } from '@utils/display'
import { GameData } from '@utils/game'
import { BestPicks, BestProb } from '@picks/bestPicks'

const testGame: GameData[] =
[
  {
    bookmaker: 'none',
    gameIndex: 0,
    early: false,
    locked: false,
    teams: [
      { name: 'Away Team', pointDist: 0.01, winProb: 0.25 },
      { name: 'Home Team', pointDist: 0.02, winProb: 0.75 }
    ]
  }
]

const testPicks: BestPicks = {
  net: -2,
  picks: [
    {
      gameIndex: 0,
      pick: 0,
      rank: 16,
      netPoints: { avg: 4, lose: -3, win: 8 }
    }
  ]
}

describe(displayPicks, () => {
  it('displays net points, expected payout, win probability', () => {
    let output = ''
    jest.spyOn(console, 'log').mockImplementation((log: string) => { output += log ?? '\n' })

    const best: BestProb = {
      picks: testPicks.picks,
      payout: 2.45,
      winProbs: [0.01, 0.02, 0.03],
      net: -2,
      scenarioProb: 1
    }

    displayPicks(testGame, best)
    const expected = '     Away Team over Home Team          16 confidence     Bookmaker: none      Prob:    0.25     Win:    8.00     Loss:   -3.00     Net:    4.00' +
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
