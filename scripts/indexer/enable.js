const ethers = require('ethers')
const network = require('../lib/network.js')
const prompt = require('../lib/prompt.js')
const constants = require('../constants.js')

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')

network.select('Enable Staking', wallet => {
  prompt.confirm('This will approve the Indexer contract to stake your AST.', {}, 'approve', () => {
    new ethers.Contract(constants.stakingTokenAddresses[wallet.provider.network.name], IERC20.abi, wallet)
      .approve(process.env.INDEXER_ADDRESS, constants.APPROVAL_AMOUNT)
      .then(prompt.handleTransaction)
      .catch(prompt.handleError)
  })
})
