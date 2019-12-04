const Twitter = require('twitter');
const config = require('./config.js');
const fs = require('fs');
const T = new Twitter(config);
const path = require('path');

const {Storage} = require('@google-cloud/storage');
const gc = new Storage ({
  keyFilename: path.join(__dirname, '487gmprojecths-781d9eef68b2.json'),
  projectId: 'gmprojecths'
});

// gc.getBuckets().then(x => console.log(x));

const stream     = require('stream'),
      dataStream = new stream.PassThrough(),
      gcFile     = gc.bucket('hs-api-project').file('tweets.json')

const storageBucket = gc.bucket('hs-api-project');

console.log("launching twitter-bot script");

// Set up your search parameters
const params = {
  q: '#chile',
  count: 10,
  result_type: 'recent',
  lang: 'en',
  tweet_mode: 'extended'
}

// Initiate your search using the above paramaters
T.get('search/tweets', params, (err, data, response) => {
  // If there is no error, proceed
  if(err){
    return console.log(err);
  }

  // Loop through the returned tweets
  const tweetsId = data.statuses
    .map(tweet => ({ id: tweet.id_str }));

  var tweets = [];
  var tweet;
  for(var i = 0; i < data.statuses.length; i++){

    var tweetNode = data.statuses[i];

    tweet = data.statuses[i].full_text;
    console.log("FIRST TWEET: " + tweet);

    if(data.statuses[i].retweeted_status) {tweet = data.statuses[i].retweeted_status;
        console.log("INSIDE IF");
        tweets.push({id: data.statuses[i].id_str, profileImage: data.statuses[i].user.profile_image_url_https, screenName: data.statuses[i].user.screen_name, fullText: tweet.full_text.trim()});
        };

    console.log("-----");
    console.log("-----");
}

  var completeData = JSON.stringify(tweets);
  fs.writeFileSync('tweets.json', completeData);
  console.log("----- saved as tweets.json -----");


  dataStream.push(completeData)
  dataStream.push(null)

function saveFile(){
  console.log('saving file...');
return new Promise((resolve, reject) => {
  dataStream.pipe(gcFile.createWriteStream({
    resumable  : false,
    validation : false,
    metadata   : {'Cache-Control': 'public, max-age=31536000'}
  }))
})
}

  saveFile();
  console.log("saved to GCS");
  console.log("https://storage.cloud.google.com/hs-api-project/tweets.json");


})
