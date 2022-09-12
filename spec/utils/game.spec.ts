import { calcAvgGamePoints, calcNetResultPoints } from '../../src/utils/game';
import { GameData, ResultPoints } from '../../src/@types/gameData';

const testGame: GameData = [
  {
    name: 'Away Team',
    pointDist: 0.01,
    winProb: 0.25,
  },
  {
    name: 'Home Team',
    pointDist: 0.02,
    winProb: 0.75,
  },
]

describe(calcAvgGamePoints, () => {
  it('calculates the average points bet on a game', () => {
    expect(calcAvgGamePoints(testGame, 100)).toBe(1.75)
  })
})

describe(calcNetResultPoints, () => {
  it ('calculates the point results for a win, loss, and avg for 1 seed', () => {
    const expected: ResultPoints = { avg: -1.5, lose: -1.75, win: -0.75 }
    expect(calcNetResultPoints(testGame, 0, 1, 100)).toStrictEqual(expected)
  })

  it ('calculates the point results for a win, loss, and avg for 16 seed', () => {
    const expected: ResultPoints = { avg: 2.25, lose: -1.75, win: 14.25 }
    expect(calcNetResultPoints(testGame, 0, 16, 100)).toStrictEqual(expected)
  })
})
