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

http.createServer((request, response) => {
  const { headers, method, url } = request
  // /api/tweets POST
  if (url === '/api/tweets' && method === 'POST'){
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
  // /api/tweets GET
  else if (url === '/api/tweets' && method === 'GET'){
    read('tweets.json', (data) => {
      response.writeHead(200, {"Content-Type": "application/json"});
      response.end(data.toString())
    })
  }
  // /api/tweets/{id} GET
  else if (url.startsWith('/api/tweets/') && method === 'GET'){
    const id = url.split('/')[3]
    read('tweets.json', (data) => {
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
          response.end(`tweet with id ${id} not found!`)
        }
      }
    })
  }
  // /api/tweets/{id} DELETE
  else if (url.startsWith('/api/tweets/') && method === 'DELETE'){
    const id = url.split('/')[3]
    read('tweets.json', (data) => {
      let found = false
      let deletedTweet
      let newData = []
      if(data.toString()){
        let currentData = JSON.parse(data.toString())
        currentData.tweets.forEach((tweet) => {
          if (tweet.id != id){
            newData.push(tweet)
          } else {
            found = true
            deletedTweet = tweet
          }
        })

        if(found){
          currentData.tweets = newData
          write('tweets.json', currentData)
          response.writeHead(200, {"Content-Type": "application/json"});
          response.end(`{"message": "Successfully deleted tweet ${deletedTweet.id}"}`)
        }
      }

      response.end(`tweet with id ${id} not found!`)
    })
  }
  // /api/tweets/{id} PUT
  else if (url.startsWith('/api/tweets/') && method === 'PUT'){
    const id = url.split('/')[3]
    readBody(request, (bodyData) => {
      console.log(new Date().valueOf())
      read('tweets.json', (data) => {
        let found = false
        let updatedTweet
        let newData = []
        if(data.toString()){
          let currentData = JSON.parse(data.toString())
          currentData.tweets.forEach((tweet) => {
            if (tweet.id != id){
              newData.push(tweet)
            } else {
              found = true
              updatedTweet = tweet
              let newContent = JSON.parse(bodyData)[0]
              newContent.id = Math.floor(Math.random() * 999999999)
              newData.push(newContent)

            }
          })

          if(found){
            currentData.tweets = newData
            write('tweets.json', currentData)
            response.writeHead(200, {"Content-Type": "application/json"});
            response.end(`{"message": "Successfully updated tweet ${updatedTweet.id}"}`)
          }
        }

        response.end(`tweet with id ${id} not found!`)
      })
    })

  }
  // GET / - in html <ul> <li> list all the tweets
  else if (url === '/' && method === 'GET'){
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
  //  GET /id - in html <p> show single tweet
  } else if(method === 'GET'){
    const id = url.split('/')[1]
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
  else {
    response.statusCode = 400
    response.end('Bad request')
  }

}).listen(8080); // Activates this server, listening on port 8080.
