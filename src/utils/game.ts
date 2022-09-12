import { GameData, ResultPoints } from "../@types/gameData";
import { GameRank } from "../@types/ofpData";

export const calcAvgGamePoints = (game: GameData, totalPoints: number) => {
  const awayPoints = game[0].pointDist * game[0].winProb * totalPoints;
  const homePoints = game[1].pointDist * game[1].winProb * totalPoints;

  return +(awayPoints + homePoints).toFixed(3);
};

export const calcNetResultPoints = (game: GameData, pick: 0 | 1, rank: GameRank, totalPoints: number): ResultPoints => {
  const avgGamePoints = calcAvgGamePoints(game, totalPoints);

  const win = rank - avgGamePoints;
  const lose = -avgGamePoints;
  const avg = win * game[pick].winProb + lose * game[1 - pick].winProb;

  return { avg, lose, win };
};
