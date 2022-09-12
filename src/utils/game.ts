import { GameData } from "../@types/gameData";

export const avgGamePoints = (game: GameData, totalPoints: number) => {
  const awayPoints = game[0].pointDist * game[0].winProb * totalPoints
  const homePoints = game[1].pointDist * game[1].winProb * totalPoints

  return +(awayPoints + homePoints).toFixed(3)
};
