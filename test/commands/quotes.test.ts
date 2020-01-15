import { expect, test } from '@oclif/test'
import { ethers } from 'ethers'
import * as utils from '../../src/lib/utils'
import { StakingTokenContract, getWallet, getMetadata } from '../stubs'
import { cli } from 'cli-ux'
import { orders } from '@airswap/order-utils'

describe('quotes', () => {
  test
    .stdout()
    .stub(utils, 'getWallet', getWallet)
    .stub(utils, 'getMetadata', getMetadata)
    .stub(
      utils,
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
    .stub(utils, 'printObject', () => true)
    .stub(utils, 'peerCall', (locator, method, params, callback) => {
      callback(null, { signer: {}, sender: {}, affiliate: {}, signature: { validator: '' } })
    })
    .stub(utils, 'printOrder', () => true)
    .stub(orders, 'isValidquote', () => true)
    .command(['quotes:get'])
    .it('gets a quote', ctx => {
      expect(ctx.stdout).to.contain(`get a quote from a peer`)
    })

  test
    .stdout()
    .stub(utils, 'getWallet', getWallet)
    .stub(utils, 'getMetadata', getMetadata)
    .stub(utils, 'getBest', (ctx, kind, metadata, wallet, callback) => {
      callback(
        {
          signerToken: {},
          senderToken: {},
        },
        { signer: {}, sender: {}, affiliate: {}, signature: { validator: '' } },
      )
    })
    .command(['quotes:best'])
    .it('gets best quote', ctx => {
      expect(ctx.stdout).to.contain(`get the best available quote`)
    })
})
