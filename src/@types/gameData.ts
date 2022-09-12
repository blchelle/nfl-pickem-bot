interface TeamData {
  name: string
  pointDist: number
  winProb: number
};

export type GameData = [TeamData, TeamData];

export interface ResultPoints {
  avg: number,
  lose: number,
  win: number
};
