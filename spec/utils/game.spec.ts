import { avgGamePoints } from '../../src/utils/game';
import { GameData } from '../../src/@types/gameData';

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

describe(avgGamePoints, () => {
  it('correctly calculates the average points bet on a game', () => {
    expect(avgGamePoints(testGame, 100)).toBe(1.75)
  })
})