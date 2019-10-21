const ethers = require('ethers')

const wallet = ethers.Wallet.createRandom()

console.log('Randomly generated wallet:')
console.log(`Private Key: ${wallet.privateKey}`)
console.log(`Address:     ${wallet.address}`)
