const dotenv = require('dotenv')
const ethers = require('ethers')
const colors = require('colors/safe')
const prompt = require('prompt')

dotenv.config()
prompt.message = ''
prompt.start()

let selectedNetwork

const tokenABI = [
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    type: 'function',
  },
]
const tokenAddresses = {
  rinkeby: '0xcc1cbd4f67cceb7c001bd4adf98451237a193ff8',
  mainnet: '0x27054b13b1b798b345b591a4d22e6562d47ea75a',
}
const etherscanDomains = {
  rinkeby: 'rinkeby.etherscan.io',
  mainnet: 'etherscan.io',
}

const schema = {
  properties: {
    network: {
      description: colors.white('Select a ') + colors.magenta('network ') + colors.gray('(rinkeby, mainnet)'),
      pattern: /[a-zA-Z0-9]{0,}/,
      default: 'rinkeby',
      required: true,
    },
  },
}

prompt.get(schema, function(err, result) {
  if (!err) {
    selectedNetwork = result.network
    signerPrivateKey = Buffer.from(process.env.PRIVATE_KEY, 'hex')
    const publicAddress = new ethers.Wallet(signerPrivateKey).address

    let provider = ethers.getDefaultProvider(selectedNetwork)
    provider.getBalance(publicAddress).then(balance => {
      if (balance.toNumber() === 0) {
        console.log(
          colors.red('\r\n\r\nError ') +
            `The selected account (From .env: ${publicAddress}) must have some (${selectedNetwork}) ether to execute transactions.\r\n`
        )
        return
      }
      prompt.get(
        {
          properties: {
            signerToken: {
              description:
                colors.white('Address of ') + colors.green('signerToken ') + colors.white('you intend to trade'),
              pattern: /^0x[a-fA-F0-9]{40}$/,
              message: 'Must be an Ethereum address',
              required: true,
            },
            senderToken: {
              description:
                colors.white('Address of ') + colors.yellow('senderToken ') + colors.white('you intend to trade'),
              pattern: /^0x[a-fA-F0-9]{40}$/,
              message: 'Must be an Ethereum smart contract address',
              required: true,
            },
            locator: {
              description: colors.white('Locator of your server ') + colors.gray('(hostname and port)'),
              pattern: /[a-zA-Z0-9]{0,}/,
              message: 'Must be a 32 character string (e.g. maker.ethereum.org:80 or 10.15.2.99:4000)',
              required: true,
            },
            stakeAmount: {
              description: colors.white('Amount of ') + colors.cyan('AirSwap Token (AST) ') + colors.white('to stake'),
              pattern: /[0-9]/,
              message: 'Must be a number',
              default: 0,
              required: true,
            },
          },
        },
        function(err, result) {
          if (err) {
            console.log('\r\n\r\nCancelled\r\n')
            return
          }

          const contract = new ethers.Contract(tokenAddresses[selectedNetwork], tokenABI, provider)
          contract.balanceOf(publicAddress).then(balance => {
            const bal = balance.toNumber() * 10000
            if (bal < result.stakeAmount) {
              console.log(
                colors.red('\r\n\r\nError ') +
                  `The selected account cannot stake ${result.stakeAmount} AST. Its balance is ${bal}.\r\n`
              )
            } else {
              console.log(colors.green('\r\nTransaction Review: Set Intent'))
              console.log(`Staker:      ${publicAddress}`)
              console.log(`stakeAmount: ${result.stakeAmount}`)
              console.log(`signerToken: ${result.signerToken}`)
              console.log(`senderToken: ${result.senderToken}`)
              console.log(`Locator:     ${result.locator}`)

              prompt.get(
                {
                  properties: {
                    confirm: {
                      description: 'To send this transaction, type ' + colors.green('send'),
                    },
                  },
                },
                function(err, result) {
                  if (err || result.confirm !== 'send') {
                    console.log('\r\n\r\nCancelled\r\n')
                    return
                  }
                  const txid = '0x58985743e80486383db1611c60a3026428b2cb6e05b9ec583a7541e2f5de7750'
                  console.log(`\r\nTransaction submitted: https://${etherscanDomains[selectedNetwork]}/tx/${txid}`)
                  // TODO: Execute and print TXID / Etherscan Link
                }
              )
            }
          })
        }
      )
    })
  }
})
