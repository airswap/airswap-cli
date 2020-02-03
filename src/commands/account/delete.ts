import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import { cli } from 'cli-ux'
import { displayDescription } from '../../lib/utils'
import * as keytar from 'keytar'
import * as emoji from 'node-emoji'

export default class AccountDelete extends Command {
  static description = 'delete the current ethereum account'

  async run() {
    const signerPrivateKey = await keytar.getPassword('airswap-cli', 'private-key')
    displayDescription(this, AccountDelete.description)

    if (signerPrivateKey) {
      const wallet = new ethers.Wallet(String(signerPrivateKey))

      this.log(`Private Key: ${signerPrivateKey}`)
      this.log(`Address:     ${wallet.address}\n`)

      if (await cli.confirm('Are you sure you want to delete this private key? (yes/no)')) {
        await keytar.deletePassword('airswap-cli', 'private-key')
        this.log(`\n${emoji.get('white_check_mark')} The account has been unset.\n`)
      } else {
        this.log(chalk.yellow(`\nThe account was not unset.\n`))
      }
    } else {
      this.log(`There is no ethereum account stored.\n`)
    }
  }
}
