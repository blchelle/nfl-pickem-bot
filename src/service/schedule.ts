import axios from 'axios'
import env from '@config/env'
import { buildUrl } from '@utils/url'

export interface ScheduleData {
  events: ScheduleAPIEvents[]
}

interface ScheduleAPIEvents {
  date: string
}

// GetPickTimes should return a list of unique dates occuring before the morning wave of sunday games.
export const getPickTimes = (games: ScheduleData): Date[] => {
  const gameTimes = games.events.map((e) => new Date(e.date))

  // The morning wave of Sunday games starts at T18:00 UTC
  // This is when the picks lock
  const finalLockTime = new Date()
  finalLockTime.setDate(finalLockTime.getDate() + (-1 - finalLockTime.getDay() + 7) % 7 + 1)
  finalLockTime.setUTCHours(18, 0, 0, 0)

  // Filter down the list to times that are in the future but not on Monday because the picks always lock on Sunday
  // Then, filter down further to the first game times of each day of the week
  const pickLockTimes = gameTimes.filter((gameTime) => gameTime.getTime() > new Date().getTime() && gameTime.getTime() <= finalLockTime.getTime())

  // Offset the run times by 5 minutes to give the bots a chance to run
  // Also eliminate duplicate times
  pickLockTimes.forEach((gameTime) => { gameTime.setMinutes(gameTime.getMinutes() - 10) })
  return pickLockTimes.filter((date, i, self) => self.findIndex((d) => d.getTime() === date.getTime()) === i)
}

export const getNflGamesThisWeek = async (): Promise<ScheduleData> => {
  const res: ScheduleData = (await axios.get(buildUrl(env.scheduleApi.host, 'apis/site/v2/sports/football/nfl/scoreboard'))).data
  return res
}
