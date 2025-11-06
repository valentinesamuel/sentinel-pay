import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get config service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const environment = configService.get<string>('NODE_ENV', 'development');

  // Use winston logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-API-Key',
      'X-Idempotency-Key',
    ],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: environment === 'production',
    }),
  );

  // Swagger documentation (only in non-production)
  if (environment !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Payment Platform API')
      .setDescription(
        'Production-grade payment and wallet platform API - Multi-currency, international transfers, card payments, and more',
      )
      .setVersion('1.0')
      .addTag('Authentication', 'User authentication and authorization')
      .addTag('Users', 'User management')
      .addTag('Wallets', 'Multi-currency wallet operations')
      .addTag('Payments', 'Payment processing')
      .addTag('Transfers', 'Money transfers (local and international)')
      .addTag('Cards', 'Card management')
      .addTag('Banks', 'Bank account management')
      .addTag('Transactions', 'Transaction history and details')
      .addTag('Refunds', 'Refund processing')
      .addTag('Disputes', 'Dispute management')
      .addTag('Bills', 'Bill payments')
      .addTag('FX', 'Currency exchange rates')
      .addTag('KYC', 'Know Your Customer verification')
      .addTag('Webhooks', 'Webhook management')
      .addTag('Reports', 'Reports and analytics')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API Key for webhook verification',
        },
        'API-Key',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 Payment Platform API Started                        ║
  ║                                                           ║
  ║   Environment: ${environment.padEnd(43)}║
  ║   Port:        ${String(port).padEnd(43)}║
  ║   URL:         http://localhost:${port}/api${' '.repeat(23)}║
  ║   Docs:        http://localhost:${port}/api/docs${' '.repeat(18)}║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
