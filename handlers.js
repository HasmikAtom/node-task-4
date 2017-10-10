const fs = require ('fs');
const Database = require('./database')

const Handlers = {};
module.exports = Handlers;

Handlers.handleEndpoints = (request, response) => {
  const { headers, method, url } = request

  if (url === '/api/tweets' && method === 'POST'){
    Database.apiAddTweets(request, response)
  }
  else if (url === '/api/tweets' && method === 'GET'){
    Database.apiGetAllTweets(request, response)
  }
  else if (url.startsWith('/api/tweets/')){
    switch(method){
      case 'GET':
        Database.apiGetOneTweet(request, response)
        break;
      case 'DELETE':
        Database.apiDeleteTweet(request, response)
        break;
      case 'PUT':
        Database.apiUpdateTweet(request, response)
        break;
    }
  }
  else if (url === '/' && method === 'GET'){
    Database.webShowAllTweets(request, response)
  }
  else if(method === 'GET'){
    Database.webShowOneTweet(request, response)
  }
  else {
    response.statusCode = 400
    response.end('Bad request')
  }
}
