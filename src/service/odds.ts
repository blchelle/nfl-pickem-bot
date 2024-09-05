import axios from 'axios'
import env from '@config/env'
import { buildUrl } from '@utils/url'

interface OutcomeData {
  name: string
  price: number
}

interface MarketData {
  outcomes: [OutcomeData, OutcomeData]
}

interface BookmakerData {
  key: string
  markets: MarketData[]
}

interface OddsGameData {
  home_team: string
  away_team: string
  commence_time: string // Actually a Date, but its read in as a json string
  bookmakers: BookmakerData[]
}

export type OddsData = OddsGameData[]

export const getOddsData = async (): Promise<OddsData> => {
  if (env.oddsApi.apiKey === undefined) throw new Error('odds apikey is missing')

  const oddsApiUrl = buildUrl(
    env.oddsApi.host,
    '/v4/sports/americanfootball_nfl/odds',
    { regions: 'eu', markets: 'h2h', oddsFormat: 'decimal', apiKey: env.oddsApi.apiKey }
  )
  return (await axios.get(oddsApiUrl)).data
}
