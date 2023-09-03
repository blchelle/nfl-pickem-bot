import { GameData, ResultPoints } from '@utils/game'
import { BestPicks } from '@picks/bestPicks'
import { MAX_RANK } from '@config/constants'

export const displayPicks = (gamesData: GameData[], pointsData: ResultPoints[][][], results: BestPicks, expectedPayout: number, winProbs: number[]): void => {
  results.picks.forEach(([pick, rank], i) => {
    const pointData = pointsData[i][MAX_RANK - rank][pick]
    const pointsAvg = pointData.avg.toFixed(2)
    const pointsIfWin = pointData.win.toFixed(2)
    const pointsIfLose = pointData.lose.toFixed(2)

    const gameData = gamesData[i]
    const winningTeam = gameData[pick].name
    const losingTeam = gameData[1 - pick].name

    const teamsColumn = `${winningTeam.padStart(14)} over ${losingTeam.padEnd(14)}`
    const rankColumn = `${rank.toString().padStart(2)} confidence`
    const probColumn = `Prob: ${gameData[pick].winProb.toString().padStart(7)}`
    const winColumn = `Win: ${pointsIfWin.toString().padStart(7)}`
    const lossColumn = `Loss: ${pointsIfLose.toString().padStart(7)}`
    const netColumn = `Net: ${pointsAvg.toString().padStart(7)}`
    const tableRow = [teamsColumn, rankColumn, probColumn, winColumn, lossColumn, netColumn].join(''.padStart(5))

    console.log(tableRow)
  })

  console.log('')
  console.log(`Net Points Gained: ${results.net.toFixed(2)}`)
  console.log('')
  console.log(`First Place Probability: ${winProbs[0].toFixed(4)}`)
  console.log(`Second Place Probability: ${winProbs[1].toFixed(4)}`)
  console.log(`Third Place Probability: ${winProbs[2].toFixed(4)}`)
  console.log('')
  console.log(`Expected Payout: $${expectedPayout.toFixed(2)}`)
  console.log('')
}
