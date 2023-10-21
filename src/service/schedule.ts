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
  gameTimes.forEach((gameTime) => { gameTime.setMinutes(gameTime.getMinutes() - 5) })

  // Picks are available starting at 00:00 UTC Wednesday and they lock at 17:00 UTC on Sunday.
  // Performs the following operations on the list of game times:
  // 1. Remove games that started in the past
  // 2. Remove games that occur after the morning wave of sunday games
  // 3. Remove duplicate game times
  const pickLockTimes = gameTimes
    .filter((time) => (time.getTime() > new Date().getTime()))
    .filter((time) => time.getUTCDay() >= 3 || (time.getUTCDay() === 0 && time.getUTCHours() < 17))
    .filter((time, i, self) => self.findIndex((d) => d.getTime() === time.getTime()) === i)

  return pickLockTimes
}

export const getNflGamesThisWeek = async (): Promise<ScheduleData> => {
  const res: ScheduleData = (await axios.get(buildUrl(env.scheduleApi.host, 'apis/site/v2/sports/football/nfl/scoreboard'))).data
  return res
}
