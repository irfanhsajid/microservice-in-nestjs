interface Oauth {
  oAuth: {
    google: {
      client_id: string;
      client_secret: string;
      callback_url: string;
    };
    twitter: {
      consumer_key: string;
      consumer_secret: string;
      callback_url: string;
    };
  };
}

export default () =>
  ({
    oAuth: {
      google: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        callback_url: process.env.GOOGLE_CALLBACK_URL,
      },
      twitter: {
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        callback_url: process.env.TWITTER_CALLBACK_URL,
      },
    },
  }) as Oauth;
