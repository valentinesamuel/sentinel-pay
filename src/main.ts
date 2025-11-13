import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ResponseInterceptor } from '@shared/interceptors/response.interceptor';
import { EntityInstanceValidatorInterceptor } from '@shared/interceptors/entity-instance-validator.interceptor';
import { CustomFieldValidationPipe } from '@shared/validations/custom.validation';

import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const { port, swaggerApiRoot } = configService.get('common');

  const PRODUCT_NAME = 'Sentinel Pay Core';
  const PRODUCT_TAG = 'Sentinel Pay Core';
  const PRODUCT_VERSION = '0.0.1';

  // Determine the allowed origins
  const whitelist = configService
    .get<string>('CORS_WHITELIST')
    .split(',')
    .map((pattern) => new RegExp(pattern));

  // Enable localhost on dev/staging servers only
  if ([undefined, 'development', 'localhost'].includes(process.env.NODE_ENV)) {
    // whitelist.push(/http(s)?:\/\/localhost:3000/);
    whitelist.push(/http(s)?:\/\/localhost:/);
  }

  Logger.log(`Approved domains: ${whitelist.join(',')}`);

  // Set cors options
  const options = {
    origin: whitelist,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-control',
      'X-Api-Token',
      'X-Otp-Token',
      'X-Timestamp',
    ],
    credentials: true,
  };

  app.enableCors(options);
  app.use(cookieParser());
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
    new EntityInstanceValidatorInterceptor(), // Validates and strips internal IDs
  );
  app.useGlobalGuards();
  // Enable global validation pipe
  app.useGlobalPipes(
    CustomFieldValidationPipe,
    new ValidationPipe({
      transform: true,
      transformOptions: {
        excludeExtraneousValues: false, // Keep all non-excluded fields
      },
    }),
  );

  const swaggerOptions = new DocumentBuilder()
    .setTitle(`${PRODUCT_NAME} API Documentation`)
    .setDescription('API Endpoints for Sentinel Pay Core')
    .setVersion(PRODUCT_VERSION)
    .addTag(PRODUCT_TAG)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup(swaggerApiRoot, app, document);

  await app.listen(port);
  Logger.log(
    `${PRODUCT_NAME} running on port ${port}: visit http://localhost:${port}/${swaggerApiRoot}`,
  );
}

bootstrap();
