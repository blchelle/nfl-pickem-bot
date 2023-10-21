import { GameData, ResultPoints, calcNetResultPoints } from '@utils/game'
import { AWAY, HOME, MAX_RANK } from '@config/constants'

export interface BestProb {
  payout: number
  scenarioProb: number
  winProbs: number[]
  net: number
  picks: Pick[]
}

export interface BestPicks {
  net: number
  picks: Pick[]
}

export interface Pick {
  gameIndex: number
  pick: 0 | 1
  rank: number
  netPoints: ResultPoints
}

export type LockedGames = Record<number, { pick: 0 | 1, rank: number }>

export const getBestPicks = (games: GameData[], locked: LockedGames = {}): BestPicks => {
  const missingGames = MAX_RANK - games.length

  // Filter out games that have already happened this week
  let futureGames = games.filter(({ gameIndex }) => locked[gameIndex] === undefined)

  // Sort the array of games by the favourites probability of winning, then insert the locked games into their respective positions
  futureGames.sort((a, b) => Math.max(a.teams[AWAY].winProb, a.teams[HOME].winProb) - Math.max(b.teams[AWAY].winProb, b.teams[HOME].winProb))
  Object.entries(locked).sort(([,a], [,b]) => +a.rank - +b.rank).forEach(([gameIdx, { rank }]) => {
    const rankIndex = rank - missingGames - 1
    futureGames = [...futureGames.slice(0, rankIndex), games[+gameIdx], ...futureGames.slice(rankIndex)]
  })

  let maxPoints = 0
  for (let rank = MAX_RANK - games.length + 1; rank <= MAX_RANK; rank++) {
    maxPoints += rank
  }

  const minRank = MAX_RANK - games.length + 1
  const picks = futureGames.map(({ gameIndex, teams }, i): Pick => {
    const lockedPick = locked[gameIndex]
    const rank = i + minRank

    let pick: 0 | 1 = teams[AWAY].winProb > teams[HOME].winProb ? AWAY : HOME
    if (lockedPick !== undefined) {
      pick = lockedPick.pick
    }

    return {
      gameIndex,
      pick,
      rank,
      netPoints: calcNetResultPoints(futureGames[i], pick, rank, maxPoints)
    }
  })

  const net = picks.reduce((acc, pick) => acc + pick.netPoints.avg, 0)

  // Return picks back to their original order
  picks.sort((a, b) => a.gameIndex - b.gameIndex)

  return { net, picks }
}
