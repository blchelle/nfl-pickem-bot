import dotenv from 'dotenv'
dotenv.config()

export default {
  useOdds: process.argv.includes('--odds'),
  useOfp: process.argv.includes('--ofp'),
  odds: {
    apiKey: process.env.ODDS_API_KEY
  },
  ofp: {
    email: process.env.OFP_EMAIL,
    password: process.env.OFP_PASSWORD
  }
}
