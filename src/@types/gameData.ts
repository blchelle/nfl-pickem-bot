interface TeamData {
  name: string
  pointDist: number
  winProb: number
};

export type GameData = [TeamData, TeamData];
