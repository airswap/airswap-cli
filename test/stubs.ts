import BigNumber from 'bignumber.js'

const constants = require('../src/lib/constants.json')

export class StakingTokenContract {
  async approve() {
    return true
  }
  async indexes() {
    return constants.ADDRESS_ZERO
  }
  async createIndex() {
    return true
  }
  async setIntent() {
    return true
  }
  async getLocators() {
    return {
      locators: [],
    }
  }
  async swap() {
    return true
  }
  async allowance() {
    return new Promise(resolve => {
      resolve(new BigNumber(0))
    })
  }
  async balanceOf() {
    return new Promise(resolve => {
      resolve(new BigNumber(0))
    })
  }
}

export class DeltaContract {
  async walletAllowances() {
    return new Promise(resolve => {
      resolve([new BigNumber(0), new BigNumber(100)])
    })
  }
  async walletBalances() {
    return new Promise(resolve => {
      resolve([new BigNumber(0), new BigNumber(100)])
    })
  }
}

export const getMetadata = () =>
  new Promise(resolve => {
    resolve({
      byAddress: {
        a: {
          decimals: 1,
        },
        b: {
          decimals: 1,
        },
      },
    })
  })

export const getWallet = () =>
  new Promise(resolve => {
    resolve({
      provider: {
        getNetwork: async () => 4,
        getBalance: async () => new BigNumber(0),
      },
    })
  })
