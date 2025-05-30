import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { GlobalServerExceptionsFilter } from './app/common/exceptions/global-server-exception.filter';
import { UserResponseFormatterInterceptor } from './app/common/interceptors/user-response-formatter.interceptor';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { globSync } from 'glob';
import { CARVU_PACKAGE_NAME } from './grpc/types/auth/auth.pb';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Response } from 'express';
import * as session from 'express-session';
import { Session } from './app/modules/docs/entities/session.entity';
import { DataSource } from 'typeorm';
import * as connectTypeorm from 'connect-typeorm';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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

  app.use('/docs', (req, res: Response, next) => {
    console.info('from main.ts', req.session, req.session.user);
    if (req.session && req.session.user) {
      next();
    } else {
      if (req.session) {
        res.clearCookie('session');
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    }
  });

  const config = new DocumentBuilder()
    .setTitle(`${configService.get<string>('app.name')} API`)
    .setDescription(
      `The ${configService.get<string>('app.name')} API description`,
    )
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  // Validation pipes errors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        exposeUnsetFields: false,
      },
      exceptionFactory: (errors) => {
        const formattedErrors = errors.reduce(
          (acc, err) => {
            if (err.constraints) {
              acc[err.property] = err.constraints
                ? Object.values(err.constraints)
                : [];
            }
            return acc;
          },
          {} as Record<string, string[]>,
        );
        return new UnprocessableEntityException({
          error: formattedErrors,
          message: 'Unprocessed content',
        });
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

  await app.listen(configService.get<number>('app.port') || 3000);

  await grpcServer.listen();
}

bootstrap().catch((e) => console.error(e));
