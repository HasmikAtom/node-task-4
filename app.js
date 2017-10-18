'use strict'

const http = require('http');

const Handlers = require('./handlers')
const Utils = require('./utils')

http.createServer((request, response) => {
  return Handlers.handleEndpoints(request, response)
  .catch((err) => {
    console.log({err})
    Utils.badRequestResponse(response, err)
  })
}).listen(8080);
