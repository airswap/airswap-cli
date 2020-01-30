import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import { displayDescription } from '../../lib/utils'
import * as keytar from 'keytar'
import * as emoji from 'node-emoji'

export default class AccountSet extends Command {
  static description = 'set the current ethereum account'

  async run() {
    displayDescription(this, AccountSet.description)

    let signerPrivateKey = await cli.prompt('Private Key', { type: 'mask' })

    if (signerPrivateKey.indexOf('0x') === 0) {
      signerPrivateKey = signerPrivateKey.slice(2)
    }

    if (signerPrivateKey.length != 64) {
      this.log(chalk.yellow('\nPrivate key must be 64 characters long.\n'))
    } else {
      const wallet = new ethers.Wallet(signerPrivateKey)
      await keytar.setPassword('airswap-maker-kit', 'private-key', signerPrivateKey)
      this.log(`\n${emoji.get('white_check_mark')} Set account to address ${chalk.bold(wallet.address)}\n`)
    }
  }
}
