import { OddsData } from './@types/oddsData'
import { OfpData } from './@types/ofpData'
import TEST_ODDS_DATA_JSON from './data/testOddsData.json'
import TEST_OFP_DATA_JSON from './data/testOfficeFootballPoolData.json'
import { generateOutcomes, mergeOfpAndOddsData } from './utils/game'

const TEST_OFP_DATA = TEST_OFP_DATA_JSON as unknown as OfpData
const TEST_ODDS_DATA = TEST_ODDS_DATA_JSON as unknown as OddsData

(async () => {
  const games = mergeOfpAndOddsData(TEST_OFP_DATA, TEST_ODDS_DATA)
  const outcomes = generateOutcomes(games)

  console.log(outcomes[0])
})()
