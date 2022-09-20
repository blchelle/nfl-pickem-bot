import { buildUrl } from '@utils/url'

describe(buildUrl, () => {
  it('builds a url with no path and no params', () => {
    expect(buildUrl('google.com')).toBe('https://google.com')
  })

  it('builds a url with a path and no params ', () => {
    expect(buildUrl('google.com', 'search')).toBe('https://google.com/search')
  })

  it('removes repeating / from the url', () => {
    expect(buildUrl('google.com', '/search')).toBe('https://google.com/search')
  })

  it('builds a url with no path and params', () => {
    expect(buildUrl('google.com', '', { search: 'nfl teams' })).toBe('https://google.com?search=nfl teams')
  })

  it('builds a url with path and params', () => {
    expect(buildUrl('google.com', 'search', { search: 'nfl teams' })).toBe('https://google.com/search?search=nfl teams')
  })
})
