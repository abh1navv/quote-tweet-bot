const Twitter = require('twitter-v2');

const client = new Twitter({
  consumer_key: process.env.CONS_KEY,
  consumer_secret: process.env.CONS_SECRET,
  //access_token_key: process.env.ACCESS_TOKEN,
  //access_token_secret: process.env.ACCESS_SECRET,
  bearer_token:process.env.BEARER_TOKEN
});


function getBestTweet(data) {
  let bestTweetId = 0, bestTweetPoints = 0;
  data.forEach((tweet) => {
    const metrics = tweet.public_metrics;
    let currentTweetPoints = metrics.like_count + metrics.retweet_count*5 + metrics.quote_count*2 + metrics.reply_count*2;

    if(currentTweetPoints > bestTweetPoints) {
      bestTweetPoints = currentTweetPoints;
      bestTweetId = tweet.id;
    }
  });

  return bestTweetId;
}

async function main() {
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1)
  let params = {};
  params.query = 'from:dthompsondev -is:reply -is:retweet';
  params.tweet = {};
  params.tweet.fields = 'public_metrics';
  const {data} = await client.get('tweets/search/recent' ,params);
  console.log(data);

  
  const bestTweetId = getBestTweet(data);
  console.log("Best tweet id is:" + bestTweetId);
}

main();
