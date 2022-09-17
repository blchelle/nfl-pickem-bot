interface FlagInfo {
  flag: string
  description: string
}

interface Flags {
  [key: string]: FlagInfo
}

const flags: Flags = {
  help: {
    flag: '--help',
    description: 'Add this flag to get live odds data from the-odds-api'
  },
  oddsData: {
    flag: '--odds-data',
    description: 'Get live odds data from the-odds-api'
  },
  ofpPicksData: {
    flag: '--ofp-picks-data',
    description: 'Get live picks data from OfficeFootballPool.com'
  },
  ofpMakePicks: {
    flag: '--ofp-make-picks',
    description: 'Automatically enter picks on OfficeFootbalPool.com'
  },
  seasonBot: {
    flag: '--season-bot',
    description: 'Activate the season bot'
  },
  weeklyBot: {
    flag: '--weekly-bot',
    description: 'Activate the weekly bot'
  }
}

export default flags
