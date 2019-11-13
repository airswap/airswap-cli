const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const jayson = require('jayson')

// Express instance
const server = express()
let listener
let address
let port

// CORS for connections from web browsers
server.use(
  cors({
    origin: '*',
    methods: 'POST',
  }),
)

// POST body parsing for JSON-RPC
server.use(bodyParser.json())

exports.configure = function(_address, _port) {
  address = _address
  port = _port
}

exports.start = function(_handlers, _logger) {
  // POST request handler
  server.post(
    '/',
    jayson
      .server(_handlers, {
        // Ensures we're serving requested token pairs and catches other errors
        router: function(method) {
          try {
            _logger.info(`Received ${method} request`)
            if (typeof this._methods[method] === 'object') return this._methods[method]
          } catch (e) {
            return new jayson.Method(function(params, callback) {
              callback(true, null)
            })
          }
        },
      })
      .middleware(),
  )

  // Start the listener
  port = port || 8080
  listener = server.listen(port, address, () => {
    _logger.info(`Server now listening. (${address}:${port})`)
  })
}

exports.stop = function(callback) {
  if (listener === undefined) {
    throw Error('Cannot stop; server is not running.')
  } else {
    listener.close(callback)
  }
}
