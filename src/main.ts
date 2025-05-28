import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import { globSync } from 'glob';
import { join } from 'path';
import { AppModule } from './app/app.module';
import { GlobalServerExceptionsFilter } from './app/common/exceptions/global-server-exception.filter';
import { UserResponseFormatterInterceptor } from './app/common/interceptors/user-response-formatter.interceptor';
import { CARVU_PACKAGE_NAME } from './grpc/types/auth/auth.pb';

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

  // Configure session middleware
  app.use(
    session({
      secret: 'carvu-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000, // 1 hour
      },
    }),
  );

  // Set up Swagger BEFORE applying route protection
  const config = new DocumentBuilder()
    .setTitle(`${configService.get<string>('app.name')} API`)
    .setDescription(
      `The ${configService.get<string>('app.name')} API description`,
    )
    .setVersion('1.0')
    .addBearerAuth() // Add this to support JWT auth in Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // AFTER Swagger setup, protect the route
  app.use('/docs', (req, res, next) => {
    if (req.session && req.session['user']) {
      next();
    } else {
      res.redirect('/'); // Redirect to home page if not authenticated
    }
  });

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
