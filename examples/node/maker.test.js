const assert = require('assert')
const dotenv = require('dotenv')
const server = require('./maker.js')
const jayson = require('jayson')

const { orders } = require('@airswap/order-utils')

// Load the .env file
dotenv.config()

// JSON-RPC client instance
const client = jayson.client.http(`http://localhost:${process.env.PORT}`)

// Dummy values for tokens and wallets
const signerToken = '0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8'
const senderWallet = '0x1FF808E34E4DF60326a3fc4c2b0F80748A3D60c2'
const senderToken = '0xc778417e063141139fce010982780140aa0cd5ab'
const unusedToken = '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea'

describe('Maker', function() {
  // Start the server before any tests
  before(function() {
    server.start(
      process.env.PORT,
      process.env.PRIVATE_KEY,
      process.env.WALLET_ADDRESS,
      process.env.SWAP_ADDRESS,
      'error'
    )
  })

  // Stop the server after all tests
  after(function() {
    server.stop()
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
        function(err, error, result) {
          if (err) throw err
          assert.equal(error && error.code, -33601)
          done()
        }
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
        function(err, error, result) {
          if (err) throw err
          assert.equal(error, null)
          assert(orders.isValidQuote(result))
          done()
        }
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
        function(err, error, result) {
          if (err) throw err
          assert.equal(error && error.code, -33601)
          done()
        }
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
        }
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
        function(err, error, result) {
          if (err) throw err
          assert.equal(error && error.code, -33601)
          done()
        }
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
        }
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
        function(err, error, result) {
          if (err) throw err
          assert.equal(error && error.code, -33601)
          done()
        }
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
        }
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
        function(err, error, result) {
          if (err) throw err
          assert.equal(error && error.code, -33601)
          done()
        }
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
        }
      )
    })
  })
})
