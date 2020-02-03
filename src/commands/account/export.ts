import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import * as keytar from 'keytar'
import { displayDescription } from '../../lib/utils'

export default class AccountExport extends Command {
  static description = 'export the current ethereum account'

  async run() {
    const signerPrivateKey = await keytar.getPassword('airswap-cli', 'private-key')
    displayDescription(this, AccountExport.description)

    if (!signerPrivateKey) {
      this.log(chalk.yellow(`\nNo account set. Set one with ${chalk.bold('account:set')}\n`))
    } else {
      const wallet = new ethers.Wallet(String(signerPrivateKey))
      this.log(`Private key: ${signerPrivateKey}`)
      this.log(`Address:     ${wallet.address}\n`)
    }
  }
}
