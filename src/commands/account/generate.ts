import { ethers } from 'ethers'
import Command from '@oclif/command'
import { displayDescription } from '../../lib/utils'

export default class AccountGenerate extends Command {
  public static description = 'generate a new ethereum account'

  public async run() {
    const newAccount = ethers.Wallet.createRandom()
    displayDescription(this, AccountGenerate.description)
    this.log(`Private Key: ${newAccount.privateKey.slice(2)}`)
    this.log(`Address:     ${newAccount.address}\n`)
    this.log('Store this private key for safe keeping.\n')
  }
}
