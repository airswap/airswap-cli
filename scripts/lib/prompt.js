const prompt = require('prompt')
const chalk = require('chalk')
const ora = require('ora')
const constants = require('../../constants.js')

prompt.message = ''
prompt.start()

const messages = {
  Address: 'Must be an Ethereum address (0x...)',
  URL: 'Must be a Web address (URL)',
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

  for (const field in fields) {
    schema.properties[field] = {
      description: fields[field].description,
      pattern: patterns[fields[field].type],
      message: messages[fields[field].type],
      default: fields[field].default,
      required: fields[field].optional ? false : true,
    }
  }
  return schema
}

module.exports = {
  get: function(fields, callback) {
    prompt.get(generateSchema(fields), function(err, result) {
      if (err) {
        console.log('\n\nCancelled\n')
        return
      }
      callback(result)
    })
  },
  confirm: function(title, values, action, callback) {
    console.log(chalk.underline(`\n${chalk.white.bold(title)}\n`))

    for (const value in values) {
      console.log(`${value}: ${values[value]}`)
    }
    console.log()

    if (typeof callback === 'function') {
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
            console.log('\n\nCancelled.\n')
            return
          }
          console.log()
          callback()
        },
      )
    }
  },
  handleTransaction: function(tx) {
    console.log(chalk.underline(`https://${constants.etherscanDomains[tx.chainId]}/tx/${tx.hash}\n`))
    const spinner = ora('Mining transaction (Rinkeby)...').start()
    tx.wait(constants.DEFAULT_CONFIRMATIONS).then(() => {
      spinner.succeed(`Transaction complete (${constants.DEFAULT_CONFIRMATIONS} confirmations)`)
      console.log()
      process.exit()
    })
  },
  handleError: function(error) {
    console.log(`\n${chalk.yellow('Error')}: ${error.reason || error.responseText || error}`)
    console.log('Please check your input values.\n')
  },
}
