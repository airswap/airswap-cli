const dotenv = require('dotenv')
const ethers = require('ethers')
const chalk = require('chalk')
const os = require('os')
const constants = require('../../constants.js')
const check = require('../util/check.js')

dotenv.config()

module.exports = {
  select: function(operation, callback) {
    check(() => {
      try {
        console.log(`\n${chalk.white.bold('AirSwap')}: ${chalk.white.bold(operation)}`)

        // The private key used to sign orders
        if (!process.env.ETHEREUM_ACCOUNT) throw new Error('ETHEREUM_ACCOUNT must be set in your .env file')
        const currentAccount = new ethers.Wallet(Buffer.from(process.env.ETHEREUM_ACCOUNT, 'hex')).address
        const selectedNetwork = constants.chainNames[process.env.CHAIN_ID || '4']
        const networkName = process.env.CHAIN_ID === '1' ? chalk.green(selectedNetwork) : chalk.cyan(selectedNetwork)

        console.log(chalk.gray(`Account ${currentAccount} ${networkName}\n`))

        const signerPrivateKey = Buffer.from(process.env.ETHEREUM_ACCOUNT, 'hex')

        const provider = ethers.getDefaultProvider(selectedNetwork)
        const wallet = new ethers.Wallet(signerPrivateKey, provider)
        const publicAddress = wallet.address

        provider.getBalance(publicAddress).then(balance => {
          if (balance.eq(0)) {
            console.log(
              chalk.red('\n\nError ') +
                `The selected account (From .env: ${publicAddress}) must have some (${selectedNetwork}) ether to execute transactions.\n`,
            )
            return
          }
          callback(wallet)
        })
      } catch (error) {
        console.log(`\n${chalk.yellow('Error')}: ${error.reason || error.message || error}`)
      }
    })
  },
  getIPAddress: function() {
    const interfaces = os.networkInterfaces()
    for (const id in interfaces) {
      for (let i = 0; i < interfaces[id].length; i++) {
        if (interfaces[id][i].family === 'IPv4' && interfaces[id][i].address !== '127.0.0.1') {
          return interfaces[id][i].address
        }
      }
    }
  },
}
