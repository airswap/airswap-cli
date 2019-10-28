const dotenv = require('dotenv')
const server = require('./maker.js')
const os = require('os')

// Load the .env file
dotenv.config()

// Start the server
server.start(
  process.env.BIND_PORT,
  process.env.BIND_ADDRESS,
  process.env.PRIVATE_KEY,
  process.env.WALLET_ADDRESS,
  process.env.SWAP_ADDRESS
)
