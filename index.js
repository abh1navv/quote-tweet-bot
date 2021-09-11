const helper = require('./helper')

const TwitterLite = require('twitter-lite')

// an authenticated client for this app
const app = new TwitterLite({
  version: "2",
  extension: false, 
  bearer_token: process.env.BEARER_TOKEN
})

// an authenticated client for the bot user
const user = new TwitterLite({  
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_SECRET,
  consumer_key: process.env.CONS_KEY,
  consumer_secret: process.env.CONS_SECRET
})

async function main() {
  
  let mode = Math.random()*2
  let userList = process.env.USER_LIST
  let reducedHours = 4
  if(mode > 0.7) {
    reducedHours = 2
    userList = process.env.SECOND_USER_LIST
  }

  const fullQuery = '('+helper.getFromClauses(userList)+') -is:reply' 

  let yesterday = new Date()
  yesterday.setDate(yesterday.getDate())
  yesterday.setHours(yesterday.getHours() - reducedHours)  
    
  let params = {
    start_time: yesterday.toISOString(),
    max_results: 10,
    'tweet.fields': 'public_metrics',
    'expansions': 'author_id',
    'user.fields': 'id,username',
    query: fullQuery
  }
 
  const {meta, data, includes} = await app.get('tweets/search/recent' , params)
  if(meta.result_count > 0) {
    const {bestTweetId, bestTweetUser} = helper.getBestTweet(data)
    if(Math.random() > 0.4) {
      quoteTweetBestTweet(bestTweetId, bestTweetUser, includes)
    } else {
      retweetBestTweet(bestTweetId)
    }
    
  }
}

async function quoteTweetBestTweet(bestTweetId, bestTweetUser, includes) {
  const username = helper.getUsernameFromId(includes.users, bestTweetUser)
  if(username != undefined) {
    const status = helper.getStatus(bestTweetId, username);
    console.log(status)
    try{
      const {data} = await user.post('statuses/update', {status: status})
    } catch(err) {
      console.log(err)
    }
  }
}

async function retweetBestTweet(id) {
  try {
        console.log(id)

    const {data} = await user.post('statuses/retweet/'+ id)
  } catch(err) {
    console.log(err)
  }
}
main()
