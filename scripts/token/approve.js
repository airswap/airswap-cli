const ethers = require('ethers')
const chalk = require('chalk')

const ERC20 = require('../../contracts/ERC20.json')
const network = require('../lib/network.js')
const prompt = require('../lib/prompt.js')
const constants = require('../constants.js')

const fields = {
  token: {
    description: `Address of ${chalk.white.bold('token')} to trade`,
    type: 'Address',
  },
}

network.select('Approve a Token', wallet => {
  prompt.get(fields, values => {
    prompt.confirm('This will approve the Swap contract to transfer your tokens.', values, 'approve', () => {
      new ethers.Contract(values.token, ERC20.abi, wallet)
        .approve(process.env.SWAP_ADDRESS, constants.APPROVAL_AMOUNT)
        .then(prompt.handleTransaction)
        .catch(prompt.handleError)
    })
  })
})
