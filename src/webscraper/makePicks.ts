import { ElementHandle, Page } from 'puppeteer'
import { AWAY, HOME } from '../config/constants'
import env from '../config/env'
import { buildUrl } from '../utils/url'
import { elementHandleHasClass, findElementWithInnerHTML, simulateClick } from './utils'

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
  const projectedMnfPoints = await page.$eval(mnfProjectionSelector, (el) => el.innerHTML.split(/\(|\)/)[1])

  const mnfInputSelector = 'input.mnf'
  const mnfInput = await page.waitForSelector(mnfInputSelector)
  if (mnfInput === null) throw new Error(`could not find element with selector ${mnfInputSelector}`)

  // Clicking 3 times allows us to overwrite any existing text
  await mnfInput.click({ clickCount: 3 })
  await mnfInput.type(projectedMnfPoints)
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
  const rankPickerSelector = '.rankResult, .dropbtn'

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
const pickGame = async (page: Page, gameInputs: GameInputs, pick: number[]): Promise<void> => {
  const { buttons, rankPicker } = gameInputs
  const [teamPicked, rankPicked] = pick

  // Elements with the class btn-locked are indicators that the game already happened
  const disabledButtonSelector = 'btn-locked'
  if (await elementHandleHasClass(buttons[AWAY], disabledButtonSelector) || await elementHandleHasClass(buttons[HOME], disabledButtonSelector)) return

  // Only click the button if it hasn't been previously selected from a prior session
  if (!await elementHandleHasClass(buttons[teamPicked], 'btn-pickable-saved')) await simulateClick(buttons[teamPicked], 'Space')

  // Clicking the rank picker will show a dropdown
  await page.waitForFunction((rankPickerEl) => !Array.from(rankPickerEl.classList).includes('btn-locked'), {}, rankPicker)
  await simulateClick(rankPicker, 'Space')

  // Finds the element in the dropdown corresponding with the rank picked and clicks it
  const rankButtonSelector = '.dropdown-content.show a'
  await page.waitForSelector(rankButtonSelector)
  const rankButton = await findElementWithInnerHTML(await page.$$(rankButtonSelector), rankPicked.toString())
  await simulateClick(rankButton, 'Space')
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
    page.waitForNavigation({ waitUntil: ['load', 'networkidle0'] }),
    simulateClick(submitButton, 'Enter')
  ])
}

/**
 * Makes picks and selects ranks for all the upcoming games.
 * @param page the puppeteer.Page instance
 * @param picks the picks decided by the bot
 */
export const makePicks = async (page: Page, picks: number[][]): Promise<void> => {
  await page.goto(buildUrl(env.ofp.host, 'picks.cfm', { p: '1' }))

  const pickButtons = await getPickButtons(page)
  const rankPickers = await getRankPickers(page)
  const inputGroups = pickButtons.map((buttons, i) => ({ buttons, rankPicker: rankPickers[i] }))

  // Iterates over every game this week and enters the corresponding picks and ranks
  for (let i = 0; i < inputGroups.length; i++) await pickGame(page, inputGroups[i], picks[i])

  await enterMnfTotalPoints(page)
  await submitPicks(page)
}
