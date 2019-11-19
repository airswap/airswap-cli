const ethers = require('ethers')
const chalk = require('chalk')
const network = require('../lib/network.js')
const prompt = require('../lib/prompt.js')
const constants = require('../../constants.js')

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')
const swapDeploys = require('@airswap/swap/deploys.json')

const fields = {
  token: {
    description: `Address of ${chalk.white.bold('token')} to trade`,
    type: 'Address',
  },
}

network.select('Approve a Token', wallet => {
  const swapAddress = swapDeploys[wallet.provider.network.chainId]
  prompt.get(fields, values => {
    prompt.confirm('This will approve the Swap contract to transfer your tokens.', values, 'approve', () => {
      new ethers.Contract(values.token, IERC20.abi, wallet)
        .approve(swapAddress, constants.APPROVAL_AMOUNT)
        .then(prompt.handleTransaction)
        .catch(prompt.handleError)
    })
  })
})
