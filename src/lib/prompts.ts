import { cli } from 'cli-ux'
import chalk from 'chalk'
import { ethers } from 'ethers'
import * as emoji from 'node-emoji'
import BigNumber from 'bignumber.js'
import { table } from 'table'
import constants from './constants.json'

export async function promptSide() {
  let side = (await cli.prompt('buy or sell')).toUpperCase()
  if (side.indexOf('B') === 0) {
    side = 'B'
  }
  if (side.indexOf('S') === 0) {
    side = 'S'
  }
  if (side !== 'B' && side !== 'S') {
    process.exit(0)
  }
  return side
}

export async function promptToken(metadata: any, signerTokenLabel?: string) {
  const value = await cli.prompt(signerTokenLabel || 'signerToken')
  try {
    ethers.utils.getAddress(value)
    if (!(value in metadata.byAddress)) {
      throw new Error(`Token ${value} not found in metadata`)
    }
    return metadata.byAddress[value]
  } catch (e) {
    if (!(value.toUpperCase() in metadata.bySymbol)) {
      throw new Error(`Token ${value} not found in metadata`)
    }
    return metadata.bySymbol[value.toUpperCase()]
  }
}

export async function promptTokens(metadata: any, firstLabel?: string, secondLabel?: string) {
  return {
    first: await promptToken(metadata, firstLabel),
    second: await promptToken(metadata, secondLabel),
  }
}

export async function printOrder(
  ctx: any,
  side: string,
  signerToken: any,
  senderToken: any,
  locator: string,
  order: any,
) {
  const signerAmountDecimal = new BigNumber(order.signer.amount)
    .dividedBy(new BigNumber(10).pow(signerToken.decimals))
    .toFixed()

  const senderAmountDecimal = new BigNumber(order.sender.amount)
    .dividedBy(new BigNumber(10).pow(senderToken.decimals))
    .toFixed()

  ctx.log(chalk.underline.bold(`Response: ${locator}`))
  ctx.log()

  if (side === 'B') {
    ctx.log(
      emoji.get('sparkles'),
      chalk.bold('Buy'),
      chalk.bold(signerAmountDecimal),
      signerToken.name,
      'for',
      chalk.bold(senderAmountDecimal),
      senderToken.name,
    )
    ctx.log(
      chalk.gray(
        `Price ${chalk.white(
          new BigNumber(signerAmountDecimal)
            .div(senderAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${signerToken.name}/${senderToken.name} (${chalk.white(
          new BigNumber(senderAmountDecimal)
            .div(signerAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${senderToken.name}/${signerToken.name})`,
      ),
    )
  } else {
    ctx.log(
      emoji.get('sparkles'),
      chalk.bold('Sell'),
      chalk.bold(senderAmountDecimal),
      senderToken.name,
      'for',
      chalk.bold(signerAmountDecimal),
      signerToken.name,
    )
    ctx.log(
      chalk.gray(
        `Price ${chalk.white(
          new BigNumber(senderAmountDecimal)
            .div(signerAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${senderToken.name}/${signerToken.name} (${chalk.white(
          new BigNumber(signerAmountDecimal)
            .div(senderAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${signerToken.name}/${senderToken.name})`,
      ),
    )
  }
  ctx.log()
}

export function getData(metadata: any, params: any) {
  const data = [[chalk.bold('Param'), chalk.bold('Value')]]
  for (let key in params) {
    try {
      ethers.utils.getAddress(params[key])
      data.push([key, `${params[key]} (${metadata.byAddress[params[key]].name})`])
    } catch (e) {
      data.push([key, params[key]])
    }
  }
  return data
}

export async function printObject(ctx: any, metadata: any, title: string, params: any) {
  const data = getData(metadata, params)
  const config = {
    columns: {
      0: {
        alignment: 'left',
        width: 15,
      },
      1: {
        alignment: 'left',
        width: 60,
      },
    },
  }

  printTable(ctx, title, data, config)
}

export function printTable(ctx: any, title: string, data: Array<any>, config: object) {
  ctx.log(chalk.underline.bold(title))
  ctx.log()
  ctx.log(table(data, config))
}

export async function confirmTransaction(ctx: any, metadata: any, name: String, params: any, network: number) {
  const data = getData(metadata, params)
  const config = {
    columns: {
      0: {
        alignment: 'left',
        width: 15,
      },
      1: {
        alignment: 'left',
        width: 60,
      },
    },
  }

  printTable(ctx, `Transaction: ${name}`, data, config)
  const networkName = constants.chainNames[network || '4'].toUpperCase()
  if (await cli.confirm(`Type "yes" to send (${networkName})`)) {
    return true
  }
  return false
}
