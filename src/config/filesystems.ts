interface FileSystems {
  fileSystems: {
    default: string;
    disk: {
      local: {
        driver: string;
        root: string;
      };
      s3: {
        driver: string;
        region: string;
        accessKey: string;
        accessKeyId: string;
        endpoint: string;
        usePathStyleEndpoint: boolean;
        throw: boolean;
        root: string;
      };
    };
  };
}

export default () =>
  ({
    fileSystems: {
      default: process.env.FILESYSTEM_DISK ?? 'local',
      disk: {
        local: {
          driver: 'local',
          root: './storage/app',
        },
        s3: {
          driver: 's3',
          accessKey: process.env.AWS_SECRET_ACCESS_KEY,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          endpoint: process.env.AWS_ENDPOINT,
          region: process.env.AWS_DEFAULT_REGION,
          root: process.env.APP_ROOT_DIR ?? 'carvu',
          throw: process.env.AWS_THROW ?? false,
          usePathStyleEndpoint:
            process.env.AWS_USE_PATH_STYLE_ENDPOINT ?? false,
        },
      },
    },
  }) as FileSystems;
