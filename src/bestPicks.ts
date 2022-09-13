import { ResultPoints } from './@types/gameData'
import { AWAY, HOME, MAX_RANK } from './constants'

interface GameToPick {
  [gameIndex: number]: { pick: number, rank: number, won?: number } | undefined
}

interface BestPick {
  net: number
  picks: Array<[number, number]>
}

interface Cache {
  [remainingGames: string]: BestPick
}

export const getBestPicks = (
  gameData: ResultPoints[][][],
  gameIndex: number = 0,
  gamesPicked: GameToPick = {},
  ranksPicked: Set<number> = new Set(),
  cache: Cache = { '': { net: 0, picks: [] } }
): BestPick => {
  const remainingRanks = new Array(gameData.length).fill(null).map((_, i) => MAX_RANK - i).filter((rank) => !ranksPicked.has(rank))
  const cacheKey = remainingRanks.join(' ')
  if (cache[cacheKey] !== undefined) {
    return cache[cacheKey]
  }

  const gamePick = gamesPicked[gameIndex]
  if (gamePick !== undefined) {
    const gameRankPickData = gameData[gameIndex][MAX_RANK - gamePick.rank][gamePick.pick]
    const pickData: BestPick = {
      net: (gamePick.won === 0) ? gameRankPickData.lose : gameRankPickData.win,
      picks: [[gamePick.pick, gamePick.rank]]
    }

    const resultantPickData = getBestPicks(gameData, gameIndex + 1, gamesPicked, ranksPicked, cache)
    pickData.net += resultantPickData.net
    pickData.picks.push(...resultantPickData.picks)

    cache[cacheKey] = pickData
    return pickData
  }

  const bestPickData: BestPick = { net: Number.MIN_SAFE_INTEGER, picks: [] }
  remainingRanks.forEach((rank) => {
    const gameRankData = gameData[gameIndex][MAX_RANK - rank]

    let teamPicked: 0 | 1
    const pickData: BestPick = { net: 0, picks: [] }
    if (gameRankData[AWAY].avg > gameRankData[HOME].avg) {
      pickData.net = gameRankData[AWAY].avg
      pickData.picks = [[AWAY, rank]]
      teamPicked = AWAY
    } else {
      pickData.net = gameRankData[HOME].avg
      pickData.picks = [[HOME, rank]]
      teamPicked = HOME
    }

    gamesPicked[gameIndex] = { pick: teamPicked, rank }
    ranksPicked.add(rank)

    const resultantPickData = getBestPicks(
      gameData,
      gameIndex + 1,
      gamesPicked,
      ranksPicked,
      cache
    )

    gamesPicked[gameIndex] = undefined
    ranksPicked.delete(rank)

    pickData.net += resultantPickData.net
    if (pickData.net > bestPickData.net) {
      bestPickData.net = pickData.net
      bestPickData.picks = [...pickData.picks, ...resultantPickData.picks]
    }
  })

  cache[cacheKey] = bestPickData
  return bestPickData
}
