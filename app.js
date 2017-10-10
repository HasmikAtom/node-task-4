'use strict'

const http = require('http');
const fs = require('fs');

const write = (path, data) => {
  fs.writeFile(path, JSON.stringify(data, null, '\t'), function (err) {
    if (err) throw err;
  });
}

const read = (path) => {
  return new Promise ((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) return reject(err);
      return resolve(data)
    })
  })
}

const readBody = (request) => {
  return new Promise ((resolve, reject) => {
    let body = [];
    request.on('error', (err) => {
      console.error(err);
    }).on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      return resolve(body)
    })
  })
}

const apiGetTweet = (request, response, type) => {
  return read('tweets.json').
  then((data) => {
    if (type === 'ALL'){
      response.writeHead(200, {"Content-Type": "application/json"});
      response.end(data.toString())
    }
    else if (type === 'SINGLE'){
      const id = request.url.split('/')[3]
      let found = false
      if(data){
        let currentData = JSON.parse(data.toString())
        currentData.tweets.forEach((tweet) => {
          if (tweet.id == id){
            found = true
            response.writeHead(200, {"Content-Type": "application/json"});
            response.end(JSON.stringify(tweet))
          }
        })

        if(!found){
          response.statusCode = 404
          response.end(`tweet with id ${id} not found!`)
        }
      }
    }
  })
  .catch((err) => console.log('ERROR OCCURRED', err))
}

const apiModifyTweet = (request, response, type) => {
  return readBody(request)
  .then((bodyData) => {
    const id = request.url.split('/')[3]
    return read('tweets.json')
    .then((data) => {
      let found = false
      let newData = []
      if(data){
        let currentData = JSON.parse(data.toString())
        currentData.tweets.forEach((tweet) => {
          if (tweet.id != id){
            newData.push(tweet)
          } else {
            found = true
            if (type === 'EDIT'){
              let newContent = JSON.parse(bodyData)[0]
              newContent.id = tweet.id
              newData.push(newContent)
            }
          }
        })

        if(found){
          currentData.tweets = newData
          write('tweets.json', currentData)
          response.writeHead(200, {"Content-Type": "application/json"});
          response.end(`{"message": "Successfully ${type === 'DELETE' ? 'deleted' : 'updated'} tweet ${id}"}`)
        }
      }
      response.end(`tweet with id ${id} not found!`)
    })
  })
  .catch((err) => console.log('ERROR OCCURRED', err))
}

const apiAddTweets = (request, response) => {
  return readBody(request)
  .then((body) => {
    let bodyJSON = JSON.parse(body)
    bodyJSON.forEach((tweet) => {
      tweet.id = Math.floor(Math.random() * 999999999)
    })
    return read('tweets.json')
    .then((data) => {
      if(!data.toString()){ //file empty
        let tweets = {}
        tweets.tweets = bodyJSON
        write('tweets.json', tweets)
      }
      else{ //file has content
        let currentData = JSON.parse(data.toString())
        currentData.tweets = currentData.tweets.concat(bodyJSON)
        write('tweets.json', currentData)
      }

      response.statusCode = 200
      response.end(`received:\n${body}`)
    })
  })
  .catch((err) => console.log('ERROR OCCURRED', err))
}

const webShowAllTweets = (request, response) => {
  let found = false
  let buildHTML = '<html><body><ul>'
  return read('tweets.json')
  .then((data) => {
    if (data.toString()){
      found = true
      JSON.parse(data).tweets.forEach((tweet) => {
        buildHTML += `<li>"${tweet.tweet}" by <b>${tweet.user}</b></li>`
      })
    }
    if(!found) buildHTML += 'NO TWEETS AVAILABLE'
    buildHTML += '</ul></body></html>'
    response.end(buildHTML)
  })
}

const webShowOneTweet = (request, response) => {
  const id = request.url.split('/')[1]
  let found = false
  let buildHTML = '<html><body><p>'
  return read('tweets.json')
  .then((data) => {
    if (data.toString()){
      JSON.parse(data).tweets.forEach((tweet) => {
        if (tweet.id == id){
          found = true
          buildHTML += `"${tweet.tweet}" by <b>${tweet.user}</b>`
        }
      })
    }
    if (!found){buildHTML += 'TWEET NOT FOUND'}
    buildHTML += '</p></body></html>'
    response.end(buildHTML)
  })
  .catch((err) => console.log('ERROR OCCURRED', err))
}

http.createServer((request, response) => {
  const { headers, method, url } = request

  if (url === '/api/tweets' && method === 'POST'){
    apiAddTweets(request, response)
  }
  else if (url === '/api/tweets' && method === 'GET'){
    apiGetTweet(request, response, 'ALL')
  }
  else if (url.startsWith('/api/tweets/')){
    switch(method){
      case 'GET':
        apiGetTweet(request, response, 'SINGLE')
        break;
      case 'DELETE':
        apiModifyTweet(request, response, 'DELETE')
        break;
      case 'PUT':
        apiModifyTweet(request, response, 'EDIT')
        break;
    }
  }
  else if (url === '/' && method === 'GET'){
    webShowAllTweets(request, response)
  }
  else if(method === 'GET'){
    webShowOneTweet(request, response)
  }
  else {
    response.statusCode = 400
    response.end('Bad request')
  }

}).listen(8080); // Activates this server, listening on port 8080.
