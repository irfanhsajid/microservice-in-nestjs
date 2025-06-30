import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as connectTypeorm from 'connect-typeorm';
import * as session from 'express-session';
import { globSync } from 'glob';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AppModule } from './app/app.module';
import { GlobalServerExceptionsFilter } from './app/common/exceptions/global-server-exception.filter';
import { UserResponseFormatterInterceptor } from './app/common/interceptors/user-response-formatter.interceptor';
import { CARVU_PACKAGE_NAME } from './grpc/types/auth/auth.pb';
import { docsAuthMiddleware } from './utils/docs-auth.middleware';
import { Session } from './app/modules/auth/entities/session.entity';
import { useContainer, ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
      'https://staging.carvu.ca',
      'https://staging.admin.carvu.ca',
      'http://10.0.0.56:3000',
      'http://10.0.0.195:3000',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });
  const configService = app.get(ConfigService);

  // grpc server
  const grpcServer = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: CARVU_PACKAGE_NAME,
        protoPath: globSync('src/grpc/proto/carvu_proto/**/*.proto', {
          absolute: true,
        }),
        url: `${configService.get<string>('services.grpc.host')}:${configService.get<number>('services.grpc.port')}`,
      },
    },
  );

  // Get Session repository
  const dataSource = app.get(DataSource); // Get the DataSource
  const sessionRepository = dataSource.getRepository(Session);

  // Configure express-session with TypeormStore
  const TypeormStore = connectTypeorm.TypeormStore;
  app.use(
    session({
      secret: configService.get('app.key', 'super-secret-key'),
      resave: false,
      saveUninitialized: true,
      store: new TypeormStore({
        cleanupLimit: 2,
        ttl: 84600,
      }).connect(sessionRepository),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: configService.get('app.env') === 'production',
      },
    }),
  );

  app.use('/docs', docsAuthMiddleware);
  app.use('/host', docsAuthMiddleware);

  const config = new DocumentBuilder()
    .setTitle(`${configService.get<string>('app.name')} API`)
    .setDescription(
      `The ${configService.get<string>('app.name')} API description`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        exposeUnsetFields: false,
      },
      exceptionFactory: (errors: any) => {
        // Only process class-validator errors
        if (
          errors &&
          Array.isArray(errors) &&
          errors.every((e) => e instanceof ValidationError)
        ) {
          const formatErrors = (
            errs: ValidationError[],
            parent = '',
          ): Record<string, string[]> => {
            return errs.reduce(
              (acc, err) => {
                const propertyPath = parent
                  ? `${parent}.${err.property}`
                  : err.property;

                if (err.constraints) {
                  acc[propertyPath] = Object.values(err.constraints);
                }

                if (err.children && err.children.length > 0) {
                  Object.assign(acc, formatErrors(err.children, propertyPath));
                }

                return acc;
              },
              {} as Record<string, string[]>,
            );
          };

          const formattedErrors = formatErrors(errors);
          return new UnprocessableEntityException({
            error: formattedErrors,
            message: 'Unprocessed content',
          });
        }
        // If not a class-validator error, rethrow the original error
        throw errors;
      },
    }),
  );

  // Global server error filters
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalServerExceptionsFilter(httpAdapter));

  // Global user response formatter interceptor
  app.useGlobalInterceptors(new UserResponseFormatterInterceptor());

  // Setup view engine
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await Promise.all([
    await app.listen(configService.get<number>('app.port') || 3000),
    grpcServer.listen(),
  ]);
}

bootstrap().catch((e) => console.error(e));
