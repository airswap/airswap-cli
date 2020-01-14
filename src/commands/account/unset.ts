import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import { intro } from '../../setup'
import * as keytar from 'keytar'
import * as emoji from 'node-emoji'

export default class AccountUnset extends Command {
  static description = 'unset the current account'

  async run() {
    const signerPrivateKey = await keytar.getPassword('airswap-maker-kit', 'private-key')

    intro(this, AccountUnset.description)

    if (signerPrivateKey) {
      const wallet = new ethers.Wallet(String(signerPrivateKey))

      this.log(`Private Key: ${signerPrivateKey}`)
      this.log(`Address:     ${wallet.address}\n`)

      if (await cli.confirm('Are you sure you want to delete the current account from disk?')) {
        await keytar.deletePassword('airswap-maker-kit', 'private-key')
        this.log(`\n${emoji.get('white_check_mark')} The account has been deleted.\n`)
      } else {
        this.log(chalk.yellow(`The account was not deleted.\n`))
      }
    } else {
      this.log(`There is no current account stored.\n`)
    }
  }
}
