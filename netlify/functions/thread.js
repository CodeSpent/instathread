const Twitter = require("twitter-v2");

var twitterClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_KEY_SECRET,
});

const getTweetIdFromUrl = (url) => {
  // Tweet Id should always be the last
  // part of a tweet url.
  const urlParts = url.split("/");
  return urlParts.pop();
};

const getTweetById = async (id) => {
  const params = {
    expansions: ["author_id", "referenced_tweets.id"],
  };
  const tweet = await twitterClient.get(`tweets/${id}`, params);
  return tweet.data;
};

const getRootTweetFromReply = async (reply) => {
  const tweet = getTweetById(reply.id);

  // If there aren't any referenced tweets,
  // we assume this is the root tweet.
  if (!("referenced_tweets" in reply)) {
    return reply.data;
  }

  // Map over referenced tweets for replies
  // and recursively call getRootTweetFromReply
  // until a tweet without a reference is found.
  tweet.referenced_tweets.map((referencedTweet) => {
    if (referencedTweet.type === "replied_to") {
      const replyId = referencedTweet.id;
      getRootTweetFromReply(replyId);
    }
  });
};

const getThreadPartsFromRootTweet = async (rootTweet) => {
  // Thread parts are direct replies to the root
  // tweet from and to the same author.

  const query = [`conversation_id:${rootTweet.id}`];
  const params = {
    query: query,
    "tweet.fields": ["author_id"],
  };

  const tweetsResponse = await twitterClient.get(
    "tweets/search/recent",
    params
  );
  const tweets = tweetsResponse.data;

  tweets.shift(rootTweet.data);

  return tweets;
};

const handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const tweetUrl = body.tweetUrl;

    const tweetId = await getTweetIdFromUrl(tweetUrl);

    const initialTweet = await getTweetById(tweetId);

    // Check if the tweet is a reply,
    // if so we want to first get the root tweet.
    if ("referenced_tweets" in initialTweet) {
      var tweet = await getRootTweetFromReply(initialTweet);
    } else {
      var tweet = initialTweet;
    }

    const threadParts = await getThreadPartsFromRootTweet(tweet);

    return {
      statusCode: 200,
      body: JSON.stringify({ data: threadParts }),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

module.exports = { handler };
