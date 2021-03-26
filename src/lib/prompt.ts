import prompt from 'prompt'
import chalk from 'chalk'
import * as emoji from 'node-emoji'
import { table } from 'table'
import BigNumber from 'bignumber.js'
import * as utils from './utils'
import { chainNames } from '@airswap/constants'

prompt.message = ''
prompt.start()

const messages = {
  Address: 'Must be an Ethereum address (0x...)',
  Token: `Token not found. Manage local metadata with the ${chalk.bold('metadata')} command`,
  Locator: 'Must be a URL. If no scheme provided (e.g. http://...) then HTTPS is implied',
  Number: 'Must be a number',
  Private: 'Private key must be 64 characters long',
  Side: 'Must be buy or sell',
  Format: 'Must be full or light',
}
const patterns = {
  Private: /^[a-fA-F0-9]{64}$/,
  Address: /^0x[a-fA-F0-9]{40}$/,
  Locator: /^((http|https):\/\/)?(([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])(:[0-9]+)?(\/)?$/,
  Number: /^\d*(\.\d+)?$/,
  Side: /^buy$|^sell$/,
  Format: /^full$|^light$/,
}

function generateSchema(fields) {
  const schema = { properties: {} }

  for (const field in fields) {
    schema.properties[field] = {
      description: fields[field].description,
      pattern: fields[field].type && patterns[fields[field].type],
      message: messages[fields[field].type],
      default: fields[field].default,
      required: fields[field].optional ? false : true,
      conform: fields[field].conform,
      hidden: fields[field].hidden,
    }
  }
  return schema
}

export async function get(fields) {
  return new Promise((resolve, reject) => {
    prompt.get(generateSchema(fields), function(err, result) {
      if (err) {
        reject(err)
      }
      resolve(result)
    })
  })
}

export async function getTokens(labels, metadata) {
  const fields = {}
  for (const label in labels) {
    fields[label] = {
      description: labels[label],
      type: 'Token',
      conform: value => {
        if (patterns.Address.test(value)) {
          return value in metadata.byAddress
        }
        return value.toUpperCase() in metadata.bySymbol
      },
    }
  }

  const values: any = await get(fields)
  const tokens = {}
  for (const val in values) {
    if (patterns.Address.test(values[val])) {
      tokens[val] = metadata.byAddress[values[val]]
    } else {
      tokens[val] = metadata.bySymbol[values[val].toUpperCase()]
    }
  }
  return tokens
}

export async function getSideAndTokens(metadata, reversed?) {
  const { side }: any = await get({
    side: {
      description: 'buy or sell',
      type: 'Side',
    },
  })

  const { first, second }: any = await getTokens({ first: 'token', second: 'for' }, metadata)

  let signerToken = first
  let senderToken = second

  if (side === 'sell') {
    signerToken = second
    senderToken = first
  }

  if (reversed) {
    const tempToken = signerToken
    signerToken = senderToken
    senderToken = tempToken
  }

  return {
    side,
    first,
    second,
    signerToken,
    senderToken,
  }
}

export async function printOrder(ctx: any, request: any, order: any, wallet: any, metadata: any) {
  const signerAmountDecimal = new BigNumber(order.signer ? order.signer.amount : order.signerAmount)
    .dividedBy(new BigNumber(10).pow(request.signerToken.decimals))
    .toFixed()

  const senderAmountDecimal = new BigNumber(order.sender ? order.sender.amount : order.senderAmount)
    .dividedBy(new BigNumber(10).pow(request.senderToken.decimals))
    .toFixed()

  if (request.side === 'buy') {
    ctx.log(
      emoji.get('sparkles'),
      chalk.bold('Buy'),
      chalk.bold(signerAmountDecimal),
      request.signerToken.symbol,
      'for',
      chalk.bold(senderAmountDecimal),
      request.senderToken.symbol,
      order.expiry ? `· Expiry ${new Date(order.expiry * 1000).toLocaleTimeString()}` : '',
    )
    ctx.log(
      chalk.gray(
        `Price ${chalk.white(
          new BigNumber(signerAmountDecimal)
            .div(senderAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${request.signerToken.symbol}/${request.senderToken.symbol} (${chalk.white(
          new BigNumber(senderAmountDecimal)
            .div(signerAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${request.senderToken.symbol}/${request.signerToken.symbol})`,
      ),
    )
  } else {
    ctx.log(
      emoji.get('sparkles'),
      chalk.bold('Sell'),
      chalk.bold(senderAmountDecimal),
      request.senderToken.symbol,
      'for',
      chalk.bold(signerAmountDecimal),
      request.signerToken.symbol,
      order.expiry ? `· Expiry ${new Date(order.expiry * 1000).toLocaleTimeString()}` : '',
    )
    ctx.log(
      chalk.gray(
        `Price ${chalk.white(
          new BigNumber(senderAmountDecimal)
            .div(signerAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${request.senderToken.symbol}/${request.signerToken.symbol} (${chalk.white(
          new BigNumber(signerAmountDecimal)
            .div(senderAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${request.signerToken.symbol}/${request.senderToken.symbol})`,
      ),
    )
  }

  ctx.log()

  const {
    signerTokenBalanceDecimal,
    signerTokenChangeDecimal,
    newSignerTokenBalance,
    senderTokenBalanceDecimal,
    senderTokenChangeDecimal,
    newSenderTokenBalance,
  } = await utils.getBalanceChanges(order, wallet, metadata)

  const config = {
    columns: {
      0: {
        alignment: 'left',
      },
      1: {
        alignment: 'right',
      },
      2: {
        alignment: 'right',
      },
    },
  }

  const data = [
    [
      'current',
      `${signerTokenBalanceDecimal.toFixed()} ${request.signerToken.symbol}`,
      `${senderTokenBalanceDecimal.toFixed()} ${request.senderToken.symbol}`,
    ],
    [
      'impact',
      chalk.greenBright(`+${signerTokenChangeDecimal.toFixed()} ${request.signerToken.symbol}`),
      chalk.redBright(`-${senderTokenChangeDecimal.toFixed()} ${request.senderToken.symbol}`),
    ],
    [
      'new',
      `${chalk.bold(newSignerTokenBalance.toFixed())} ${request.signerToken.symbol}`,
      `${chalk.bold(newSenderTokenBalance.toFixed())} ${request.senderToken.symbol}`,
    ],
  ]

  printTable(ctx, null, data, config)

  return !newSenderTokenBalance.lt(0)
}

export function getData(metadata: any, params: any) {
  const data = [[chalk.bold('Param'), chalk.bold('Value')]]
  for (const key in params) {
    if (patterns.Address.test(params[key]) && params[key] in metadata.byAddress) {
      data.push([key, `${params[key]} (${chalk.cyan(metadata.byAddress[params[key]].symbol)})`])
    } else {
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

export function printTable(ctx: any, title: string, data: Array<any>, config: any) {
  if (title) {
    ctx.log(chalk.underline.bold(title))
    ctx.log()
  }
  ctx.log(table(data, config))
}

export async function confirm(
  ctx: any,
  metadata: any,
  name: String,
  params: any,
  chainId: string,
  verb?: string,
): Promise<boolean> {
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
  const chainName = chainNames[chainId].toUpperCase()

  return new Promise((resolve, reject) => {
    prompt.get(
      {
        properties: {
          confirm: {
            description: chalk.white(`Type "yes" to ${verb || 'send'} (${chainName})`),
          },
        },
      },
      function(err, result) {
        if (err) reject()
        if (result && result.confirm === 'yes') resolve(true)
      },
    )
  })
}

export function cancelled(e) {
  if (e) {
    let message = e.message
    if (typeof e === 'string') {
      message = e
    }
    if (message === 'canceled') {
      message = 'Cancelled.'
    }
    console.log(`\n${chalk.yellow('Error')} ${message}\n`)
  }
}
