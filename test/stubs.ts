import BigNumber from 'bignumber.js'

export class StakingTokenContract {
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
