import { Page } from 'puppeteer'

import { AWAY, HOME } from '@config/constants'
import env, { OfpAccount } from '@config/env'
import { buildUrl } from '@utils/url'
import { simulateClick } from './utils'

interface OfpOutcome {
  team: string
  pointsPercent: number
  rank?: number
  state?: 'won' | 'lost' | 'in progress' | 'not started'
}

export type OfpData = OfpOutcome[][]

const login = async (page: Page, botAccount: OfpAccount): Promise<void> => {
  if (botAccount.email === undefined) throw new Error('OFP email is missing')
  if (botAccount.password === undefined) throw new Error('OFP password is missing')

  const emailInputSelector = '#username0'
  const passwordInputSelector = '#password0'
  const loginButtonSelector = '#loginbutton0'

  const emailInput = await page.waitForSelector(emailInputSelector)
  const passwordInput = await page.waitForSelector(passwordInputSelector)
  const loginButton = await page.waitForSelector(loginButtonSelector)

  if (emailInput === null) throw new Error(`could not find element with selector ${emailInputSelector}`)
  if (passwordInput === null) throw new Error(`could not find element with selector ${passwordInputSelector}`)
  if (loginButton === null) throw new Error(`could not find element with selector ${loginButtonSelector}`)

  await emailInput.type(botAccount.email)
  await passwordInput.type(botAccount.password)

  await Promise.all([
    page.waitForSelector('#welcomeLabel', { visible: true, timeout: 0 }),
    simulateClick(loginButton, 'Enter')
  ])
}

const loadSearchPicksTable = async (page: Page): Promise<void> => {
  await page.goto(buildUrl(env.ofp.host, 'picks.cfm', { p: '4' }))

  const searchPicksButtonSelector = 'button[name="search"]'
  const searchPicksButton = await page.waitForSelector(searchPicksButtonSelector)
  if (searchPicksButton === null) throw new Error(`could not find element with selector ${searchPicksButtonSelector}`)

  // Clicks the button and waits for the table to appear
  await searchPicksButton.click()
  await page.waitForSelector('table')
}

const parsePicksTable = async (page: Page): Promise<OfpData> => {
  const teamData = await page.$$eval('table tbody tr', (tableRows) => {
    tableRows.pop()
    return tableRows.map((row) => {
      const cells = row.querySelectorAll('td')
      const team = cells[0].innerText.replace(/ \(.*/, '')
      const pointsData = cells[2].innerHTML.replace(/( |%|\n|)/g, '').split(',&nbsp;')
      const pointsPercent = +pointsData[1] / 100

      return { team, pointsPercent }
    })
  })

  const games = []
  for (let i = 0; i < teamData.length / 2; i++) {
    games.push(
      [
        { team: teamData[i * 2].team, pointsPercent: teamData[i * 2].pointsPercent },
        { team: teamData[i * 2 + 1].team, pointsPercent: teamData[i * 2 + 1].pointsPercent }
      ]
    )
  }

  return games
}

const getCompletedGames = async (page: Page, games: OfpData): Promise<OfpData> => {
  await page.goto(buildUrl(env.ofp.host, 'picks.cfm', { p: '1' }))

  const pickedTeams = await page.$$eval('.btn-locked-picked span.dlg', (els) => els.map((el) => el.innerHTML.split(' (')[0]))
  const ranks = await page.$$eval('.rankResult', (els) => els.map((el) => +el.innerHTML))
  const results = await page.$$eval('.rankResult', (els) => els.map((el) => {
    if (Array.from(el.classList).includes('btn-win')) return 'won'
    else if (Array.from(el.classList).includes('btn-loss')) return 'lost'
    else if (Array.from(el.classList).includes('btn-block')) return 'in progress'
    else return 'not started'
  }))

  for (let i = 0; i < pickedTeams.length; i++) {
    const matchingTeam = pickedTeams[i].toLowerCase() === games[i][AWAY].team.toLowerCase() ? AWAY : HOME
    games[i][matchingTeam].rank = ranks[i]
    games[i][matchingTeam].state = results[i]

    if (results[i] === 'won') games[i][1 - matchingTeam].state = 'lost'
    else if (results[i] === 'lost') games[i][1 - matchingTeam].state = 'won'
    else games[i][1 - matchingTeam].state = games[i][matchingTeam].state
  }

  return games
}

export const getOfpData = async (page: Page, botAccount: OfpAccount): Promise<OfpData> => {
  await login(page, botAccount)
  await loadSearchPicksTable(page)

  let gamePickInfo = await parsePicksTable(page)
  gamePickInfo = await getCompletedGames(page, gamePickInfo)

  return gamePickInfo
}
