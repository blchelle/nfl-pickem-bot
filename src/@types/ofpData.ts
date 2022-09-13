export type GameRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16

interface OfpOutcome {
  team: string
  pointsPercent: number
  rank?: GameRank
  won?: boolean
}

export type OfpData = Array<[OfpOutcome, OfpOutcome]>
