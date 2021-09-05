const Twitter = require('twitter-v2');

const TwitterLite = require('twitter-lite');

const getClient = new Twitter({
  bearer_token: process.env.BEARER_TOKEN,
});

const postClient = new TwitterLite({  
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_SECRET,
  consumer_key: process.env.CONS_KEY,
  consumer_secret: process.env.CONS_SECRET
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

function getFromClauses() {
  let fromClause = "";
  const userList = process.env.USER_LIST;
  const users = userList.split(",");
  for(const user in users) {
    fromClause += 'OR '+ 'from:' + users[user] + ' ';
  }
  fromClause = fromClause.substring(3);
  return fromClause;
}

async function main() {
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate())
  yesterday.setHours((yesterday.getHours() - 12)%24)
  const fullQuery = getFromClauses() + '-is:reply -is:retweet';
  console.log("Query length: " + fullQuery.length)
  let params = {
    start_time: yesterday.toISOString(),
    max_results: 10,
    tweet: {
      fields: 'public_metrics'
    },
    query: fullQuery
  };
 
  const {meta, data} = await getClient.get('tweets/search/recent' , params);
  console.log(meta)
  if(meta.result_count > 0) {
    const bestTweetId = getBestTweet(data);
    retweetBestTweet(bestTweetId);
  }
}

async function retweetBestTweet(retweet) {
  try {
    const {data} = await postClient.post('statuses/retweet/'+ retweet);
  } catch(err) {
    console.log(err); 
  }
}

main();
