import { OddsData } from './@types/oddsData'
import { OfpData } from './@types/ofpData'
import { getBestWeeklyPicks } from './bestWeeklyPicks'
import { getBestSeasonPicks } from './bestSeasonPicks'
import { displayPicks } from './utils/display'
import { generateOutcomes, mergeOfpAndOddsData } from './utils/game'
import { getOfpData } from './scraper'
import { simulateWeek } from './simulator'
import env from './env'

import TEST_ODDS_DATA_JSON from './data/testOddsData.json'
import TEST_OFP_DATA_JSON from './data/testOfficeFootballPoolData.json'

const TEST_OFP_DATA = TEST_OFP_DATA_JSON as unknown as OfpData
const TEST_ODDS_DATA = TEST_ODDS_DATA_JSON as unknown as OddsData;

(async () => {
  const ofpData = env.useOfp ? await getOfpData() : TEST_OFP_DATA
  const games = mergeOfpAndOddsData(ofpData, TEST_ODDS_DATA)
  const outcomes = generateOutcomes(games)

  console.log('Calculating the best picks to win the season')
  const [seasonPicks, seasonPicksWinProb] = getBestSeasonPicks(games, outcomes)
  displayPicks(games, outcomes, seasonPicks, seasonPicksWinProb)
  console.log()
  simulateWeek(games, outcomes, seasonPicks.picks)
  console.log()

  console.log('Calculating the best picks to win the week')
  const [weekPicks, weeklyPicksWinProb] = getBestWeeklyPicks(games, outcomes)
  displayPicks(games, outcomes, weekPicks, weeklyPicksWinProb)
  console.log()
  simulateWeek(games, outcomes, weekPicks.picks)
})().catch((e) => { console.log(e) })
