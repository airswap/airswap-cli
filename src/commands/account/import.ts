import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import { displayDescription } from '../../lib/utils'
import * as keytar from 'keytar'
import * as emoji from 'node-emoji'
import { get } from '../../lib/prompt'

export default class AccountImport extends Command {
  static description = 'import an ethereum account'

  async run() {
    displayDescription(this, AccountImport.description)

    try {
      const { signerPrivateKey }: any = await get({
        signerPrivateKey: {
          description: 'Private key',
          type: 'Private',
          hidden: true,
        },
      })

      const wallet = new ethers.Wallet(signerPrivateKey)
      await keytar.setPassword('airswap-cli', 'private-key', signerPrivateKey)
      this.log(`\n${emoji.get('white_check_mark')} Set account to address ${chalk.bold(wallet.address)}\n`)
    } catch (e) {
      this.log('\n\nCancelled.\n')
    }
  }
}
