const noVigOdds = (price1: number, price2: number): [number, number] => {
  const vigProb1 = 1 / price1
  const vigProb2 = 1 / price2

  const noVigProb1 = vigProb1 / (vigProb1 + vigProb2)
  const noVigProb2 = vigProb2 / (vigProb1 + vigProb2)

  return [noVigProb1, noVigProb2]
}

export default noVigOdds
