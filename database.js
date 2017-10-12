const fs = require ('fs');
const Utils = require('./utils')

const Database = {};
module.exports = Database;

const tweetsDB = 'tweets.json'

Database.write = (path, data) => {
    fs.writeFile(path, JSON.stringify(data, null, '\t'), function (err) {
      if (err) throw err;
  })
}

Database.read = (path) => {
  return new Promise ((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) return reject(err);
      return resolve(data)
    })
  })
}

Database.apiGetOneTweet = (request, response) => {
  return Database.read(tweetsDB)
  .then((data) => {
    const id = request.url.split('/')[3]
    if(data){
      let foundTweet = ''
      let currentData = JSON.parse(data.toString())
      currentData.tweets.forEach((tweet) => {
        if (tweet.id == id){
          foundTweet = JSON.stringify(tweet)
        }
      })
      return foundTweet
    }
  })
  .catch((err) => console.log({err}))
}

Database.apiGetAllTweets = (request, response) => {
  return Database.read(tweetsDB)
  .then((data) => {
    return data
  })
  .catch((err) => console.log({err}))
}

Database.apiUpdateTweet = (request, response) => {
  let localBody
  const id = request.url.split('/')[3]
  return Utils.readBody(request)
  .then((body) => localBody = body)
  .then(() => Database.read(tweetsDB))
  .then((data) => {
    let found = false
    if(data){
      let currentData = JSON.parse(data.toString())
      currentData.tweets = currentData.tweets.filter(tweet => {
        if (tweet.id != id){
          return true
        } else {
          found = true
          Object.assign(tweet, JSON.parse(localBody)[0])
          return true
        }
      })

      if(found){
        Database.write(tweetsDB, currentData)
      }
      return found
    }
  })
  .catch((err) => console.log({err}))
}

Database.apiDeleteTweet = (request, response) => {
  const id = request.url.split('/')[3]
  return Database.read(tweetsDB)
  .then((data) => {
      let found = false
      if(data){
        let currentData = JSON.parse(data.toString())
        currentData.tweets = currentData.tweets.filter(tweet => {
          if (tweet.id != id){
            return true
          } else {
            found = true
            return false
          }
        })

        if(found){
          Database.write(tweetsDB, currentData)
        }
        return found
      }
    })
    .catch((err) => console.log({err}))
}

Database.apiAddTweets = (request, response) => {
  let localBody
  return Utils.readBody(request)
  .then((body) => {
    let bodyJSON = JSON.parse(body)
    bodyJSON.forEach((tweet) => {
      tweet.id = Math.floor(Math.random() * 999999999)
    })
    localBody = bodyJSON
  })
  .then( () => Database.read(tweetsDB))
  .then((data) => {
    if(!data.toString()){ //file empty
      let tweets = {}
      tweets.tweets = localBody
      Database.write(tweetsDB, tweets)
    }
    else{ //file has content
      let currentData = JSON.parse(data.toString())
      currentData.tweets = currentData.tweets.concat(localBody)
      Database.write(tweetsDB, currentData)
    }
  })
  .catch((err) => console.log({err}))
}

Database.webShowAllTweets = (request, response) => {
  let found = false
  let buildHTML = '<html><body><ul>'
  return Database.read(tweetsDB)
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
  .catch((err) => console.log({err}))
}

Database.webShowOneTweet = (request, response) => {
  const id = request.url.split('/')[1]
  let found = false
  let buildHTML = '<html><body><p>'
  return Database.read(tweetsDB)
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
  .catch((err) => console.log({err}))
}
