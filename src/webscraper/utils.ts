import { ElementHandle } from 'puppeteer'

/**
 * Checks if a puppeteer element has certain class
 *
 * @param el the puppeteer.ElementHandle to check for the presence of a class
 * @param className the class being checked for
 * @returns whether or not the element has the class
 */
export const elementHandleHasClass = async (el: ElementHandle, className: string): Promise<boolean> => {
  const classNames = (await (await el.getProperty('className')).jsonValue()).split(/\s+/)
  return classNames.includes(className)
}

/**
 * Finds an element from an array of elements that contains a specified innerHTML
 * @param els an array of puppeteer.ElementHandle to search over
 * @param innerHTML the innerHTML text to search for
 * @returns The first element that matches the text
 */
export const findElementWithInnerHTML = async (els: ElementHandle[], innerHTML: string): Promise<ElementHandle> => {
  const promises = els.map(async (el) => await (await el.getProperty('innerHTML')).jsonValue() === innerHTML)
  const results = await Promise.all(promises)
  const resultIndex = results.findIndex((result) => result)

  return els[resultIndex]
}

/**
 * Simulates a click on a puppeteer element.
 * This method of clicking is more consistent that using ElementHandle.click()
 * because it works even when the element is outside the viewport.
 *
 * @param el the puppeteer.ElementHandle to simulate the click on
 * @param trigger the input to press once the element is focused
 */
export const simulateClick = async (el: ElementHandle, trigger: 'Space' | 'Enter'): Promise<void> => {
  await el.focus()
  await el.press(trigger)
}
