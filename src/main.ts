import puppeteer, { Browser, Page } from 'puppeteer'

import { OddsData } from './@types/oddsData'
import { OfpData } from './@types/ofpData'
import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND } from './constants'
import env from './env'
import flags from './flags'
import { getOddsData } from './odds'
import { getDailyFirstGames, getNflGamesThisWeek, ScheduleData } from './schedule'
import { simulateWeek } from './simulator'
import { displayPicks } from './utils/display'
import { generateOutcomes, mergeOfpAndOddsData } from './utils/game'
import { getOfpData } from './webscraper/getData'
import { makePicks } from './webscraper/makePicks'

import TEST_ODDS_DATA_JSON from './data/testOddsData.json'
import TEST_OFP_DATA_JSON from './data/testOfficeFootballPoolData.json'
import TEST_SCHEDULE_DATA_JSON from './data/testScheduleData.json'

const TEST_OFP_DATA = TEST_OFP_DATA_JSON as unknown as OfpData
const TEST_ODDS_DATA = TEST_ODDS_DATA_JSON as unknown as OddsData
const TEST_SCHEDULE_DATA = TEST_SCHEDULE_DATA_JSON as unknown as ScheduleData

const showInstructions = (): void => {
  console.log('Options:')
  Object.values(flags).forEach(({ flag, description }) => {
    console.log(`${flag.padEnd(17)} ${description}`)
  })
}

const scheduler = async (): Promise<void> => {
  while (true) {
    const gameSchedule = env.schedule.getScheduleData ? await getNflGamesThisWeek() : TEST_SCHEDULE_DATA
    const execSchedule = getDailyFirstGames(gameSchedule)

    while (execSchedule.length > 0) {
      const [nextExecTime] = execSchedule.splice(0, 1)
      const timeToNextExec = nextExecTime.getTime() - new Date().getTime()

      const days = Math.floor(timeToNextExec / MS_PER_DAY)
      const hours = Math.floor((timeToNextExec - days * MS_PER_DAY) / MS_PER_HOUR)
      const mins = Math.floor((timeToNextExec - days * MS_PER_DAY - hours * MS_PER_HOUR) / MS_PER_MINUTE)
      const secs = Math.floor((timeToNextExec - days * MS_PER_DAY - hours * MS_PER_HOUR - mins * MS_PER_MINUTE) / MS_PER_SECOND)
      console.log(`${days} days, ${hours} hours, ${mins} minutes, ${secs} seconds until next execution`)

      await new Promise((resolve) => setTimeout(resolve, Math.max(timeToNextExec, 0)))

      console.log(`Executing bots at ${new Date().toString()}`)
      await executeBots()
    }

    await new Promise((resolve) => setTimeout(resolve, MS_PER_DAY))
    console.log(`Performing the schedule check at ${new Date().toString()}`)
  }
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
      browser = await puppeteer.launch({ defaultViewport: { width: 2000, height: 3000 } })
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
  else await scheduler()
})().catch((e) => { console.log(e) })
