import chalk from 'chalk'
import { ethers } from 'ethers'
import { Command } from '@oclif/command'
import { displayDescription } from '../../lib/utils'
import * as keytar from 'keytar'
import * as emoji from 'node-emoji'
import { get } from '../../lib/prompt'

export default class AccountSet extends Command {
  static description = 'set the current ethereum account'

  async run() {
    displayDescription(this, AccountSet.description)

    let { signerPrivateKey }: any = await get({
      signerPrivateKey: {
        type: 'Private',
        hidden: true,
      },
    })

    const wallet = new ethers.Wallet(signerPrivateKey)
    await keytar.setPassword('airswap-maker-kit', 'private-key', signerPrivateKey)
    this.log(`\n${emoji.get('white_check_mark')} Set account to address ${chalk.bold(wallet.address)}\n`)
  }
}
