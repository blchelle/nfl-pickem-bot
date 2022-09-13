import { calcAvgGamePoints, calcNetResultPoints, generateOutcomes, mergeOfpAndOddsData } from '../../src/utils/game'
import { GameData, ResultPoints } from '../../src/@types/gameData'
import { OfpData } from '../../src/@types/ofpData'
import { OddsData } from '../../src/@types/oddsData'

const testGame: GameData = [
  {
    name: 'Away Team',
    pointDist: 0.01,
    winProb: 0.25
  },
  {
    name: 'Home Team',
    pointDist: 0.02,
    winProb: 0.75
  }
]

describe(calcAvgGamePoints, () => {
  it('calculates the average points bet on a game', () => {
    expect(calcAvgGamePoints(testGame, 100)).toBe(1.75)
  })
})

describe(calcNetResultPoints, () => {
  it('calculates the point results for a win, loss, and avg for 1 seed', () => {
    const expected: ResultPoints = { avg: -1.5, lose: -1.75, win: -0.75 }
    expect(calcNetResultPoints(testGame, 0, 1, 100)).toStrictEqual(expected)
  })

  it('calculates the point results for a win, loss, and avg for 16 seed', () => {
    const expected: ResultPoints = { avg: 2.25, lose: -1.75, win: 14.25 }
    expect(calcNetResultPoints(testGame, 0, 16, 100)).toStrictEqual(expected)
  })
})

const testOfpData: OfpData = [
  [
    { team: 'la rams', pointsPercent: 0.03 },
    { team: 'ny jets', pointsPercent: 0.03 }
  ]
]

const testOddsData: OddsData = [
  {
    away_team: 'Los Angeles Rams',
    home_team: 'New York Jets',
    bookmakers: [
      {
        markets: [
          {
            outcomes: [
              { name: 'Los Angeles Rams', point: -7 },
              { name: 'New York Jets', point: 7 }
            ]
          }
        ]
      }
    ]
  }
]

describe(mergeOfpAndOddsData, () => {
  let expected: GameData[]

  beforeEach(() => {
    expected = [
      [
        { name: 'la rams', pointDist: 0.03, winProb: 0.752 },
        { name: 'ny jets', pointDist: 0.03, winProb: 0.248 }
      ]
    ]
  })

  it('merges data when matches are found for all games', () => {
    expect(mergeOfpAndOddsData(testOfpData, testOddsData)).toStrictEqual(expected)
  })

  it('merges data when spread outcomes have a flipped order', () => {
    // Swaps the ordering of the outcomes to ensure that it works either way
    const outcomes = testOddsData[0].bookmakers[0].markets[0].outcomes
    const temp = outcomes[0]
    outcomes[0] = outcomes[1]
    outcomes[1] = temp

    expect(mergeOfpAndOddsData(testOfpData, testOddsData)).toStrictEqual(expected)
  })

  it('merges data when team names have different casing', () => {
    testOddsData[0].away_team = 'los Angeles rams'

    expect(mergeOfpAndOddsData(testOfpData, testOddsData)).toStrictEqual(expected)
  })

  it('exits when home and away teams are flipped', () => {
    testOddsData[0].home_team = 'los angeles rams'
    testOddsData[0].away_team = 'new york jets'

    expect(() => mergeOfpAndOddsData(testOfpData, testOddsData)).toThrow()
  })

  it('exits when no odds can be found for any game', () => {
    testOddsData[0].home_team = 'edmonton oilers'
    expect(() => mergeOfpAndOddsData(testOfpData, testOddsData)).toThrow()
  })
})

const testGames: GameData[] = [
  [
    { name: 'Away Team 0', pointDist: 0.3, winProb: 0.70 },
    { name: 'Home Team 0', pointDist: 0.1, winProb: 0.30 }
  ],
  [
    { name: 'Away Team 1', pointDist: 0.2, winProb: 0.40 },
    { name: 'Home Team 1', pointDist: 0.4, winProb: 0.60 }
  ]
]

describe(generateOutcomes, () => {
  it('generates point outcomes for every team and rank choice', () => {
    const expected = [
      [
        [
          { avg: 3.76, lose: -7.44, win: 8.56 },
          { avg: -2.64, lose: -7.44, win: 8.56 }
        ],
        [
          { avg: 3.06, lose: -7.44, win: 7.56 },
          { avg: -2.94, lose: -7.44, win: 7.56 }
        ]
      ],
      [
        [
          { avg: -3.52, lose: -9.92, win: 6.08 },
          { avg: -0.32, lose: -9.92, win: 6.08 }
        ],
        [
          { avg: -3.92, lose: -9.92, win: 5.08 },
          { avg: -0.92, lose: -9.92, win: 5.08 }
        ]
      ]
    ]

    expect(generateOutcomes(testGames)).toStrictEqual(expected)
  })
})
