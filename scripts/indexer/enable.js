const ethers = require('ethers')
const network = require('../lib/network.js')
const prompt = require('../lib/prompt.js')
const constants = require('../constants.js')

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

network.select('Enable Staking', wallet => {
  const indexerAddress = indexerDeploys[wallet.provider.network.chainId]
  prompt.confirm('This will approve the Indexer contract to stake your AST.', {}, 'approve', () => {
    new ethers.Contract(constants.stakingTokenAddresses[wallet.provider.network.chainId], IERC20.abi, wallet)
      .approve(indexerAddress, constants.APPROVAL_AMOUNT)
      .then(prompt.handleTransaction)
      .catch(prompt.handleError)
  })
})
