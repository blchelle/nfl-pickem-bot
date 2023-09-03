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
  markets: MarketData[]
}

interface OddsGameData {
  home_team: string
  away_team: string
  bookmakers: BookmakerData[]
}

export type OddsData = OddsGameData[]

export const getOddsData = async (): Promise<OddsData> => {
  if (env.oddsApi.apiKey === undefined) throw new Error('odds apikey is missing')

  const oddsApiUrl = buildUrl(
    env.oddsApi.host,
    '/v4/sports/americanfootball_nfl/odds',
    { bookmakers: 'betonlineag', markets: 'h2h', oddsFormat: 'decimal', apiKey: env.oddsApi.apiKey }
  )
  return (await axios.get(oddsApiUrl)).data
}
