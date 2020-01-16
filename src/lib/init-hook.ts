import chalk from 'chalk'
import { Hook } from '@oclif/config'

const hook: Hook<'init'> = async function(options) {
  console.log(chalk.gray.bold(`AirSwap CLI ${options.config.version} — https://support.airswap.io/`))
}

export default hook
