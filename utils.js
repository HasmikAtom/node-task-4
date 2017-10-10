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
