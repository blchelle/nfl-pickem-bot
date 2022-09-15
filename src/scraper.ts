import puppeteer, { Page } from 'puppeteer'

import { OfpData } from './@types/ofpData'
import { AWAY, HOME } from './constants'
import env from './env'

const OFP_BASE_URL = 'https://www.officefootballpool.com'

const login = async (page: Page): Promise<void> => {
  if (env.ofp.email === undefined) throw new Error('OFP email is missing')
  if (env.ofp.password === undefined) throw new Error('OFP password is missing')

  await page.goto(OFP_BASE_URL)
  await page.screenshot({ path: 'img/00_home.png' })

  await page.click('.header_button[onclick="toggleLogIn()')
  await page.focus('#username0')
  await page.keyboard.type(env.ofp.email)
  await page.focus('#password0')
  await page.keyboard.type(env.ofp.password)
  await page.screenshot({ path: 'img/01_loginform.png' })

  await Promise.all([
    page.click('#loginbutton0'),
    page.waitForNavigation({ waitUntil: ['load', 'networkidle0'] })
  ])
  await page.screenshot({ path: 'img/02_loggedin.png' })
}

const navigateToPicksPage = async (page: Page): Promise<void> => {
  await page.goto(`${OFP_BASE_URL}/picks.cfm?p=4`)
  await page.screenshot({ path: 'img/03_searchpicks.png' })

  await Promise.all([
    page.waitForNavigation({ waitUntil: ['load', 'networkidle0'] }),
    page.click('button[name="search"]')
  ])
  await page.screenshot({ path: 'img/04_searchpicks-table.png' })
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
  await page.goto(`${OFP_BASE_URL}/picks.cfm?p=1`)
  await page.screenshot({ path: 'img/05_my-picks.png' })

  const pickedTeams = await page.$$eval('.btn-locked-picked div:first-child', (els) => els.map((el) => el.innerHTML.split(' (')[0]))
  const ranks = await page.$$eval('.rankResult', (els) => els.map((el) => +el.innerHTML))
  const results = await page.$$eval('.rankResult', (els) => els.map((el) => Array.from(el.classList).includes('btn-win')))

  for (let i = 0; i < pickedTeams.length; i++) {
    const matchingTeam = pickedTeams[i].toLowerCase() === games[i][0].team.toLowerCase() ? AWAY : HOME
    games[i][matchingTeam].rank = ranks[i]
    games[i][matchingTeam].won = results[i]
  }

  return games
}

export const getOfpData = async (): Promise<OfpData> => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await login(page)
  console.log('Logged In')

  await navigateToPicksPage(page)
  console.log('Navigated to Picks Page')

  let gamePickInfo = await parsePicksTable(page)
  console.log('Parsed the Picked Table')

  gamePickInfo = await getCompletedGames(page, gamePickInfo)
  console.log('Got the completed games')

  await browser.close()
  return gamePickInfo
}
