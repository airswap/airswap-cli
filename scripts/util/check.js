const fetch = require('node-fetch')
const chalk = require('chalk')

const localPackage = require('../../package.json')

module.exports = callback => {
  fetch('https://raw.githubusercontent.com/airswap/airswap-maker-kit/master/package.json')
    .then(res => res.json())
    .then(pkg => {
      if (localPackage.version !== pkg.version) {
        console.log(
          chalk.yellow(
            `\n⚠️  There is a newer version of Maker Kit available. Run ${chalk.white.bold(
              'git pull',
            )} then ${chalk.white.bold('yarn')} to get the latest.`,
          ),
        )
      }
      callback()
    })
}
