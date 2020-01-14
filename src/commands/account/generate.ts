import { ethers } from 'ethers'
import Command from '@oclif/command'
import { intro } from '../../setup'

export default class AccountGenerate extends Command {
  static description = 'generate a new account'

  async run() {
    const newAccount = ethers.Wallet.createRandom()
    intro(this, AccountGenerate.description)
    this.log(`Private Key: ${newAccount.privateKey.slice(2)}`)
    this.log(`Address:     ${newAccount.address}\n`)
    this.log('Store this private key for safe keeping.\n')
  }
}
