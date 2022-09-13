const OFP_TEAM_TO_ODDS_API_TEAM = {
  arizona: 'arizona cardinals',
  atlanta: 'atlanta falcons',
  baltimore: 'baltimore ravens',
  buffalo: 'buffalo bills',
  carolina: 'carolina panthers',
  chicago: 'chicago bears',
  cincinnati: 'cincinnati bengals',
  cleveland: 'cleveland browns',
  dallas: 'dallas cowboys',
  denver: 'denver broncos',
  detroit: 'detroit lions',
  'green bay': 'green bay packers',
  houston: 'houston texans',
  indianapolis: 'indianapolis colts',
  jacksonville: 'jacksonville jaguars',
  'kansas city': 'kansas city chiefs',
  'las vegas': 'las vegas raiders',
  'la rams': 'los angeles rams',
  'la chargers': 'los angeles chargers',
  miami: 'miami dolphins',
  minnesota: 'minnesota vikings',
  'new england': 'new england patriots',
  'new orleans': 'new orleans saints',
  'ny giants': 'new york giants',
  'ny jets': 'new york jets',
  philadelphia: 'philadelphia eagles',
  pittsburgh: 'pittsburgh steelers',
  'san francisco': 'san francisco 49ers',
  seattle: 'seattle seahawks',
  'tampa bay': 'tampa bay buccaneers',
  tennessee: 'tennessee titans',
  washington: 'washington commanders'
}

const ofpTeamToOddsApiTeam = (team: string): string | undefined => {
  const key = team.toLowerCase() as keyof typeof OFP_TEAM_TO_ODDS_API_TEAM
  return OFP_TEAM_TO_ODDS_API_TEAM[key]
}

export default ofpTeamToOddsApiTeam
