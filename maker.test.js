const assert = require('assert')
const dotenv = require('dotenv')
const jayson = require('jayson')

const maker = require('./maker.js')
const server = require('./comms/web-express.js')
const constants = require('./scripts/constants.js')

const { orders } = require('@airswap/order-utils')

// Load the .env file
dotenv.config()

// JSON-RPC client instance
const client = jayson.client.http(`http://${process.env.BIND_ADDRESS}:${process.env.BIND_PORT}`)

// Dummy values for tokens and wallets
const senderWallet = '0x1FF808E34E4DF60326a3fc4c2b0F80748A3D60c2'
const senderToken = constants.rinkebyTokens.WETH
const signerToken = constants.rinkebyTokens.DAI
const unusedToken = constants.ADDRESS_ZERO

// Configure the network
server.configure(process.env.BIND_ADDRESS, process.env.BIND_PORT)

describe('Maker', function() {
  // Start the server before any tests
  before(function() {
    // Start the maker
    maker.start(
      server,
      process.env.ETHEREUM_ACCOUNT,
      constants.chainsIds.RINKEBY,
      function({ senderToken }) {
        return senderToken !== unusedToken
      },
      function() {
        return 0
      },
      function() {
        return 0
      },
      'error',
    )
  })

  // Stop the server after all tests
  after(function() {
    maker.stop()
  })

  // Test the getSenderSideQuote implementation
  describe('getSenderSideQuote', () => {
    it('should error for invalid pair', done => {
      client.request(
        'getSenderSideQuote',
        {
          signerParam: 1,
          signerToken,
          senderToken: unusedToken,
        },
        function(err, errorResponse) {
          if (err) throw err
          assert.equal(errorResponse.error && errorResponse.error.code, -33601)
          done()
        },
      )
    })
    it('should return a valid quote object', function(done) {
      client.request(
        'getSenderSideQuote',
        {
          signerParam: 1,
          signerToken,
          senderToken,
        },
        function(err, errorResponse, result) {
          if (err) throw err
          assert.equal(errorResponse, null)
          assert(orders.isValidQuote(result))
          done()
        },
      )
    })
  })

  // Test the getSignerSideQuote implementation
  describe('getSignerSideQuote', function() {
    it('should error for invalid pair', function(done) {
      client.request(
        'getSignerSideQuote',
        {
          senderParam: 1,
          signerToken,
          senderToken: unusedToken,
        },
        function(err, errorResponse) {
          if (err) throw err
          assert.equal(errorResponse.error && errorResponse.error.code, -33601)
          done()
        },
      )
    })
    it('should return a valid quote object', function(done) {
      client.request(
        'getSignerSideQuote',
        {
          senderParam: 1,
          signerToken,
          senderToken,
        },
        function(err, error, result) {
          if (err) throw err
          assert.equal(error, null)
          assert(orders.isValidQuote(result))
          done()
        },
      )
    })
  })

  // Test the getMaxQuote implementation
  describe('getMaxQuote', function() {
    it('should error for invalid pair', done => {
      client.request(
        'getMaxQuote',
        {
          signerToken,
          senderToken: unusedToken,
        },
        function(err, errorResponse) {
          if (err) throw err
          assert.equal(errorResponse.error && errorResponse.error.code, -33601)
          done()
        },
      )
    })
    it('should return a valid max quote', function(done) {
      client.request(
        'getMaxQuote',
        {
          signerToken,
          senderToken,
        },
        function(err, error, result) {
          if (err) throw err
          assert.equal(error, null)
          assert(orders.isValidQuote(result))
          done()
        },
      )
    })
  })

  // Test the getSenderSideOrder implementation
  describe('getSenderSideOrder', function() {
    it('should error for invalid pair', done => {
      client.request(
        'getSenderSideOrder',
        {
          signerParam: 1,
          signerToken,
          senderWallet,
          senderToken: unusedToken,
        },
        function(err, errorResponse) {
          if (err) throw err
          assert.equal(errorResponse.error && errorResponse.error.code, -33601)
          done()
        },
      )
    })
    it('should return a valid order object', function(done) {
      client.request(
        'getSenderSideOrder',
        {
          signerParam: 1,
          signerToken,
          senderWallet,
          senderToken,
        },
        function(err, error, result) {
          if (err) throw err
          assert.equal(error, null)
          assert(orders.isValidOrder(result))
          done()
        },
      )
    })
  })

  // Test the getSignerSideOrder implementation
  describe('getSignerSideOrder', function() {
    it('should error for invalid pair', done => {
      client.request(
        'getSignerSideOrder',
        {
          signerParam: 1,
          signerToken,
          senderWallet,
          senderToken: unusedToken,
        },
        function(err, errorResponse) {
          if (err) throw err
          assert.equal(errorResponse.error && errorResponse.error.code, -33601)
          done()
        },
      )
    })
    it('should return a valid order object', function(done) {
      client.request(
        'getSignerSideOrder',
        {
          signerToken,
          senderWallet,
          senderParam: 1,
          senderToken,
        },
        function(err, error, result) {
          if (err) throw err
          assert.equal(error, null)
          assert(orders.isValidOrder(result))
          done()
        },
      )
    })
  })
})
