interface OfpOutcome {
  team: string
  pointsPercent: number
  rank?: number
  won?: boolean
}

export type OfpData = [OfpOutcome, OfpOutcome][]
