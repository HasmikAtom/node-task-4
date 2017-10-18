
const fs = require ('fs');
const AllTweetsTemplate =  './public/index.hbs'
const OneTweetTemplate =  './public/tweet.hbs'
const Handlebars = require('handlebars');

const Template = {};
module.exports = Template;

Template.allTweets = (response, data) => {
  fs.readFile(AllTweetsTemplate, 'utf-8', function(err, source){
    if (err) throw err;
    var template = Handlebars.compile(source);
    if(data.toString()){
      var html = template({tweets: JSON.parse(data).tweets});
    } else {
      var html = template({})
    }
    response.end(html)
  })
}
