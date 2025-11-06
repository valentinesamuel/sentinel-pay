import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('MOCK_PROVIDERS_PORT', 3001);
  const environment = configService.get<string>('NODE_ENV', 'development');

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Enable CORS
  app.enableCors({
    origin: '*', // Allow all origins for mock service
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Mock Providers API')
    .setDescription(
      'Mock external payment providers (NIBSS, NIP, VISA, Mastercard, Paystack, etc.) for testing',
    )
    .setVersion('1.0')
    .addTag('NIBSS', 'NIBSS mock endpoints')
    .addTag('NIP', 'Nigeria Inter-bank Payment (NIP) mock')
    .addTag('Card Networks', 'VISA, Mastercard, Verve mock')
    .addTag('Paystack', 'Paystack mock API')
    .addTag('Flutterwave', 'Flutterwave mock API')
    .addTag('Webhooks', 'Webhook callbacks')
    .addTag('Settlement', 'Settlement file generation')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
      },
      'API-Key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🎭 Mock Providers Service Started                      ║
  ║                                                           ║
  ║   Environment: ${environment.padEnd(43)}║
  ║   Port:        ${String(port).padEnd(43)}║
  ║   URL:         http://localhost:${port}/api${' '.repeat(23)}║
  ║   Docs:        http://localhost:${port}/api/docs${' '.repeat(18)}║
  ║                                                           ║
  ║   Mocking: NIBSS, NIP, VISA, Mastercard, Verve          ║
  ║            Paystack, Flutterwave                         ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap().catch((err) => {
  console.error('Failed to start mock providers service:', err);
  process.exit(1);
});
