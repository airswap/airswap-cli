import * as os from 'os'
import { Command } from '@oclif/command'
import { intro } from '../setup'

export default class IP extends Command {
  static description = 'Local network addresses'

  async run() {
    const interfaces = os.networkInterfaces()

    intro(this, IP.description)

    for (const id in interfaces) {
      for (let i = 0; i < interfaces[id].length; i++) {
        if (interfaces[id][i].family === 'IPv4' && interfaces[id][i].address !== '127.0.0.1') {
          this.log(interfaces[id][i].address)
        }
      }
    }
  }
}
