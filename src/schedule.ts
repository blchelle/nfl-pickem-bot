import env from './env'

interface NflGame {
  date: string
}

export interface ScheduleData {
  data: NflGame[]
}

const MONDAY = 1

export const getDailyFirstGames = (games: ScheduleData): Date[] => {
  const gameTimes = games.data.map(({ date }) => new Date(date))

  // Filter down the list to times that are in the future but not on Monday because the picks always lock on Sunday
  // Then, filter down further to the first game times of each day of the week
  const futureGameTimes = gameTimes.filter((gameTime) => gameTime.getTime() > new Date().getTime() && gameTime.getDay() !== MONDAY)
  const dailyFirstGames = futureGameTimes.filter((gameTime, i) => i === 0 || futureGameTimes[i - 1].getDay() !== gameTime.getDay())

  // Schedule the bots to run a few minutes before game time since execution can take a couple minutes
  dailyFirstGames.forEach((gameTime) => { gameTime.setMinutes(gameTime.getMinutes() - 10) })
  return dailyFirstGames
}

export const getNflGamesThisWeek = async (): Promise<ScheduleData> => {
  if (env.schedule.apiKey === undefined) throw new Error('NFL Schedule API Key is missing')

  const reqOptions: RequestInit = { headers: [['X-RapidAPI-Key', env.schedule.apiKey], ['X-RapidAPI-Host', 'nfl-schedule.p.rapidapi.com']] }
  return await (await fetch('https://nfl-schedule.p.rapidapi.com/v1/schedules', reqOptions)).json()
}
