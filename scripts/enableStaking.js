const ethers = require('ethers')

const ERC20 = require('../contracts/ERC20.json')
const network = require('./lib/network.js')
const prompt = require('./lib/prompt.js')
const constants = require('./lib/constants.js')

network.select('Enable Staking', wallet => {
  prompt.confirm('This will approve the Indexer contract to transfer your AST.', 'approve', {}, () => {
    new ethers.Contract(constants.stakingTokenAddresses[wallet.provider.network.name], ERC20.abi, wallet)
      .approve(process.env.INDEXER_ADDRESS, constants.APPROVAL_AMOUNT)
      .then(prompt.handleTransaction)
      .catch(prompt.handleError)
  })
})
