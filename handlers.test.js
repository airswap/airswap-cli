const assert = require('assert')
const ethers = require('ethers')
const BigNumber = require('bignumber.js')
const constants = require('./constants.js')
const { orders } = require('@airswap/order-utils')

const wallet = ethers.Wallet.createRandom()
const initializeHandlers = require('./handlers.js')

// Dummy values for tokens and wallets
const senderWallet = '0x1FF808E34E4DF60326a3fc4c2b0F80748A3D60c2'
const senderToken = constants.rinkebyTokens.DAI
const signerToken = constants.rinkebyTokens.WETH
const unusedToken = constants.ADDRESS_ZERO

let handlers

describe('Trading Pair Guard', function() {
  before(() => {
    handlers = initializeHandlers(wallet.privateKey.slice(2))
  })

  it('getSenderSideQuote: should not be trading bad token', function(done) {
    handlers.getSenderSideQuote(
      {
        signerParam: 1,
        unusedToken,
        senderToken,
      },
      function(err) {
        assert(err && err.code === -33601)
        done()
      },
    )
  })

  it('getSignerSideQuote: should not be trading bad token', function(done) {
    handlers.getSignerSideQuote(
      {
        senderParam: 1,
        signerToken,
        unusedToken,
      },
      function(err) {
        assert(err && err.code === -33601)
        done()
      },
    )
  })

  it('getMaxQuote: should not be trading bad token', function(done) {
    handlers.getMaxQuote(
      {
        unusedToken,
        senderToken,
      },
      function(err) {
        assert(err && err.code === -33601)
        done()
      },
    )
  })

  // Test the getSenderSideOrder implementation
  it('getSenderSideOrder: should not be trading bad token', function(done) {
    handlers.getSenderSideOrder(
      {
        signerParam: 1,
        signerToken,
        unusedToken,
        senderWallet,
      },
      function(err) {
        assert(err && err.code === -33601)
        done()
      },
    )
  })

  // Test the getSignerSideOrder implementation
  it('getSignerSideOrder: should not be trading bad token', function(done) {
    handlers.getSignerSideOrder(
      {
        senderParam: 1,
        unusedToken,
        senderToken,
        senderWallet,
      },
      function(err) {
        assert(err && err.code === -33601)
        done()
      },
    )
  })
})

describe('Default Pricing Handlers', function() {
  it('getSenderSideQuote: given signerParam 100, should return senderParam 10', function(done) {
    handlers.getSenderSideQuote(
      {
        signerParam: 100,
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.sender.param).eq(10))
        done()
      },
    )
  })

  it('getSignerSideQuote: given senderParam 100, should return signerParam 10', function(done) {
    handlers.getSignerSideQuote(
      {
        senderParam: 100,
        senderToken: constants.rinkebyTokens.WETH,
        signerToken: constants.rinkebyTokens.DAI,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.signer.param).eq(10))
        done()
      },
    )
  })

  it('getMaxQuote: should return a signerParam 1000 and senderParam 100', function(done) {
    handlers.getMaxQuote(
      {
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.signer.param).eq(1000))
        assert(BigNumber(quote.sender.param).eq(100))
        done()
      },
    )
  })

  it('getSenderSideOrder: given signerParam 200, should return senderParam 20', function(done) {
    handlers.getSenderSideOrder(
      {
        signerParam: 200,
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
        senderWallet,
      },
      function(err, order) {
        assert(orders.isValidOrder(order))
        assert(BigNumber(order.sender.param).eq(20))
        done()
      },
    )
  })

  it('getSignerSideOrder: given senderParam 300, should return signerParam 30', function(done) {
    handlers.getSignerSideOrder(
      {
        senderParam: 300,
        signerToken: constants.rinkebyTokens.DAI,
        senderToken: constants.rinkebyTokens.WETH,
        senderWallet,
      },
      function(err, order) {
        assert(orders.isValidOrder(order))
        assert(BigNumber(order.signer.param).eq(30))
        done()
      },
    )
  })
})

describe('Custom Pricing Handlers', function() {
  before(() => {
    handlers = initializeHandlers(wallet.privateKey.slice(2), {
      priceBuy() {
        return '1010'
      },
      priceSell() {
        return '1010'
      },
      isTradingPair({ signerToken }) {
        if (signerToken === constants.rinkebyTokens.DAI) {
          return true
        }
        return false
      },
    })
  })

  it('getSenderSideQuote: should not be trading bad token', function(done) {
    handlers.getSenderSideQuote(
      {
        signerParam: 1,
        unusedToken,
        senderToken,
      },
      function(err) {
        assert(err && err.code === -33601)
        done()
      },
    )
  })

  it('getSenderSideQuote: given any signerParam, should return senderParam 1010', function(done) {
    handlers.getSenderSideQuote(
      {
        signerParam: 100,
        signerToken: constants.rinkebyTokens.DAI,
        senderToken: constants.rinkebyTokens.WETH,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.sender.param).eq(1010))
        done()
      },
    )
  })

  it('getSignerSideQuote: given any senderParam, should return signerParam 1010', function(done) {
    handlers.getSignerSideQuote(
      {
        senderParam: 100,
        senderToken: constants.rinkebyTokens.WETH,
        signerToken: constants.rinkebyTokens.DAI,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.signer.param).eq(1010))
        done()
      },
    )
  })
})
