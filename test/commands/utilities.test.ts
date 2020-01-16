import { expect, test } from '@oclif/test'
import { ethers } from 'ethers'
import { cli } from 'cli-ux'
import * as fs from 'fs-extra'
import * as utils from '../../src/lib/utils'
import * as keytar from 'keytar'
import * as path from 'path'

var mock = require('mock-require')

mock('mock-path', {
  request: function() {
    return {}
  },
})

import { DeltaContract, getWallet, getMetadata, getDefaultProvider, Wallet } from '../stubs'

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

  test
    .stdout()
    .stub(path, 'join', () => 'mock-path')
    .stub(keytar, 'getPassword', () => async () => true)
    .stub(ethers, 'getDefaultProvider', getDefaultProvider)
    .stub(ethers, 'Wallet', Wallet)
    .stub(cli, 'action', () => ({
      start: () => true,
      stop: () => true,
    }))
    .stub(fs, 'outputJson', () => true)
    .stub(fs, 'pathExists', () => true)
    .stub(fs, 'readJson', () => async () => {
      network: '4'
    })
    .it('runs handleError, handleTransaction', ctx => {
      utils.getWallet({
        log: console.log,
        config: {},
      })
      utils.getWallet(
        {
          log: console.log,
          config: {},
        },
        true,
      )
      utils.getMetadata(
        {
          log: console.log,
          config: {},
        },
        4,
      )
      utils.handleError({})
      utils.handleTransaction({
        chainId: 4,
        wait: async () => true,
      })
      expect(ctx.stdout).to.contain('Please check your input values')
    })
})
