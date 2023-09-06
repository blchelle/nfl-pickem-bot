import { GameData } from '@utils/game'
import { Pick } from '@picks/bestPicks'

export const simulateWeek = (games: GameData[], picks: Pick[], numSimulations = 100_000): void => {
  let meanPoints = 0
  let meanNetPoints = 0

  const allPoints = []
  const allNetPoints = []
  for (let i = 0; i < numSimulations; i++) {
    let points = 0
    let netPoints = 0

    games.forEach((game, i) => {
      const pick = picks[i]

      if (Math.random() < game.teams[pick.pick].winProb) {
        points += pick.rank
        netPoints += pick.netPoints.win
      } else {
        netPoints += pick.netPoints.lose
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
