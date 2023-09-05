import env from '@config/env'
import { Browser, Page, PageEmittedEvents } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import UserAgent from 'user-agents'

puppeteer.use(StealthPlugin())

export const initBrowser = async (): Promise<Browser | undefined> => {
  if (!env.ofp.getPicksData) return undefined

  return await puppeteer.launch({
    args: env.proxy.active
      ? [`--proxy-server=${env.proxy.host}`]
      : [],
    ignoreHTTPSErrors: true,
    headless: env.browser.headless,
    devtools: true
  })
}

export const initPage = async (browser?: Browser): Promise<Page | undefined> => {
  if (browser === undefined) return undefined

  const page = await browser.newPage()
  await page.setUserAgent(new UserAgent().random.toString())
  await page.setViewport({
    width: 1200 + Math.floor(Math.random() * 100),
    height: 1000 + Math.floor(Math.random() * 100),
    deviceScaleFactor: 1,
    hasTouch: false,
    isLandscape: false,
    isMobile: false
  })
  await page.setJavaScriptEnabled(true)
  page.setDefaultNavigationTimeout(0)

  await page.setRequestInterception(true)
  page.on(PageEmittedEvents.Request, (req) => {
    if (['fetch', 'media', 'stylesheet', 'image', 'font'].includes(req.resourceType())) {
      void req.abort()
    } else {
      void req.continue()
    }
  })

  // Pass webdriver check
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false
    })
  })

  // Overwrite the `plugins` property to use a custom getter.
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5]
    })
  })

  // Overwrite the `languages` property to use a custom getter.
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en']
    })
  })

  // Attempts to authenticate with a proxy
  await authenticateWithProxy(page)

  await page.goto(env.ofp.host, { waitUntil: 'networkidle2' })
  return page
}

const authenticateWithProxy = async (page: Page): Promise<void> => {
  if (!env.proxy.active) return
  if (env.proxy.user === undefined || env.proxy.password === undefined) throw new Error('proxy is enabled but user or password is missing')

  await page.authenticate({ username: env.proxy.user, password: env.proxy.password })
}
