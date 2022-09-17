import dotenv from 'dotenv'
import { GameData, ResultPoints } from './@types/gameData'
import { BestPicks } from './bestPicks'
import { getBestSeasonPicks } from './bestSeasonPicks'
import { getBestWeeklyPicks } from './bestWeeklyPicks'
import flags from './flags'
dotenv.config()

interface Env {
  odds: OddsEnv
  ofp: OfpEnv
}

interface OddsEnv {
  apiKey?: string
  getOddsData: boolean
}

interface OfpEnv {
  getPicksData: boolean
  makePicks: boolean
  bots: OfpAccount[]
}

export interface OfpAccount {
  active: boolean
  name: string
  email?: string
  password?: string
  getBestPicksFn: (games: GameData[], outcomes: ResultPoints[][][]) => [BestPicks, number]
}

const env: Env = {
  odds: {
    apiKey: process.env.ODDS_API_KEY,
    getOddsData: process.argv.includes(flags.oddsData.flag)
  },
  ofp: {
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
  }
}

export default env
