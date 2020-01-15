import { expect, test } from '@oclif/test'
import { ethers } from 'ethers'
import * as utils from '../../src/lib/utils'
import { StakingTokenContract, getWallet, getMetadata } from '../stubs'
import { cli } from 'cli-ux'

describe('orders', () => {
  /*
  test
    .stdout()
    .stub(ethers, 'Contract', StakingTokenContract)
    .stub(utils, 'confirmTransaction', () => async () => false)
    .stub(utils, 'handleTransaction', () => true)
    .stub(cli, 'prompt', () => async () => 'buy')
    .command(['orders:get'])
    .it('gets an order', ctx => {
      expect(ctx.stdout).to.contain(`enable staking on the indexer`)
    })

  test
    .stdout()
    .stub(ethers, 'Contract', StakingTokenContract)
    .stub(utils, 'confirmTransaction', () => async () => false)
    .stub(utils, 'handleTransaction', () => true)
    .stub(cli, 'prompt', () => async () => 'buy')
    .command(['orders:best'])
    .it('gets best order', ctx => {
      expect(ctx.stdout).to.contain(`enable staking on the indexer`)
    })
    */
})
