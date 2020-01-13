import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import { intro } from '../../setup'
import * as keytar from 'keytar'
import * as emoji from 'node-emoji'

export default class AccountSet extends Command {
  static description = 'Set the current account'

  async run() {
    intro(this, AccountSet.description)

    let signerPrivateKey = await cli.prompt('Private Key')

    if (signerPrivateKey.indexOf('0x') === 0) {
      signerPrivateKey = signerPrivateKey.slice(2)
    }

    if (signerPrivateKey.length != 64) {
      this.log(chalk.yellow('\nPrivate key must be 64 characters long.\n'))
    } else {
      const wallet = new ethers.Wallet(signerPrivateKey)
      await keytar.setPassword('airswap-maker-kit', 'private-key', signerPrivateKey)
      this.log(`\n${emoji.get('white_check_mark')} Set account to ${chalk.bold(wallet.address)}\n`)
    }
  }
}
