'use strict'

const http = require('http');

const Handlers = require('./handlers')

http.createServer((request, response) => {
  Handlers.handleEndpoints(request, response)
}).listen(8080); // Activates this server, listening on port 8080.
