interface OutcomeData {
  name: string
  point: number
}

interface MarketData {
  outcomes: [OutcomeData, OutcomeData]
}

interface BookmakerData {
  markets: MarketData[]
}

interface OddsGameData {
  home_team: string
  away_team: string
  bookmakers: BookmakerData[]
}

export type OddsData = OddsGameData[]
