const ethers = require('ethers')
const chalk = require('chalk')
const ora = require('ora')
const network = require('../lib/network.js')
const constants = require('../../constants.js')

const tokenAmounts = require('../../token-prices.json')

const Indexer = require('@airswap/indexer/build/contracts/Indexer.json')
const indexerDeploys = require('@airswap/indexer/deploys.json')

async function createIndex(signerToken, senderToken, wallet) {
  const indexerAddress = indexerDeploys[wallet.provider.network.chainId]

  console.log(chalk.white(`Indexer ${indexerAddress}\n`))
  console.log(chalk.white(`Signer Token ${signerToken}`))
  console.log(chalk.white(`Sender Token ${senderToken}`))

  const indexerContract = new ethers.Contract(indexerAddress, Indexer.abi, wallet)

  const index = await indexerContract.indexes(signerToken, senderToken, constants.PROTOCOL_CODE)

  if (index !== constants.ADDRESS_ZERO) {
    console.log(`\n${chalk.yellow('Error')}: Index already exists`)
    console.log(`You can stake on this index using ${chalk.bold('yarn indexer:set')}\n`)
    return
  }

  return indexerContract.createIndex(signerToken, senderToken, constants.PROTOCOL_CODE)
}

network.select('Create Indices', async wallet => {
  for (const firstToken in tokenAmounts) {
    for (const secondToken in tokenAmounts[firstToken]) {
      const tx = await createIndex(firstToken, secondToken, wallet)

      if (tx != null) {
        console.log(chalk.underline(`https://${constants.etherscanDomains[tx.chainId]}/tx/${tx.hash}\n`))
        const spinner = ora(`Mining transaction (${constants.chainNames[tx.chainId]})...`).start()
        const txResp = await tx.wait(constants.DEFAULT_CONFIRMATIONS)
        spinner.succeed(`Transaction complete (${constants.DEFAULT_CONFIRMATIONS} confirmations)`)
      }
    }
  }
})
