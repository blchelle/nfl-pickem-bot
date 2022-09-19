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
    description: 'Learn about the different flags that can be passed'
  },
  nflScheduleData: {
    flag: '--schedule-data',
    description: 'Get live schedule data for the upcoming week'
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
  runNow: {
    flag: '--run-now',
    description: 'Runs the bots now without waiting for the scheduler'
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
