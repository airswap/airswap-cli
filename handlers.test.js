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

function toAtomicAmount(amount, decimals) {
  return BigNumber(amount)
    .multipliedBy(BigNumber(10).pow(decimals))
    .toFixed(0)
}

describe('Trading Pair Guard', function() {
  before(() => {
    handlers = initializeHandlers(wallet.privateKey.slice(2))
  })

  it('getSenderSideQuote: should fail for inactive token pair', done => {
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

  it('getSignerSideQuote: should fail for inactive token pair', done => {
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

  it('getMaxQuote: should fail for inactive token pair', done => {
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
  it('getSenderSideOrder: should fail for inactive token pair', done => {
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
  it('getSignerSideOrder: should fail for inactive token pair', done => {
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
  it('getSenderSideQuote: given signer 1 WETH, should return sender 200 DAI', done => {
    handlers.getSenderSideQuote(
      {
        signerParam: toAtomicAmount(1, constants.decimals.WETH),
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.sender.param).eq(toAtomicAmount(200, constants.decimals.DAI)))
        done()
      },
    )
  })

  it('getSignerSideQuote: given sender 100 DAI, should return signer 0.5 WETH', done => {
    handlers.getSignerSideQuote(
      {
        senderParam: toAtomicAmount(100, constants.decimals.DAI),
        senderToken: constants.rinkebyTokens.DAI,
        signerToken: constants.rinkebyTokens.WETH,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.signer.param).eq(toAtomicAmount(0.5, constants.decimals.WETH)))
        done()
      },
    )
  })

  it('getMaxQuote: should return a signer 100 WETH and sender 20000 DAI', done => {
    handlers.getMaxQuote(
      {
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.signer.param).eq(toAtomicAmount(100, constants.decimals.WETH)))
        assert(BigNumber(quote.sender.param).eq(toAtomicAmount(20000, constants.decimals.DAI)))
        done()
      },
    )
  })

  it('getSenderSideOrder: given signer 2 WETH, should return sender 400 DAI', done => {
    handlers.getSenderSideOrder(
      {
        signerParam: toAtomicAmount(2, constants.decimals.WETH),
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
        senderWallet,
      },
      function(err, order) {
        assert(orders.isValidOrder(order))
        assert(BigNumber(order.sender.param).eq(toAtomicAmount(400, constants.decimals.DAI)))
        done()
      },
    )
  })

  it('getSignerSideOrder: given sender 3 WETH, should return signer 600 DAI', done => {
    handlers.getSignerSideOrder(
      {
        senderParam: toAtomicAmount(3, constants.decimals.WETH),
        signerToken: constants.rinkebyTokens.DAI,
        senderToken: constants.rinkebyTokens.WETH,
        senderWallet,
      },
      function(err, order) {
        assert(orders.isValidOrder(order))
        assert(BigNumber(order.signer.param).eq(toAtomicAmount(600, constants.decimals.DAI)))
        done()
      },
    )
  })
})

describe('Custom Pricing Handlers', function() {
  before(() => {
    handlers = initializeHandlers(wallet.privateKey.slice(2), {
      priceBuy({ senderParam }) {
        const customPrice = 0.1
        return BigNumber(senderParam)
          .multipliedBy(customPrice)
          .toFixed(0)
      },
      priceSell({ signerParam }) {
        const customPrice = 10
        return BigNumber(signerParam)
          .multipliedBy(customPrice)
          .toFixed(0)
      },
      isTradingPair({ signerToken, senderToken }) {
        if (signerToken === constants.rinkebyTokens.WETH && senderToken === constants.rinkebyTokens.DAI) {
          return true
        }
        return false
      },
    })
  })

  it('getSenderSideQuote: should fail for inactive token pair', done => {
    handlers.getSenderSideQuote(
      {
        signerParam: toAtomicAmount(100, constants.decimals.DAI),
        unusedToken,
        senderToken,
      },
      function(err) {
        assert(err && err.code === -33601)
        done()
      },
    )
  })

  it('getSenderSideQuote: given signer 1 DAI, should return sender 0.1 WETH', done => {
    handlers.getSenderSideQuote(
      {
        signerParam: toAtomicAmount(1, constants.decimals.WETH),
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.sender.param).eq(toAtomicAmount(10, constants.decimals.DAI)))
        done()
      },
    )
  })

  it('getSignerSideQuote: given sender 1 DAI, should return sender 0.1 WETH', done => {
    handlers.getSignerSideQuote(
      {
        senderParam: toAtomicAmount(1, constants.decimals.DAI),
        senderToken: constants.rinkebyTokens.DAI,
        signerToken: constants.rinkebyTokens.WETH,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.signer.param).eq(toAtomicAmount(0.1, constants.decimals.WETH)))
        done()
      },
    )
  })
})
