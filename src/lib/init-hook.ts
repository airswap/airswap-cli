import chalk from 'chalk'
import { Hook } from '@oclif/config'
import available from 'available-versions'
import compare from 'compare-versions'
import * as emoji from 'node-emoji'
import { table } from 'table'
import * as utils from '../lib/utils'

const hook: Hook<'init'> = async function(options) {
  console.log(chalk.gray.bold(`AirSwap CLI ${options.config.version} — https://support.airswap.io/`))
  var query = {
    name: 'airswap',
  }
  const result = await available(query)
  if (compare(options.config.version, result['dist-tags'].latest) === -1) {
    console.log()
    const data = [
      [
        `${emoji.get('package')} ${chalk.bold.green('New version available')} (${
          result['dist-tags'].latest
        }) Update with ${chalk.bold('yarn global add airswap@latest')}`,
      ],
    ]
    console.log(table(data, {}))
  }

  /*
  const { fastest, safeLow } = await utils.getCurrentGasPrices()
  const gasPrice = (await utils.getGasPrice(this, true)).toNumber()

  if (gasPrice > fastest) {
    console.log(chalk.yellow(`Your gas setting is high (${gasPrice}). You can update it with the gas command.`))
  }
  if (gasPrice < safeLow) {
    console.log(chalk.yellow(`Your gas setting is low (${gasPrice}). You can update it with the gas command.`))
  }
  */
}

export default hook
