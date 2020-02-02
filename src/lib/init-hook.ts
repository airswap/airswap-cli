import chalk from 'chalk'
import { Hook } from '@oclif/config'
import available from 'available-versions'
import compare from 'compare-versions'
import * as emoji from 'node-emoji'
import { table } from 'table'

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
        `${emoji.get('package')} ${chalk.bold.green('UPDATE AVAILABLE')} Run ${chalk.bold(
          'yarn global add airswap@latest',
        )} to upgrade`,
      ],
    ]
    console.log(table(data, {}))
  }
}

export default hook
