interface SpreadToProbMap {
  [key: number]: number
}

const SPREAD_TO_PROB: SpreadToProbMap = {
  0: 0.500,
  0.5: 0.500,
  1: 0.513,
  1.5: 0.525,
  2: 0.535,
  2.5: 0.545,
  3: 0.594,
  3.5: 0.643,
  4: 0.658,
  4.5: 0.673,
  5: 0.681,
  5.5: 0.690,
  6: 0.707,
  6.5: 0.724,
  7: 0.752,
  7.5: 0.781,
  8: 0.791,
  8.5: 0.802,
  9: 0.807,
  9.5: 0.811,
  10: 0.836,
  10.5: 0.860,
  11: 0.871,
  11.5: 0.882,
  12: 0.885,
  12.5: 0.887,
  13: 0.893,
  13.5: 0.900,
  14: 0.924,
  14.5: 0.949,
  15: 0.956,
  15.5: 0.963,
  16: 0.981,
  16.5: 0.998,
  17: 0.999
}

const spreadToWinPercent = (spread: number): number => {
  const favoriteWinChance = SPREAD_TO_PROB[Math.abs(spread)] ?? 0.999
  return spread < 0 ? favoriteWinChance : 1 - favoriteWinChance
}

export default spreadToWinPercent
