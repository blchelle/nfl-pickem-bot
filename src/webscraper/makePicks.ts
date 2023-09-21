import { ElementHandle, Page, TimeoutError } from 'puppeteer'
import { AWAY, HOME } from '@config/constants'
import { Pick } from '@picks/bestPicks'
import env from '@config/env'
import { buildUrl } from '@utils/url'
import { elementHandleHasClass, simulateClick } from '@webscraper/utils'

interface GameInputs {
  buttons: ElementHandle[]
  rankPicker: ElementHandle
}

/**
 * Gets the projected MNF point total and inputs it into the corresponding field.
 * I don't particularly care about what is entered in this field since the scenario is unlikely to
 * come up. Inputting the projected score is satisfactory.
 * @param page the puppeteer.Page instance
 */
const enterMnfTotalPoints = async (page: Page): Promise<void> => {
  const mnfProjectionSelector = '#submitRowGuts > div > span'
  await page.waitForSelector(mnfProjectionSelector)

  let projectedMnfPoints = +(await page.$eval(mnfProjectionSelector, (el) => el.innerHTML.split(/\(|\)/)[1]))
  projectedMnfPoints = Math.max(projectedMnfPoints, 10)

  const mnfInputSelector = 'input.mnf'
  const mnfInput = await page.waitForSelector(mnfInputSelector)
  if (mnfInput === null) throw new Error(`could not find element with selector ${mnfInputSelector}`)

  // Clicking 3 times allows us to overwrite any existing text
  await mnfInput.click({ clickCount: 3 })
  await mnfInput.type(projectedMnfPoints.toString())
}

/**
 * Gets a handler for each of the buttons that can be clicked to make a pick.
 * The buttons are also paired into groups of two to represent the two teams in each game.
 * @param page the puppeteer.Page instance
 * @returns An n x 2 array of button handles where n is the number of games
 */
const getPickButtons = async (page: Page): Promise<ElementHandle[][]> => {
  const pickButtonSelector = '.teambtn'

  await page.waitForSelector(pickButtonSelector)
  return (await page.$$(pickButtonSelector)).reduce((groups: ElementHandle[][], button, i) => {
    if (i % 2 === 0) groups.push([button])
    else groups[groups.length - 1].push(button)
    return groups
  }, [])
}

/**
 * Gets a handler for each of the rank pickers that can be clicked to select a rank for each game.
 * @param page the puppeteer.Page instance
 * @returns An array of size n, where n is the number of games
 */
const getRankPickers = async (page: Page): Promise<ElementHandle[]> => {
  const rankPickerSelector = '.row.gamerow input.hrank, .row.gamerow button.rankResult'

  await page.waitForSelector(rankPickerSelector)
  return await page.$$(rankPickerSelector)
}

/**
 * Inputs the decided picks into the browser page.
 * One of the two team buttons, and the rankPicker will be clicked.
 * @param page the puppeteer.Page instance
 * @param gameInputs the groups of puppeter.ElementHandles that will be used to pick the team and rank
 * @param pick the team to pick and the rank to pick them at
 */
const pickGame = async (page: Page, gameInputs: GameInputs, pick: Pick): Promise<void> => {
  const { buttons, rankPicker } = gameInputs
  const { pick: teamPicked, rank } = pick

  // Elements with the class btn-locked are indicators that the game already happened
  const disabledButtonSelector = 'btn-locked'
  if (await elementHandleHasClass(buttons[AWAY], disabledButtonSelector) || await elementHandleHasClass(buttons[HOME], disabledButtonSelector)) return

  // Only click the button if it hasn't been previously selected from a prior session
  if (!await elementHandleHasClass(buttons[teamPicked], 'btn-pickable-saved')) await simulateClick(buttons[teamPicked], 'Space')

  // Manually updates the value of the rank picker
  const rankPickerID = await (await rankPicker.getProperty('id')).jsonValue()
  await page.$eval(`#${rankPickerID}`, (el, rank) => { el.setAttribute('value', rank.toString()) }, rank.toString())
}

/**
 * Clicks the submit button and waits to navigate to the confirmation page
 * @param page the puppeteer.Page instance
 */
const submitPicks = async (page: Page): Promise<void> => {
  const submitButtonSelector = '.mysubmit'
  const submitButton = await page.waitForSelector(submitButtonSelector)
  if (submitButton === null) throw new Error(`could not find element with selector ${submitButtonSelector}`)

  // Waits for navigation
  await Promise.all([
    page.waitForNavigation({ waitUntil: ['load', 'networkidle0', 'domcontentloaded'] }),
    simulateClick(submitButton, 'Enter')
  ])
}

/**
 * Makes picks and selects ranks for all the upcoming games.
 * @param page the puppeteer.Page instance
 * @param picks the picks decided by the bot
 */
export const makePicks = async (page: Page, picks: Pick[]): Promise<void> => {
  await page.goto(buildUrl(env.ofp.host, 'picks.cfm', { p: '1' }))

  const pickButtons = await getPickButtons(page)
  const rankPickers = await getRankPickers(page)
  const inputGroups = pickButtons.map((buttons, i) => ({ buttons, rankPicker: rankPickers[i] }))

  // Iterates over every game this week and enters the corresponding picks and ranks
  for (let i = 0; i < inputGroups.length; i++) await pickGame(page, inputGroups[i], picks[i])

  await enterMnfTotalPoints(page)
  await closeWarningModal(page)
  await submitPicks(page)
}

/**
 * Checks to see if a warning modal pops up after making a pick and closes it if it does necessary
 *
 * @param page The puppeteer.Page instance
 */
const closeWarningModal = async (page: Page): Promise<void> => {
  const alertModalSelector = '#alertModal[style="display: block;"]'

  try {
    // Wait for the alertModal to load, most of the time this should throw a TimeoutError
    const alertModal = await page.waitForSelector(alertModalSelector, { timeout: 1000 })
    if (alertModal == null) {
      throw new Error('anomaly: alert modal is null, it should either be found or throw instead')
    }

    // Get the button to close the modal
    const closeButton = await alertModal.waitForSelector('.modal-footer button')
    if (closeButton == null) {
      throw new Error('anomaly: alert modal was found but close button is null, it should be found')
    }

    // Clicks the button to close the modal and waits for the modal to dissapear
    await simulateClick(closeButton, 'Space')
    await page.waitForSelector('#alertModal', { hidden: true })
  } catch (err) {
    // A timeout error is expected, anything else is an actual error we should throw
    if (!(err instanceof TimeoutError)) {
      console.log('An non-timeout error occurred: ', err)
      throw err
    }
  }
}
