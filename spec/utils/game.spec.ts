import { calcNetResultPoints, getLockedGames, mergeOfpAndOddsData, GameData, ResultPoints } from '@utils/game'
import { OfpData } from '@webscraper/getData'
import { OddsData } from '@service/odds'

const testGame: GameData = {
  gameIndex: 0,
  early: false,
  locked: false,
  teams: [
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
}

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
    commence_time: '2020-12-20T18:05:00Z',
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
      {
        gameIndex: 0,
        early: false,
        locked: false,
        teams: [
          { name: 'la rams', pointDist: 0.03, winProb: 0.56 },
          { name: 'ny jets', pointDist: 0.03, winProb: 0.44 }
        ]
      }
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
    {
      gameIndex: 0,
      early: false,
      locked: false,
      teams: [
        { name: 'Away Team 0', pointDist: 0.3, winProb: 0.70 },
        { name: 'Home Team 0', pointDist: 0.1, winProb: 0.30 }
      ]
    },
    {
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

describe(getLockedGames, () => {
  it('returns an empty map for no fixed games', () => {
    expect(getLockedGames(testGames)).toStrictEqual({})
  })

  it('returns a mapping of fixed games and ranks', () => {
    testGames[0].teams[0].rank = 5
    testGames[0].teams[0].winProb = 0
    testGames[0].teams[1].winProb = 1
    testGames[0].locked = true

    expect(getLockedGames(testGames)).toStrictEqual({ 0: { rank: 5, pick: 0 } })
  })
})
