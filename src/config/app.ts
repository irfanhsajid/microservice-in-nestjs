interface App {
  app: {
    name: string;
    port: number;
    env: string;
    debug: boolean;
    url: string;
    timezone: string;
    key: string;
  };
  grpc: {
    host: string;
    port: number;
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
    },
    grpc: {
      host: process.env.GRPC_HOST || 'localhost',
      port: process.env.GRPC_PORT || 50001,
    },
  }) as App;
