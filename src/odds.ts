import axios from 'axios'
import { OddsData } from './@types/oddsData'
import env from './env'

const ODDS_API_URL = 'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds?regions=us&markets=spreads&oddsFormat=american'

export const getOddsData = async (): Promise<OddsData> => {
  if (env.odds.apiKey === undefined) throw new Error('Odds API Key is missing')

  const oddsApiUrl = `${ODDS_API_URL}&apiKey=${env.odds.apiKey}`
  return (await axios.get(oddsApiUrl)).data
}
