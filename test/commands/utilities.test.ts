import { expect, test } from '@oclif/test'
import { ethers } from 'ethers'
import { cli } from 'cli-ux'
import * as fs from 'fs-extra'
import * as utils from '../../src/lib/utils'

import { DeltaContract, getWallet, getMetadata } from '../stubs'

describe('utilities', () => {
  test
    .stdout()
    .stub(utils, 'getWallet', getWallet)
    .stub(utils, 'getMetadata', getMetadata)
    .stub(ethers, 'Contract', DeltaContract)
    .command(['balances'])
    .it('balances: displays balances', ctx => {
      expect(ctx.stdout).to.contain('Balances displayed for 1 of 2 known tokens')
    })

  test
    .stdout()
    .command(['ip'])
    .it('ip: displays ip', ctx => {
      expect(ctx.stdout).to.contain('local IPv4 addresses')
    })

  test
    .stdout()
    .stub(cli, 'prompt', () => async () => '4')
    .stub(fs, 'outputJson', () => true)
    .command(['network'])
    .it('network: sets network to rinkeby', ctx => {
      expect(ctx.stdout).to.contain('Set active network to rinkeby')
    })
})
