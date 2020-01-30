import { expect, test } from '@oclif/test'
import { ethers } from 'ethers'
import * as utils from '../../src/lib/utils'
import * as prompts from '../../src/lib/prompt'
import * as requests from '../../src/lib/requests'
import { StakingTokenContract, getWallet, getMetadata } from '../stubs'
import { cli } from 'cli-ux'
import { orders } from '@airswap/order-utils'

describe('quotes', () => {
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
    .stub(orders, 'isValidquote', () => true)
    .command(['quote:get'])
    .it('gets a quote', ctx => {
      expect(ctx.stdout).to.contain(`get a quote from a peer`)
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
    .stub(prompts, 'printObject', () => true)
    .stub(requests, 'multiPeerCall', (wallet, method, params, callback) => {
      callback({ signer: {}, sender: {}, affiliate: {}, signature: { validator: '' } }, 'google.com', [])
    })
    .command(['quote:best'])
    .it('gets best quote', ctx => {
      expect(ctx.stdout).to.contain(`get the best available quote`)
    })
})
