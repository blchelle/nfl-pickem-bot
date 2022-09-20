import { existsSync } from 'fs'
import { readdir, unlink } from 'fs/promises'
import path from 'path'
import { Page } from 'puppeteer'

import { OfpData } from '../@types/ofpData'
import { AWAY, HOME } from '@config/constants'
import env, { OfpAccount } from '@config/env'
import { buildUrl } from '@utils/url'

const deleteScreenshots = async (folderPath: string): Promise<void> => {
  if (!existsSync(folderPath)) return

  const files = await readdir(folderPath)
  for (const file of files) {
    await unlink(path.resolve(folderPath, file))
  }
}

const login = async (page: Page, botAccount: OfpAccount): Promise<void> => {
  if (botAccount.email === undefined) throw new Error('OFP email is missing')
  if (botAccount.password === undefined) throw new Error('OFP password is missing')

  await page.goto(buildUrl(env.ofp.host))

  const toggleLoginButtonSelector = '.header_button[onclick="toggleLogIn()'
  const toggleLoginButton = await page.waitForSelector(toggleLoginButtonSelector)
  if (toggleLoginButton === null) throw new Error(`could not find element with selector ${toggleLoginButtonSelector}`)
  await toggleLoginButton.click()

  const emailInputSelector = '#username0'
  const passwordInputSelector = '#password0'
  const checkboxSelector = '#inputRemember0'
  const loginButtonSelector = '#loginbutton0'

  const emailInput = await page.waitForSelector(emailInputSelector)
  const passwordInput = await page.waitForSelector(passwordInputSelector)
  const checkbox = await page.waitForSelector(checkboxSelector)
  const loginButton = await page.waitForSelector(loginButtonSelector)

  if (emailInput === null) throw new Error(`could not find element with selector ${emailInputSelector}`)
  if (passwordInput === null) throw new Error(`could not find element with selector ${passwordInputSelector}`)
  if (checkbox === null) throw new Error(`could not find element with selector ${checkboxSelector}`)
  if (loginButton === null) throw new Error(`could not find element with selector ${loginButtonSelector}`)

  await emailInput.type(botAccount.email)
  await passwordInput.type(botAccount.password)
  await checkbox.click()

  await Promise.all([
    page.waitForNavigation({ waitUntil: ['load', 'networkidle0'] }),
    loginButton.click()
  ])
}

const navigateToSearchPicksPage = async (page: Page): Promise<void> => {
  await page.goto(buildUrl(env.ofp.host, 'picks.cfm', { p: '4' }))
  await Promise.all([
    page.waitForNavigation({ waitUntil: ['load', 'networkidle0'] }),
    page.click('button[name="search"]')
  ])
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

  const pickedTeams = await page.$$eval('.btn-locked-picked div:first-child', (els) => els.map((el) => el.innerHTML.split(' (')[0]))
  const ranks = await page.$$eval('.rankResult', (els) => els.map((el) => +el.innerHTML))
  const results = await page.$$eval('.rankResult', (els) => els.map((el) => Array.from(el.classList).includes('btn-win')))

  for (let i = 0; i < pickedTeams.length; i++) {
    const matchingTeam = pickedTeams[i].toLowerCase() === games[i][AWAY].team.toLowerCase() ? AWAY : HOME
    games[i][matchingTeam].rank = ranks[i]
    games[i][matchingTeam].won = results[i]
    games[i][1 - matchingTeam].won = !results[i]
  }

  return games
}

export const getOfpData = async (page: Page, botAccount: OfpAccount): Promise<OfpData> => {
  await deleteScreenshots('img/')
  await login(page, botAccount)
  await navigateToSearchPicksPage(page)

  let gamePickInfo = await parsePicksTable(page)
  gamePickInfo = await getCompletedGames(page, gamePickInfo)

  return gamePickInfo
}
