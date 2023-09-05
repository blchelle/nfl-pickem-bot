import dotenv from 'dotenv'

import { GameData, ResultPoints } from '@utils/game'
import { BestPicks } from '@picks/bestPicks'
import { getBestSeasonPicks } from '@picks/bestSeasonPicks'
import { getBestWeeklyPicks } from '@picks/bestWeeklyPicks'
import flags from '@config/flags'

dotenv.config()

interface Env {
  browser: BrowserEnv
  oddsApi: OddsEnv
  ofp: OfpEnv
  scheduleApi: ScheduleEnv
  proxy: ProxyEnv
}

interface BrowserEnv {
  headless: boolean
}

interface OddsEnv {
  apiKey?: string
  host: string
  getOddsData: boolean
}

interface OfpEnv {
  host: string
  getPicksData: boolean
  makePicks: boolean
  bots: OfpAccount[]
}

export interface OfpAccount {
  active: boolean
  name: string
  email?: string
  password?: string
  getBestPicksFn: (games: GameData[], outcomes: ResultPoints[][][]) => [BestPicks, number, number[]]
}

interface ScheduleEnv {
  host: string
  getScheduleData: boolean
}

interface ProxyEnv {
  active: boolean
  host: string
  apiKey?: string
}

const env: Env = {
  browser: {
    headless: process.argv.includes(flags.headless.flag)
  },
  oddsApi: {
    apiKey: process.env.ODDS_API_KEY,
    host: 'https://api.the-odds-api.com',
    getOddsData: process.argv.includes(flags.oddsData.flag)
  },
  ofp: {
    host: 'https://officefootballpool.com',
    getPicksData: process.argv.includes(flags.ofpPicksData.flag),
    makePicks: process.argv.includes(flags.ofpMakePicks.flag),
    bots: [
      {
        active: process.argv.includes(flags.seasonBot.flag),
        name: 'Season Winner Bot',
        email: process.env.OFP_SEASON_BOT_EMAIL,
        password: process.env.OFP_SEASON_BOT_PASSWORD,
        getBestPicksFn: getBestSeasonPicks
      },
      {
        active: process.argv.includes(flags.weeklyBot.flag),
        name: 'Weekly Winner Bot',
        email: process.env.OFP_WEEKLY_BOT_EMAIL,
        password: process.env.OFP_WEEKLY_BOT_PASSWORD,
        getBestPicksFn: getBestWeeklyPicks
      }
    ]
  },
  scheduleApi: {
    host: 'https://site.api.espn.com',
    getScheduleData: process.argv.includes(flags.nflScheduleData.flag)
  },
  proxy: {
    active: process.argv.includes(flags.proxy.flag),
    host: 'http://proxy-server.scraperapi.com:8001',
    apiKey: process.env.PROXY_API_KEY
  }
}

export default env
