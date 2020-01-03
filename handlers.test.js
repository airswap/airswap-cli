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

BigNumber.config({ ERRORS: false })
BigNumber.config({ EXPONENTIAL_AT: 1e9 })

function toAtomicAmount(amount, decimals) {
  return BigNumber(amount)
    .multipliedBy(BigNumber(10).pow(decimals))
    .toFixed(0)
}

describe('Setup', function() {
  before(() => {
    handlers = initializeHandlers(wallet.privateKey.slice(2))
  })

  it('ping', done => {
    handlers.ping({}, function(err, response) {
      assert(response === 'pong')
      done()
    })
  })
})

describe('Trading Pair Guard', function() {
  before(() => {
    handlers = initializeHandlers(wallet.privateKey.slice(2))
  })

  it('getSenderSideQuote: should fail for inactive token pair', done => {
    handlers.getSenderSideQuote(
      {
        signerAmount: 1,
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
        senderAmount: 1,
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
        signerAmount: 1,
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
        senderAmount: 1,
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

describe('Required Params', function() {
  before(() => {
    handlers = initializeHandlers(wallet.privateKey.slice(2))
  })

  it('getSenderSideQuote: should fail for insufficient params', done => {
    handlers.getSenderSideQuote(
      {
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
      },
      function(err) {
        assert(err && err.code === -33604)
        done()
      },
    )
  })

  it('getSignerSideQuote: should fail for insufficient params', done => {
    handlers.getSignerSideQuote(
      {
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
      },
      function(err) {
        assert(err && err.code === -33604)
        done()
      },
    )
  })

  // Test the getSenderSideOrder implementation
  it('getSenderSideOrder: should fail for insufficient params', done => {
    handlers.getSenderSideOrder(
      {
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
      },
      function(err) {
        assert(err && err.code === -33604)
        done()
      },
    )
  })

  // Test the getSignerSideOrder implementation
  it('getSignerSideOrder: should fail for insufficient params', done => {
    handlers.getSignerSideOrder(
      {
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
      },
      function(err) {
        assert(err && err.code === -33604)
        done()
      },
    )
  })
})

describe('Max Amount Guard', function() {
  it('getSenderSideQuote: 101 WETH should fail as above maximum amount', done => {
    handlers.getSenderSideQuote(
      {
        signerAmount: toAtomicAmount(101, constants.decimals.WETH),
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
      },
      function(err) {
        assert(err && err.code === -33603)
        done()
      },
    )
  })
  it('getSignerSideQuote: 20001 DAI should fail as above maximum amount', done => {
    handlers.getSignerSideQuote(
      {
        senderAmount: toAtomicAmount(20001, constants.decimals.DAI),
        senderToken: constants.rinkebyTokens.DAI,
        signerToken: constants.rinkebyTokens.WETH,
      },
      function(err) {
        assert(err && err.code === -33603)
        done()
      },
    )
  })
})

describe('Default Pricing Handlers', function() {
  it('getSenderSideQuote: given signer 1 WETH, should return sender 200 DAI', done => {
    handlers.getSenderSideQuote(
      {
        signerAmount: toAtomicAmount(1, constants.decimals.WETH),
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.sender.amount).eq(toAtomicAmount(200, constants.decimals.DAI)))
        done()
      },
    )
  })

  it('getSignerSideQuote: given sender 100 DAI, should return signer 0.5 WETH', done => {
    handlers.getSignerSideQuote(
      {
        senderAmount: toAtomicAmount(100, constants.decimals.DAI),
        senderToken: constants.rinkebyTokens.DAI,
        signerToken: constants.rinkebyTokens.WETH,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.signer.amount).eq(toAtomicAmount(0.5, constants.decimals.WETH)))
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
        assert(BigNumber(quote.signer.amount).eq(toAtomicAmount(100, constants.decimals.WETH)))
        assert(BigNumber(quote.sender.amount).eq(toAtomicAmount(20000, constants.decimals.DAI)))
        done()
      },
    )
  })

  it('getSenderSideOrder: given signer 2 WETH, should return sender 400 DAI', done => {
    handlers.getSenderSideOrder(
      {
        signerAmount: toAtomicAmount(2, constants.decimals.WETH),
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
        senderWallet,
      },
      function(err, order) {
        assert(orders.isValidOrder(order))
        assert(BigNumber(order.sender.amount).eq(toAtomicAmount(400, constants.decimals.DAI)))
        done()
      },
    )
  })

  it('getSignerSideOrder: given sender 3 WETH, should return signer 600 DAI', done => {
    handlers.getSignerSideOrder(
      {
        senderAmount: toAtomicAmount(3, constants.decimals.WETH),
        signerToken: constants.rinkebyTokens.DAI,
        senderToken: constants.rinkebyTokens.WETH,
        senderWallet,
      },
      function(err, order) {
        assert(orders.isValidOrder(order))
        assert(BigNumber(order.signer.amount).eq(toAtomicAmount(600, constants.decimals.DAI)))
        done()
      },
    )
  })
})

describe('Custom Pricing Data', function() {
  before(() => {
    handlers = initializeHandlers(
      wallet.privateKey.slice(2),
      {
        '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea': {
          '0xc778417e063141139fce010982780140aa0cd5ab': 0.005,
        },
        '0xc778417e063141139fce010982780140aa0cd5ab': {
          '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea': 150,
        },
      },
      {
        '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea': '20000000000000000000000',
        '0xc778417e063141139fce010982780140aa0cd5ab': '100000000000000000000',
      },
    )
  })
  it('getSenderSideQuote: given signer 1 DAI, should return sender 0.1 WETH', done => {
    handlers.getSenderSideQuote(
      {
        signerAmount: toAtomicAmount(1, constants.decimals.WETH),
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.sender.amount).eq(toAtomicAmount(150, constants.decimals.DAI)))
        done()
      },
    )
  })
})

describe('Custom Pricing Handlers', function() {
  before(() => {
    handlers = initializeHandlers(wallet.privateKey.slice(2), false, false, {
      isTradingPair({ signerToken, senderToken }) {
        if (signerToken === constants.rinkebyTokens.WETH && senderToken === constants.rinkebyTokens.DAI) {
          return true
        }
        return false
      },
      priceBuy({ senderAmount }) {
        const customPrice = 0.1
        return BigNumber(senderAmount)
          .multipliedBy(customPrice)
          .toFixed(0)
      },
      priceSell({ signerAmount }) {
        const customPrice = 10
        return BigNumber(signerAmount)
          .multipliedBy(customPrice)
          .toFixed(0)
      },
      getMaxAmount({ signerToken }) {
        if (signerToken === constants.rinkebyTokens.WETH) {
          return BigNumber(toAtomicAmount(50, constants.decimals.WETH))
        }
      },
    })
  })

  it('getSenderSideQuote: should fail for inactive token pair', done => {
    handlers.getSenderSideQuote(
      {
        signerAmount: toAtomicAmount(100, constants.decimals.DAI),
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
        signerAmount: toAtomicAmount(1, constants.decimals.WETH),
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.sender.amount).eq(toAtomicAmount(10, constants.decimals.DAI)))
        done()
      },
    )
  })

  it('getSignerSideQuote: given sender 1 DAI, should return sender 0.1 WETH', done => {
    handlers.getSignerSideQuote(
      {
        senderAmount: toAtomicAmount(1, constants.decimals.DAI),
        senderToken: constants.rinkebyTokens.DAI,
        signerToken: constants.rinkebyTokens.WETH,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.signer.amount).eq(toAtomicAmount(0.1, constants.decimals.WETH)))
        done()
      },
    )
  })

  it('getMaxQuote: should return a signer 50 WETH and sender 500 DAI', done => {
    handlers.getMaxQuote(
      {
        signerToken: constants.rinkebyTokens.WETH,
        senderToken: constants.rinkebyTokens.DAI,
      },
      function(err, quote) {
        assert(orders.isValidQuote(quote))
        assert(BigNumber(quote.signer.amount).eq(toAtomicAmount(50, constants.decimals.WETH)))
        assert(BigNumber(quote.sender.amount).eq(toAtomicAmount(500, constants.decimals.DAI)))
        done()
      },
    )
  })
})
