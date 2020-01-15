import { expect, test } from '@oclif/test'
import { ethers } from 'ethers'
import * as utils from '../../src/lib/utils'
import { StakingTokenContract, getWallet, getMetadata } from '../stubs'

describe('quotes', () => {
  test
    .stdout()
    .stub(utils, 'getWallet', getWallet)
    .stub(utils, 'getMetadata', getMetadata)
    .stub(utils, 'promptToken', () => {
      return new Promise(resolve => {
        resolve({ addr: '0x0' })
      })
    })
    .stub(ethers, 'Contract', StakingTokenContract)
    .stub(utils, 'confirmTransaction', () => async () => false)
    .stub(utils, 'handleTransaction', () => true)
    .command(['tokens:approve'])
    .it('approve a token', ctx => {
      expect(ctx.stdout).to.contain(`approve a token for trading`)
    })

  test
    .stdout()
    .stub(utils, 'getWallet', getWallet)
    .stub(utils, 'updateMetadata', () => true)
    .command(['tokens:update'])
    .it('update token metadata', ctx => {
      expect(ctx.stdout).to.contain(`update local metadata`)
    })
})
