const os = require('os')
const chalk = require('chalk')

const interfaces = os.networkInterfaces()

console.log(chalk.white.bold.underline('\r\nLocal Network Addresses\r\n'))

for (let id in interfaces) {
  for (let i = 0; i < interfaces[id].length; i++) {
    if (interfaces[id][i].family === 'IPv4' && interfaces[id][i].address !== '127.0.0.1') {
      console.log(interfaces[id][i].address)
    }
  }
}

console.log()
