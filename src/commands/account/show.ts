import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as keytar from 'keytar'
import { intro } from '../../setup'

export default class AccountShow extends Command {
  static description = 'show the current account'

  async run() {
    const signerPrivateKey = await keytar.getPassword('airswap-maker-kit', 'private-key')
    intro(this, AccountShow.description)

    if (!signerPrivateKey) {
      this.log(chalk.yellow(`\nNo account set. Set one with ${chalk.bold('account:set')}\n`))
    } else {
      const wallet = new ethers.Wallet(String(signerPrivateKey))
      this.log(`Private Key: ${signerPrivateKey}`)
      this.log(`Address:     ${wallet.address}\n`)
    }
  }
}
