import { GameData, ResultPoints } from '../@types/gameData'
import { MAX_RANK } from '@config/constants'

export const simulateWeek = (games: GameData[], outcomes: ResultPoints[][][], picks: Array<[number, number]>, numSimulations = 100_000): void => {
  let meanPoints = 0
  let meanNetPoints = 0

  const allPoints = []
  const allNetPoints = []
  for (let i = 0; i < numSimulations; i++) {
    let points = 0
    let netPoints = 0

    games.forEach((game, i) => {
      const pick = picks[i]

      if (Math.random() < game[pick[0]].winProb) {
        points += pick[1]
        netPoints += outcomes[i][MAX_RANK - pick[1]][pick[0]].win
      } else {
        netPoints += outcomes[i][MAX_RANK - pick[1]][pick[0]].lose
      }
    })

    meanPoints = (meanPoints * i + points) / (i + 1)
    meanNetPoints = (meanNetPoints * i + netPoints) / (i + 1)

    allPoints.push(points)
    allNetPoints.push(netPoints)
  }

  const std = Math.pow(allPoints.reduce((sose, n) => sose + Math.pow(n - meanPoints, 2)) / numSimulations, 0.5)
  const netStd = Math.pow(allNetPoints.reduce((sose, n) => sose + Math.pow(n - meanNetPoints, 2)) / numSimulations, 0.5)

  console.log('Simulation Completed')
  console.log(`Mean Points: ${meanPoints.toFixed(3)}`)
  console.log(`Standard Deviation Points: ${std.toFixed(3)}`)

  console.log(`Mean Net Points: ${meanNetPoints.toFixed(3)}`)
  console.log(`Standard Deviation Net Points: ${netStd.toFixed(3)}`)
}
