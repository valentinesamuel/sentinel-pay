import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ResponseInterceptor } from '@shared/interceptors/response.interceptor';
import { CustomFieldValidationPipe } from '@shared/validations/custom.validation';

import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';
import { ClientAuthorizationGuard } from '@shared/guards/clientAuthorizationGuard.guard';
import { CryptoUtil } from '@shared/utils/encryption/crypto.util';
import { DecryptCypherInterceptor } from '@modules/customer/interceptors/decrypt-cypher.interceptor';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const { port, swaggerApiRoot } = configService.get('common');
  const cryptoUtils = app.get(CryptoUtil);

  const PRODUCT_NAME = 'FCI CUstomer Service';
  const PRODUCT_TAG = 'FCI Customer Service';
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
    app.get(DecryptCypherInterceptor),
    new ResponseInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
  app.useGlobalGuards(new ClientAuthorizationGuard(configService, app.get(Reflector), cryptoUtils));
  // Enable global validation pipe
  app.useGlobalPipes(CustomFieldValidationPipe);

  const swaggerOptions = new DocumentBuilder()
    .setTitle(`${PRODUCT_NAME} API Documentation`)
    .setDescription('List of all the APIs for Famous Customer Service API.')
    .setVersion(PRODUCT_VERSION)
    .addTag(PRODUCT_TAG)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup(swaggerApiRoot, app, document);

  await app.listen(process.env.PORT || port);
  Logger.log(
    `${PRODUCT_NAME} running on port ${process.env.PORT || port}: visit http://localhost:${process.env.PORT || port}/${swaggerApiRoot}`,
  );
}

bootstrap();
