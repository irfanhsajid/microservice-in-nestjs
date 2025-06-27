interface App {
  app: {
    name: string;
    port: number;
    env: string;
    debug: boolean;
    url: string;
    timezone: string;
    key: string;
    web_url: string;
    admin_url: string;
  };
}
export default () =>
  ({
    app: {
      name: process.env.APP_NAME || 'NestJS',
      port: process.env.APP_PORT || 3000,
      env: process.env.APP_ENV || 'development',
      debug: process.env.APP_DEBUG === 'true',
      url: process.env.APP_URL,
      timezone: process.env.APP_TIMEZONE,
      key: process.env.APP_KEY,
      web_url: process.env.WEB_URL,
      admin_url: process.env.ADMIN_URL,
    },
  }) as App;
