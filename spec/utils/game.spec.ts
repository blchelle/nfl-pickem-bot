import { calcNetResultPoints, generateOutcomes, getFixedGames, mergeOfpAndOddsData, GameData, ResultPoints } from '@utils/game'
import { OfpData } from '@webscraper/getData'
import { OddsData } from '@service/odds'

const testGame: GameData = [
  {
    name: 'Away Team',
    pointDist: 0.01,
    winProb: 0.25,
    locked: false
  },
  {
    name: 'Home Team',
    pointDist: 0.02,
    winProb: 0.75,
    locked: false
  }
]

describe(calcNetResultPoints, () => {
  it('calculates the point results for a win, loss, and avg for 1 seed', () => {
    const expected: ResultPoints = { avg: -1.5, lose: -2, win: 0 }
    expect(calcNetResultPoints(testGame, 0, 1, 100)).toStrictEqual(expected)
  })

  it('calculates the point results for a win, loss, and avg for 16 seed', () => {
    const expected: ResultPoints = { avg: 2.25, lose: -2, win: 15 }
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
              { name: 'Los Angeles Rams', price: 1.7 },
              { name: 'New York Jets', price: 2.16 }
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
        { name: 'la rams', pointDist: 0.03, winProb: 0.56, locked: false },
        { name: 'ny jets', pointDist: 0.03, winProb: 0.44, locked: false }
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

let testGames: GameData[] = []
beforeEach(() => {
  testGames = [
    [
      { name: 'Away Team 0', pointDist: 0.3, winProb: 0.70, locked: false },
      { name: 'Home Team 0', pointDist: 0.1, winProb: 0.30, locked: false }
    ],
    [
      { name: 'Away Team 1', pointDist: 0.2, winProb: 0.40, locked: false },
      { name: 'Home Team 1', pointDist: 0.4, winProb: 0.60, locked: false }
    ]
  ]
})

describe(getFixedGames, () => {
  it('returns an empty map and set for no fixed games', () => {
    expect(getFixedGames(testGames)).toStrictEqual([{}, new Set()])
  })

  it('returns a mapping of fixed games and ranks', () => {
    testGames[0][0].rank = 5
    testGames[0][0].winProb = 0
    testGames[0][1].winProb = 1
    testGames[0][1].locked = true
    testGames[0][0].locked = true

    expect(getFixedGames(testGames)).toStrictEqual([{ 0: { rank: 5, won: 0, pick: 0 } }, new Set([5])])
  })
})

describe(generateOutcomes, () => {
  it('generates point outcomes for every team and rank choice', () => {
    const expected = [
      [
        [
          { avg: 3.76, lose: -3.1, win: 6.7 },
          { avg: -2.64, lose: -9.3, win: 12.9 }
        ],
        [
          { avg: 3.06, lose: -3.1, win: 5.7 },
          { avg: -2.94, lose: -9.3, win: 11.9 }
        ]
      ],
      [
        [
          { avg: -3.52, lose: -12.4, win: 9.8 },
          { avg: -0.32, lose: -6.2, win: 3.6 }
        ],
        [
          { avg: -3.92, lose: -12.4, win: 8.8 },
          { avg: -0.92, lose: -6.2, win: 2.6 }
        ]
      ]
    ]

    expect(generateOutcomes(testGames)).toStrictEqual(expected)
  })
})
