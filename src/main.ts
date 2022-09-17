import puppeteer, { Browser, Page } from 'puppeteer'

import { OddsData } from './@types/oddsData'
import { OfpData } from './@types/ofpData'
import { displayPicks } from './utils/display'
import { generateOutcomes, mergeOfpAndOddsData } from './utils/game'
import { getOddsData } from './odds'
import { getOfpData } from './webscraper/getData'
import { simulateWeek } from './simulator'
import env from './env'

import TEST_ODDS_DATA_JSON from './data/testOddsData.json'
import TEST_OFP_DATA_JSON from './data/testOfficeFootballPoolData.json'
import { makePicks } from './webscraper/makePicks'
import flags from './flags'

const TEST_OFP_DATA = TEST_OFP_DATA_JSON as unknown as OfpData
const TEST_ODDS_DATA = TEST_ODDS_DATA_JSON as unknown as OddsData

const showInstructions = (): void => {
  console.log('Options:')
  Object.values(flags).forEach(({ flag, description }) => {
    console.log(`${flag.padEnd(17)} ${description}`)
  })
}

const executeBots = async (): Promise<void> => {
  // Both bots can use the same set of odds data because it is unlikely to change
  // between the execution of each both and we only have 50 free API calls per month
  const oddsData = env.odds.getOddsData ? await getOddsData() : TEST_ODDS_DATA

  for (const bot of env.ofp.bots) {
    if (!bot.active) continue

    let browser: Browser | undefined
    let page: Page | undefined

    // We only want to use the ofp webscraper when we need to access the site,
    // otherwise we should just use test data to avoid overusage of the site
    if (env.ofp.getPicksData) {
      browser = await puppeteer.launch({ defaultViewport: null, headless: false })
      page = await browser.newPage()
    }

    const ofpData = page !== undefined ? await getOfpData(page, bot) : TEST_OFP_DATA
    const games = mergeOfpAndOddsData(ofpData, oddsData)
    const outcomes = generateOutcomes(games)

    // The season bot and the weekly bot have different methods of choosing their picks
    const [picks, weeklyWinProb] = bot.getBestPicksFn(games, outcomes)
    displayPicks(games, outcomes, picks, weeklyWinProb)
    simulateWeek(games, outcomes, picks.picks)

    if (page !== undefined && env.ofp.makePicks) await makePicks(page, picks.picks)
    if (browser !== undefined) await browser.close()
  }
}

(async () => {
  if (process.argv.includes(flags.help.flag) || env.ofp.bots.every(({ active }) => !active)) showInstructions()
  else await executeBots()
})().catch((e) => { console.log(e) })
