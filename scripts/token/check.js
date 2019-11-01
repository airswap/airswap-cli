const ethers = require('ethers')
const chalk = require('chalk')
const network = require('../lib/network.js')
const prompt = require('../lib/prompt.js')

const IERC20 = require('@airswap/tokens/build/contracts/IERC20.json')

const fields = {
  token: {
    description: `Address of ${chalk.white.bold('token')} to check`,
    type: 'Address',
  },
}

network.select('Check an Approval', wallet => {
  prompt.get(fields, values => {
    new ethers.Contract(values.token, IERC20.abi, wallet)
      .allowance(wallet.address, process.env.SWAP_ADDRESS)
      .then(allowance => {
        if (allowance.eq(0)) {
          console.log(`\nThis token ${chalk.red.bold('is not')} approved. (Allowance: 0)\n`)
        } else {
          console.log(`\nThis token ${chalk.green.bold('is')} approved. (Allowance: ${allowance})\n`)
        }
      })
      .catch(prompt.handleError)
  })
})
