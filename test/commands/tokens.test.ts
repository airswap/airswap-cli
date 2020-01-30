import { expect, test } from '@oclif/test'
import { ethers } from 'ethers'
import * as utils from '../../src/lib/utils'
import * as prompts from '../../src/lib/prompt'
import { StakingTokenContract, getWallet, getMetadata } from '../stubs'

describe('quotes', () => {
  test
    .stdout()
    .stub(utils, 'getWallet', getWallet)
    .stub(utils, 'getMetadata', getMetadata)
    .stub(prompts, 'promptToken', () => {
      return new Promise(resolve => {
        resolve({ addr: '0x0' })
      })
    })
    .stub(ethers, 'Contract', StakingTokenContract)
    .stub(prompts, 'confirmTransaction', () => async () => false)
    .stub(utils, 'handleTransaction', () => true)
    .command(['token:approve'])
    .it('approve a token', ctx => {
      expect(ctx.stdout).to.contain(`approve a token for trading`)
    })

  test
    .stdout()
    .stub(utils, 'getWallet', getWallet)
    .stub(utils, 'updateMetadata', () => true)
    .command(['token:fetch'])
    .it('update token metadata', ctx => {
      expect(ctx.stdout).to.contain(`update local metadata`)
    })
})
