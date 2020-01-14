import * as os from 'os'
import { Command } from '@oclif/command'
import { displayDescription } from '../lib/utils'

export default class IP extends Command {
  static description = 'display local network addresses'

  async run() {
    const interfaces = os.networkInterfaces()

    displayDescription(this, IP.description)

    let count = 0
    for (const id in interfaces) {
      for (let i = 0; i < interfaces[id].length; i++) {
        if (interfaces[id][i].family === 'IPv4' && interfaces[id][i].address !== '127.0.0.1') {
          count++
          this.log(`${id}: ${interfaces[id][i].address}`)
        }
      }
    }

    this.log(`\nFound ${count} local IPv4 addresses.\n`)
  }
}
