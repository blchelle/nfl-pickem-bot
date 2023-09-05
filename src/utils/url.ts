import path from 'path'

/**
 * Builds a url from the provided arguments
 * @param protocol http or https
 * @param host the domain of the url
 * @param route the path to the resource at the url
 * @param params the parmeters to query for
 * @returns a url build from the provided arguments
 */
export const buildUrl = (host: string, route: string = '', params: Record<string, string> = {}): string => {
  const paramString = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')
  const hostRoute = host + path.join('/', route)

  if (paramString.length > 0) return `${hostRoute}?${paramString}`
  else return hostRoute
}
