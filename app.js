'use strict'

const http = require('http');
const fs = require('fs');

const write = (path, data) => {
  fs.writeFile(path, JSON.stringify(data), function (err) {
    if (err) throw err;
  });
}

const read = (path, cb) => {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) throw err;
    cb(data)
  })
}

const readBody = (request, cb) => {
  let body = [];
  request.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    cb(body)
  })
}

const getTweet = (request, response, type) => {
  read('tweets.json', (data) => {
    if (type === 'ALL'){
      response.writeHead(200, {"Content-Type": "application/json"});
      response.end(data.toString())
    }
    else if (type === 'SINGLE'){
      const id = request.url.split('/')[3]
      let found = false
      if(data.toString()){
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
}

const modifyTweet = (request, response, type) => {
  readBody(request, (bodyData) => {
    const id = request.url.split('/')[3]
    read('tweets.json', (data) => {
      let found = false
      let newData = []
      if(data.toString()){
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
}

const addTweets = (request, response) => {
  readBody(request, (body) => {
    let bodyJSON = JSON.parse(body)
    bodyJSON.forEach((tweet) => {
      tweet.id = Math.floor(Math.random() * 999999999)
    })
    read('tweets.json', (data) => {
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
}

const showAllTweets = (request, response) => {
  let found = false
  let buildHTML = '<html><body><ul>'
  read('tweets.json', (data) => {
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

const showOneTweet = (request, response) => {
  const id = request.url.split('/')[1]
  let found = false
  let buildHTML = '<html><body><p>'
  read('tweets.json', (data) => {
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
}

http.createServer((request, response) => {
  const { headers, method, url } = request

  if (url === '/api/tweets' && method === 'POST'){
    addTweets(request, response)
  }
  else if (url === '/api/tweets' && method === 'GET'){
    getTweet(request, response, 'ALL')
  }
  else if (url.startsWith('/api/tweets/') && method === 'GET'){
    getTweet(request, response, 'SINGLE')
  }
  else if (url.startsWith('/api/tweets/') && method === 'DELETE'){
    modifyTweet(request, response, 'DELETE')
  }
  else if (url.startsWith('/api/tweets/') && method === 'PUT'){
    modifyTweet(request, response, 'EDIT')
  }
  else if (url === '/' && method === 'GET'){
    showAllTweets(request, response)
  }
  else if(method === 'GET'){
    showOneTweet(request, response)
  }
  else {
    response.statusCode = 400
    response.end('Bad request')
  }

}).listen(8080); // Activates this server, listening on port 8080.
