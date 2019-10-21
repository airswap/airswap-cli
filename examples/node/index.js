const dotenv = require('dotenv')
const server = require('./maker.js')

// Load the .env file
dotenv.config()

// Start the server
server.start(process.env.PORT, process.env.PRIVATE_KEY, process.env.WALLET_ADDRESS, process.env.SWAP_ADDRESS)
