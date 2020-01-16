import { expect, test } from '@oclif/test'
import { ethers } from 'ethers'
import * as utils from '../../src/lib/utils'
import * as prompts from '../../src/lib/prompts'
import * as requests from '../../src/lib/requests'
import { StakingTokenContract, getWallet, getMetadata } from '../stubs'
import { cli } from 'cli-ux'
import { orders } from '@airswap/order-utils'

describe('orders', () => {
  test
    .stdout()
    .stub(utils, 'getWallet', getWallet)
    .stub(utils, 'getMetadata', getMetadata)
    .stub(
      requests,
      'getRequest',
      () =>
        new Promise(resolve => {
          resolve({
            method: 'testRequest',
            signerToken: {},
            senderToken: {},
          })
        }),
    )
    .stub(prompts, 'printObject', () => true)
    .stub(requests, 'multiPeerCall', (wallet, method, params, callback) => {
      callback({ signer: {}, sender: {}, affiliate: {}, signature: { validator: '' } }, 'google.com', [])
    })
    .stub(ethers, 'Contract', StakingTokenContract)
    .stub(prompts, 'confirmTransaction', () => async () => false)
    .stub(utils, 'handleTransaction', () => true)
    .command(['orders:best'])
    .it('gets best order', ctx => {
      expect(ctx.stdout).to.contain(`get the best available order`)
    })

  test
    .stdout()
    .stub(utils, 'getWallet', getWallet)
    .stub(utils, 'getMetadata', getMetadata)
    .stub(
      requests,
      'getRequest',
      () =>
        new Promise(resolve => {
          resolve({
            method: 'testRequest',
            signerToken: {},
            senderToken: {},
          })
        }),
    )
    .stub(cli, 'prompt', () => async () => 'A')
    .stub(prompts, 'printObject', () => true)
    .stub(requests, 'peerCall', (locator, method, params, callback) => {
      callback(null, { signer: {}, sender: {}, affiliate: {}, signature: { validator: '' } })
    })
    .stub(prompts, 'printOrder', () => true)
    .stub(orders, 'isValidOrder', () => true)
    .stub(prompts, 'confirmTransaction', () => async () => false)
    .stub(ethers, 'Contract', StakingTokenContract)
    .stub(utils, 'handleTransaction', () => true)
    .stub(utils, 'handleError', () => true)
    .command(['orders:get'])
    .it('gets an order', ctx => {
      expect(ctx.stdout).to.contain(`get an order from a peer`)
    })
})
