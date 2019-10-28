const prompt = require('prompt')
const chalk = require('chalk')
const ora = require('ora')
const constants = require('./constants.js')

prompt.message = ''
prompt.start()

const messages = {
  Address: 'Must be an Ethereum address (0x...)',
  URL: 'Must be a Web address (hostname:port)',
  Number: 'Must be a number',
}
const patterns = {
  Address: /^0x[a-fA-F0-9]{40}$/,
  URL: /[a-zA-Z0-9]{0,}/,
  Number: /[0-9]/,
  Side: /buy|sell/,
}

function generateSchema(fields) {
  const schema = { properties: {} }

  for (let field in fields) {
    schema.properties[field] = {
      description: fields[field].description,
      pattern: patterns[fields[field].type],
      message: messages[fields[field].type],
      default: fields[field].default,
      required: true,
    }
  }
  return schema
}

module.exports = {
  get: function(fields, callback) {
    prompt.get(generateSchema(fields), function(err, result) {
      if (err) {
        console.log('\r\n\r\nCancelled\r\n')
        return
      }
      callback(result)
    })
  },
  confirm: function(title, action, values, callback) {
    console.log(chalk.underline(`\r\n${chalk.white.bold(title)}\r\n`))

    for (let value in values) {
      console.log(`${value}: ${values[value]}`)
    }

    console.log()
    prompt.get(
      {
        properties: {
          confirm: {
            description: `Type ${chalk.green('yes')} to ${action}`,
          },
        },
      },
      function(err, result) {
        if (err || result.confirm !== 'yes') {
          console.log('\r\n\r\nCancelled.\r\n')
          return
        }
        console.log()
        callback()
      }
    )
  },
  handleTransaction: function(tx) {
    console.log(chalk.underline(`https://${constants.etherscanDomains[selectedNetwork]}/tx/${tx.hash}`))
    console.log()
    const spinner = ora(`Mining ${chalk.white.bold('approve')} transaction (${selectedNetwork})...`).start()
    tx.wait(constants.DEFAULT_CONFIRMATIONS).then(() => {
      spinner.succeed(`Transaction complete (${constants.DEFAULT_CONFIRMATIONS} confirmations)`)
      console.log()
      process.exit()
    })
  },
  handleError: function(error) {
    console.log(`\r\n${chalk.yellow('Error')}: ${error.reason || error.responseText}`)
    console.log('Please check your input values.\r\n')
  },
}
