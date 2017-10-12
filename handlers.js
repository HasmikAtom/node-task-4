const fs = require ('fs');
const Database = require('./database')
const Utils = require('./utils')

const Handlers = {};
module.exports = Handlers;

Handlers.handleEndpoints = (request, response) => {
  const { headers, method, url } = request
  const id = request.url.split('/')[3]

  if (url === '/api/tweets' && method === 'POST'){
    return Database.apiAddTweets(request, response)
    .then(() => {
      Utils.responseAddTweets(response)
    })
    .catch((err) => {
      Utils.badRequestResponse(response, err)
    })
  }
  else if (url === '/api/tweets' && method === 'GET'){
    return Database.apiGetAllTweets(request, response)
    .then((data) => {
      Utils.responseGetAllTweets(response, data)
    })
    .catch((err) => {
      Utils.badRequestResponse(response, err)
    })
  }
  else if (url.startsWith('/api/tweets/')){
    switch(method){
      case 'GET':
        return Database.apiGetOneTweet(request, response)
        .then((tweet) => {
          if (tweet) {
            Utils.responseGetOneTweet(response, tweet)
          } else {
            Utils.responseTweetNotFound(response, id)
          }
        })
        break;
      case 'DELETE':
        return Database.apiDeleteTweet(request, response)
        .then((found) => {
          found ? Utils.responseDelete(response, id) : Utils.responseTweetNotFound(response, id)
        })
        .catch((err) =>  {
            Utils.badRequestResponse(response, err)
        })
        break;
      case 'PUT':
      return Database.apiUpdateTweet(request, response)
      .then((found) => {
          found ? Utils.responseUpdate(response, id) : Utils.responseTweetNotFound(response, id)
      })
      .catch((err) =>  {
          Utils.badRequestResponse(response,err)
      })
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
