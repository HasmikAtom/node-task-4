const fs = require ('fs');

const Utils = {};
module.exports = Utils;

Utils.readBody = (request) => {
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

Utils.responseAddTweets = (response) => {
  response.writeHead(200, {"Content-Type": "application/json"});
  response.end(`{"message": "Received Data"}`)
}

Utils.responseGetOneTweet = (response, tweet) => {
  response.writeHead(200, {"Content-Type": "application/json"});
  response.end(tweet)
}

Utils.responseGetAllTweets = (response, data) => {
  response.writeHead(200, {"Content-Type": "application/json"});
  response.end(data.toString())
}

Utils.responseDelete = (response, id) => {
  response.writeHead(200, {"Content-Type": "application/json"});
  response.end(`{"message": "Successfully deleted tweet ${id}"}`)
};

Utils.responseUpdate = (response, id) => {
  response.writeHead(200, {"Content-Type": "application/json"});
  response.end(`{"message": "Successfully updated tweet ${id}"}`)
};

Utils.responseTweetNotFound = (response, id) => {
  response.writeHead(404, {"Content-Type": "application/json"});
  response.end(`{"message": "Tweet with id ${id} not found!"}`)
};

Utils.badRequestResponse = (response,err) => {
    response.writeHead(400);
    response.end(err)
};
