const chalk = require('chalk')
const ethers = require('ethers')
const wallet = ethers.Wallet.createRandom()

const check = require('./check.js')

check(() => {
  console.log(chalk.white.bold.underline('\nRandomly Generated Wallet\n'))
  console.log(`Private Key: ${wallet.privateKey.slice(2)}`)
  console.log(`Address:     ${wallet.address}`)
  console.log('\nStore these somewhere for your records.\n')
})
