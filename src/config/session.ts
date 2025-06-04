interface SessionConfig {
  session: {
    token_lifetime: string;
    blacklist_driver: string;
  };
}
export default () =>
  ({
    session: {
      token_lifetime: process.env.JWT_TOKEN_LIFETIME || '7d',
      blacklist_driver: process.env.TOKEN_BLACKLIST_STORE || 'postgres',
    },
  }) as SessionConfig;
