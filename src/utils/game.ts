import { GameData, ResultPoints } from "../@types/gameData";
import { OddsData } from "../@types/oddsData";
import { GameRank, OfpData } from "../@types/ofpData";
import spreadToWinPercent from "../data/spreadConversion";
import ofpTeamToOddsApiTeam from "../data/teamConversion";

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

export const mergeOfpAndOddsData = (ofpGames: OfpData, oddsGames: OddsData) => {
  return ofpGames.map((game) => {
    const away = game[0]
    const home = game[1]

    const matchingGame = oddsGames.find((game) => (
      ofpTeamToOddsApiTeam(away.team) == game.away_team.toLowerCase() && 
      ofpTeamToOddsApiTeam(home.team) == game.home_team.toLowerCase()
    ));

    if (!matchingGame) {
      throw new Error(`could not find a matching game for ${away.team} at ${home.team}`);
    }

    const spreads = matchingGame.bookmakers[0].markets[0].outcomes;
    const awaySpreadIndex = ofpTeamToOddsApiTeam(away.team) === spreads[0].name.toLowerCase() ? 0 : 1;
    const homeSpreadIndex = 1 - awaySpreadIndex;

    return [
      {
        name: away.team,
        pointDist: +away.pointsPercent.toFixed(3),
        winProb: +spreadToWinPercent(spreads[awaySpreadIndex].point).toFixed(3)
      },
      {
        name: home.team,
        pointDist: +home.pointsPercent.toFixed(3),
        winProb: +spreadToWinPercent(spreads[homeSpreadIndex].point).toFixed(3)
      }
    ]
  })
}
