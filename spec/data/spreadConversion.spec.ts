import { expect } from 'chai'
import spreadToWinPercent from '../../src/data/spreadConversion';

describe(spreadToWinPercent, () => { 
  it('gives a 0.5 win chance when spread is 0', () => {
    expect(spreadToWinPercent(0)).to.eq(0.5);
  })
  
  it ('gives a 0 win chance when spread is 17', () => {
    expect(spreadToWinPercent(17)).to.eq(0);
  })

  it ('gives a 0 win chance when spread is greater than 17', () => {
    expect(spreadToWinPercent(20)).to.eq(0);
  })

  it ('gives a 1 win chance when spread is -17', () => {
    expect(spreadToWinPercent(-17)).to.eq(1);
  })
  
  it ('gives a 1 win chance when spread is less than -17', () => {
    expect(spreadToWinPercent(-20)).to.eq(1);
  })
})
