import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { GlobalServerExceptionsFilter } from './app/exceptions/global-server-exception.filter';
import { UserResponseFormatterInterceptor } from './app/interceptors/user-response-formatter.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

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

  await app.listen(configService.get<number>('app.port') || 3000);
}

bootstrap().catch((e) => console.error(e));
