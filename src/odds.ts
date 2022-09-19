import axios from 'axios'
import { OddsData } from './@types/oddsData'
import env from './config/env'
import { buildUrl } from './utils/url'

export const getOddsData = async (): Promise<OddsData> => {
  if (env.oddsApi.apiKey === undefined) throw new Error('odds apikey is missing')

  const oddsApiUrl = buildUrl(
    env.oddsApi.host,
    '/v4/sports/americanfootball_nfl/odds',
    { regions: 'us', markets: 'spreads', oddsFormat: 'american', apiKey: env.oddsApi.apiKey }
  )
  return (await axios.get(oddsApiUrl)).data
}
