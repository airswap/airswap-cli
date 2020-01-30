import { expect, test } from '@oclif/test'
import { ethers } from 'ethers'
import * as utils from '../../src/lib/utils'
import * as prompts from '../../src/lib/prompt'
import { StakingTokenContract, getWallet, getMetadata } from '../stubs'
import { cli } from 'cli-ux'

describe('intent', () => {
  test
    .stdout()
    .stub(utils, 'getWallet', getWallet)
    .stub(utils, 'getMetadata', getMetadata)
    .stub(ethers, 'Contract', StakingTokenContract)
    .stub(prompts, 'confirmTransaction', () => async () => true)
    .stub(utils, 'handleTransaction', () => true)
    .command(['intent:enable'])
    .it('enable intent on the indexer', ctx => {
      expect(ctx.stdout).to.contain(`enable staking on the indexer`)
    })

  test
    .stdout()
    .stub(utils, 'getWallet', getWallet)
    .stub(utils, 'getMetadata', getMetadata)
    .stub(ethers, 'Contract', StakingTokenContract)
    .stub(prompts, 'promptTokens', () => {
      return new Promise(resolve => {
        resolve({
          first: { addr: '0x0' },
          second: { addr: '0x0' },
        })
      })
    })
    .command(['intent:get'])
    .it('get intents from the indexer', ctx => {
      expect(ctx.stdout).to.contain(`No locators found.`)
    })

  test
    .stdout()
    .stub(utils, 'getWallet', getWallet)
    .stub(utils, 'getMetadata', getMetadata)
    .stub(ethers, 'Contract', StakingTokenContract)
    .stub(prompts, 'promptTokens', () => {
      return new Promise(resolve => {
        resolve({
          first: { addr: '0x0' },
          second: { addr: '0x0' },
        })
      })
    })
    .stub(prompts, 'confirmTransaction', () => async () => true)
    .stub(utils, 'handleTransaction', () => true)
    .command(['intent:new'])
    .it('create a new pair', ctx => {
      expect(ctx.stdout).to.contain(`create an index for a new token pair`)
    })

  test
    .stdout()
    .stub(utils, 'getWallet', getWallet)
    .stub(utils, 'getMetadata', getMetadata)
    .stub(ethers, 'Contract', StakingTokenContract)
    .stub(prompts, 'promptTokens', () => {
      return new Promise(resolve => {
        resolve({
          first: { addr: '0x0' },
          second: { addr: '0x0' },
        })
      })
    })
    .stub(cli, 'prompt', () => async () => null)
    .stub(prompts, 'confirmTransaction', () => async () => true)
    .stub(utils, 'handleTransaction', () => true)
    .command(['intent:set'])
    .it('set intent', ctx => {
      expect(ctx.stdout).to.contain(`set an intent`)
    })

  test
    .stdout()
    .stub(utils, 'getWallet', getWallet)
    .stub(utils, 'getMetadata', getMetadata)
    .stub(ethers, 'Contract', StakingTokenContract)
    .stub(prompts, 'promptTokens', () => {
      return new Promise(resolve => {
        resolve({
          first: { addr: '0x0' },
          second: { addr: '0x0' },
        })
      })
    })
    .stub(cli, 'prompt', () => async () => null)
    .stub(prompts, 'confirmTransaction', () => async () => true)
    .stub(utils, 'handleTransaction', () => true)
    .command(['intent:unset'])
    .it('unset intent', ctx => {
      expect(ctx.stdout).to.contain(`unset an intent`)
    })
})
