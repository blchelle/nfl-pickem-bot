import dotenv from 'dotenv'
dotenv.config()

export default {
  useOfp: process.argv.includes('--ofp'),
  ofp: {
    email: process.env.OFP_EMAIL,
    password: process.env.OFP_PASSWORD
  }
}
