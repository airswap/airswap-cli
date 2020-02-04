import prompt from 'prompt'
import chalk from 'chalk'
import * as emoji from 'node-emoji'
import { table } from 'table'
import BigNumber from 'bignumber.js'
import constants from './constants.json'
import { getTable } from 'console.table'
import * as utils from './utils'

prompt.message = ''
prompt.start()

const messages = {
  Address: 'Must be an Ethereum address (0x...)',
  Token: 'Token not found in local metadata',
  Locator: 'Must be a URL. If no scheme provided (e.g. http://...) then HTTPS is implied',
  Number: 'Must be a number',
  Private: 'Private key must be 64 characters long',
  Side: 'Must be buy or sell',
}
const patterns = {
  Private: /^[a-fA-F0-9]{64}$/,
  Address: /^0x[a-fA-F0-9]{40}$/,
  Locator: /^((http|https):\/\/)?(([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])\.)+([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])(:[0-9]+)?$/,
  Number: /^\d*(\.\d+)?$/,
  Side: /buy|sell/,
}

function generateSchema(fields) {
  const schema = { properties: {} }

  for (const field in fields) {
    schema.properties[field] = {
      description: fields[field].description,
      pattern: patterns[fields[field].type],
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

  let signerToken
  let senderToken

  if (side === 'buy' || (reversed && side === 'sell')) {
    signerToken = first
    senderToken = second
  } else {
    signerToken = second
    senderToken = first
  }

  return {
    side,
    first,
    second,
    signerToken,
    senderToken,
  }
}

export async function printOrder(ctx: any, request: any, locator: string, order: any, wallet: any, metadata: any) {
  const signerAmountDecimal = new BigNumber(order.signer.amount)
    .dividedBy(new BigNumber(10).pow(request.signerToken.decimals))
    .toFixed()

  const senderAmountDecimal = new BigNumber(order.sender.amount)
    .dividedBy(new BigNumber(10).pow(request.senderToken.decimals))
    .toFixed()

  ctx.log(chalk.underline.bold(`Response: ${locator}`))
  ctx.log()

  if (request.side === 'buy') {
    ctx.log(
      emoji.get('sparkles'),
      chalk.bold('Buy'),
      chalk.bold(signerAmountDecimal),
      request.signerToken.name,
      'for',
      chalk.bold(senderAmountDecimal),
      request.senderToken.name,
      order.expiry ? `· Expiry ${new Date(order.expiry * 1000).toLocaleTimeString()}` : '',
    )
    ctx.log(
      chalk.gray(
        `Price ${chalk.white(
          new BigNumber(signerAmountDecimal)
            .div(senderAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${request.signerToken.name}/${request.senderToken.name} (${chalk.white(
          new BigNumber(senderAmountDecimal)
            .div(signerAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${request.senderToken.name}/${request.signerToken.name})`,
      ),
    )
  } else {
    ctx.log(
      emoji.get('sparkles'),
      chalk.bold('Sell'),
      chalk.bold(senderAmountDecimal),
      request.senderToken.name,
      'for',
      chalk.bold(signerAmountDecimal),
      request.signerToken.name,
      order.expiry ? `· Expiry ${new Date(order.expiry * 1000).toLocaleTimeString()}` : '',
    )
    ctx.log(
      chalk.gray(
        `Price ${chalk.white(
          new BigNumber(senderAmountDecimal)
            .div(signerAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${request.senderToken.name}/${request.signerToken.name} (${chalk.white(
          new BigNumber(signerAmountDecimal)
            .div(senderAmountDecimal)
            .decimalPlaces(6)
            .toFixed(),
        )} ${request.signerToken.name}/${request.senderToken.name})`,
      ),
    )
  }

  ctx.log()

  if (order.signature) {
    const {
      signerTokenBalanceDecimal,
      signerTokenChangeDecimal,
      newSignerTokenBalance,
      senderTokenBalanceDecimal,
      senderTokenChangeDecimal,
      newSenderTokenBalance,
    } = await utils.getBalanceChanges(order, wallet, metadata)

    ctx.log(
      getTable([
        {
          Balance: `${signerTokenBalanceDecimal.toFixed()} ${request.signerToken.name}`,
          Change: `+${chalk.bold(signerTokenChangeDecimal.toFixed())}`,
          'New balance': `${newSignerTokenBalance.toFixed()} ${request.signerToken.name}`,
        },
        {
          Balance: `${senderTokenBalanceDecimal.toFixed()} ${request.senderToken.name}`,
          Change: `-${chalk.bold(senderTokenChangeDecimal.toFixed())}`,
          'New balance': `${newSenderTokenBalance.toFixed()} ${request.senderToken.name}`,
        },
      ]),
    )
  }
}

export function getData(metadata: any, params: any) {
  const data = [[chalk.bold('Param'), chalk.bold('Value')]]
  for (const key in params) {
    if (patterns.Address.test(params[key]) && params[key] in metadata.byAddress) {
      data.push([key, `${params[key]} (${chalk.cyan(metadata.byAddress[params[key]].name)})`])
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
  ctx.log(chalk.underline.bold(title))
  ctx.log()
  ctx.log(table(data, config))
}

export async function confirm(
  ctx: any,
  metadata: any,
  name: String,
  params: any,
  network: number,
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
  const networkName = constants.chainNames[network || '4'].toUpperCase()

  return new Promise((resolve, reject) => {
    prompt.get(
      {
        properties: {
          confirm: {
            description: chalk.white(`Type "yes" to ${verb || 'send'} (${networkName})`),
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
    console.log(chalk.yellow(`\n${message}\n`))
  }
}
