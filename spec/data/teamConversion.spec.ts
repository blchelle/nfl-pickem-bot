import { expect } from 'chai'
import ofpTeamToOddsApiTeam from '../../src/data/teamConversion';

describe(ofpTeamToOddsApiTeam, () => {
  it('works for a matching lowercase team name', () => {
    expect(ofpTeamToOddsApiTeam('arizona')).to.eq('arizona cardinals');
  })

  it('works for a matching capitalized team name', () => {
    expect(ofpTeamToOddsApiTeam('Arizona')).to.eq('arizona cardinals');
  })

  it('works for a matching mixed case team name', () => {
    expect(ofpTeamToOddsApiTeam('AriZonA')).to.eq('arizona cardinals');
  })

  it('returns undefined for non-matching team name', () => {
    expect(ofpTeamToOddsApiTeam('edmonton')).to.be.undefined;
  })
})
