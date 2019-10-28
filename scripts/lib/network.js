const dotenv = require('dotenv')
const ethers = require('ethers')
const prompt = require('prompt')
const chalk = require('chalk')

dotenv.config()

module.exports = {
  select: function(operation, callback) {
    const schema = {
      properties: {
        network: {
          description: chalk.white('Select a network ') + chalk.gray('(rinkeby, mainnet)'),
          pattern: /[a-zA-Z0-9]{0,}/,
          default: 'rinkeby',
          required: true,
        },
      },
    }

    const currentAccount = new ethers.Wallet(Buffer.from(process.env.PRIVATE_KEY, 'hex')).address

    console.log()
    console.log(`${chalk.white.bold('AirSwap')}: ${chalk.white.bold(operation)}`)
    console.log(chalk.gray(`Current account ${currentAccount}`))
    console.log()

    prompt.get(schema, function(err, result) {
      if (!err) {
        selectedNetwork = result.network
        signerPrivateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex')

        try {
          const provider = ethers.getDefaultProvider(selectedNetwork)
          const wallet = new ethers.Wallet(signerPrivateKey, provider)
          const publicAddress = wallet.address

          provider.getBalance(publicAddress).then(balance => {
            if (balance.eq(0)) {
              console.log(
                colors.red('\r\n\r\nError ') +
                  `The selected account (From .env: ${publicAddress}) must have some (${selectedNetwork}) ether to execute transactions.\r\n`
              )
              return
            }
            callback(wallet)
          })
        } catch (error) {
          console.log(`\r\n${chalk.yellow('Error')}: ${error.reason}`)
        }
      }
    })
  },
}
