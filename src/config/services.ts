interface Services {
  redis: {
    host: string;
    port: number;
    password: string;
    url: string;
    username: string;
    client: string;
    cluster: string;
    redisDb: string;
    prefix: string;
  };
  grpc: {
    host: string;
    port: number;
  };
}
export default () =>
  ({
    redis: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: process.env.REDIS_PORT ?? 6379,
      password: process.env.REDIS_PASSWORD ?? '',
      url: process.env.REDIS_URL ?? '',
      client: process.env.REDIS_CLIENT ?? '',
      cluster: process.env.REDIS_CLUSTER ?? '',
      prefix: process.env.REDIS_PREFIX ?? '',
      redisDb: process.env.REDIS_DB ?? '',
      username: process.env.REDIS_USERNAME ?? '',
    },
    grpc: {
      host: process.env.GRPC_HOST || '0.0.0.0',
      port: process.env.GRPC_PORT || 5000,
    },
  }) as Services;
