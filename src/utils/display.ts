import { GameData } from '@utils/game'
import { BestProb } from '@picks/bestPicks'

export const displayPicks = (gamesData: GameData[], best: BestProb): void => {
  const longestBookmakerName = gamesData.reduce((longest, game) => Math.max(longest, game.bookmaker.length), 0)

  best.picks.forEach(({ netPoints, pick, rank }, i) => {
    const pointsAvg = netPoints.avg.toFixed(2)
    const pointsIfWin = netPoints.win.toFixed(2)
    const pointsIfLose = netPoints.lose.toFixed(2)

    const gameData = gamesData[i]
    const winningTeam = gameData.teams[pick].name
    const losingTeam = gameData.teams[1 - pick].name

    const teamsColumn = `${winningTeam.padStart(14)} over ${losingTeam.padEnd(14)}`
    const rankColumn = `${rank.toString().padStart(2)} confidence`
    const bookmakerColumn = `Bookmaker: ${gameData.bookmaker.padEnd(longestBookmakerName + 1)}`
    const probColumn = `Prob: ${gameData.teams[pick].winProb.toString().padStart(7)}`
    const winColumn = `Win: ${pointsIfWin.toString().padStart(7)}`
    const lossColumn = `Loss: ${pointsIfLose.toString().padStart(7)}`
    const netColumn = `Net: ${pointsAvg.toString().padStart(7)}`
    const tableRow = [teamsColumn, rankColumn, bookmakerColumn, probColumn, winColumn, lossColumn, netColumn].join(''.padStart(5))

    console.log(tableRow)
  })

  console.log('')
  console.log(`Net Points Gained: ${best.net.toFixed(2)}`)
  console.log('')
  console.log(`First Place Probability: ${best.winProbs[0].toFixed(4)}`)
  console.log(`Second Place Probability: ${best.winProbs[1].toFixed(4)}`)
  console.log(`Third Place Probability: ${best.winProbs[2].toFixed(4)}`)
  console.log('')
  console.log(`Expected Payout: $${best.payout.toFixed(2)}`)
  console.log('')
}
