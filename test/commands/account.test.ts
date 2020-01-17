import { expect, test } from '@oclif/test'
import { ethers } from 'ethers'
import { cli } from 'cli-ux'
import * as keytar from 'keytar'

const constants = require('../../src/lib/constants.json')
const dummyKey = '0000000000000000000000000000000000000000000000000000000000000000'
class Wallet {
  address = constants.ADDRESS_ZERO
}

describe('account', () => {
  test
    .stdout()
    .command(['account:generate'])
    .it('generates an account', ctx => {
      expect(ctx.stdout).to.contain('Store this private key for safe keeping')
    })

  test
    .stdout()
    .stub(cli, 'prompt', () => async () => 'A')
    .command(['account:set'])
    .it('sets an invalid account', ctx => {
      expect(ctx.stdout).to.contain('Private key must be 64 characters long')
    })

  test
    .stdout()
    .stub(cli, 'prompt', () => async () => dummyKey)
    .stub(ethers, 'Wallet', Wallet)
    .stub(keytar, 'setPassword', () => async () => true)
    .command(['account:set'])
    .it('sets a valid account', ctx => {
      expect(ctx.stdout).to.contain(`Set account to address ${constants.ADDRESS_ZERO}`)
    })

  test
    .stdout()
    .stub(ethers, 'Wallet', Wallet)
    .stub(keytar, 'getPassword', () => async () => true)
    .command(['account:show'])
    .it('shows the current account', ctx => {
      expect(ctx.stdout).to.contain(`Address:     ${constants.ADDRESS_ZERO}`)
    })

  test
    .stdout()
    .stub(cli, 'confirm', () => async () => 'yes')
    .stub(ethers, 'Wallet', Wallet)
    .stub(keytar, 'deletePassword', () => async () => true)
    .command(['account:unset'])
    .it('unsets the current account', ctx => {
      expect(ctx.stdout).to.contain(`The account has been unset.`)
    })
})
