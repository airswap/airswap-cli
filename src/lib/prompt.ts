import prompt from 'prompt'
import chalk from 'chalk'
import * as emoji from 'node-emoji'
import { table } from 'table'
import BigNumber from 'bignumber.js'
import constants from './constants.json'

prompt.message = ''
prompt.start()

const messages = {
  Address: 'Must be an Ethereum address (0x...)',
  Token: 'Token not found in local metadata',
  URL: 'Must be a Web address (URL)',
  Number: 'Must be a number',
  Private: 'Private key must be 64 characters long',
  Side: 'Must be buy or sell',
}
const patterns = {
  Private: /^[a-fA-F0-9]{64}$/,
  Address: /^0x[a-fA-F0-9]{40}$/,
  URL: /[a-zA-Z0-9]{0,}/,
  Number: /^[0-9]+$/,
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
  for (let label in labels) {
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
  for (let val in values) {
    if (patterns.Address.test(values[val])) {
      tokens[val] = metadata.byAddress[values[val]]
    } else {
      tokens[val] = metadata.bySymbol[values[val].toUpperCase()]
    }
  }
  return tokens
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

  if (side === 'buy') {
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
    if (patterns.Address.test(params[key]) && params[key] in metadata.byAddress) {
      data.push([key, `${params[key]} (${metadata.byAddress[params[key]].name})`])
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

export function printTable(ctx: any, title: string, data: Array<any>, config: object) {
  ctx.log(chalk.underline.bold(title))
  ctx.log()
  ctx.log(table(data, config))
}

export async function confirm(ctx: any, metadata: any, name: String, params: any, network: number): Promise<boolean> {
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
            description: chalk.white(`Type "yes" to send (${networkName})`),
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
