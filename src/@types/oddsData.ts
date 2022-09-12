interface OutcomeData {
  name: string
  price: number
  point: number
}

interface MarketData {
  key: string
  outcomes: [OutcomeData, OutcomeData]
}

interface BookmakerData {
  key: string
  title: string
  markets: MarketData[]
}

export interface OddsData {
  home_team: string
  away_team: string
  bookmakers: BookmakerData[]
}
