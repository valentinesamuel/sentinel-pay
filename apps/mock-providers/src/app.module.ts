import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

// Mock Provider Modules
import { NibssModule } from './modules/nibss/nibss.module';
import { NipModule } from './modules/nip/nip.module';
import { CardNetworksModule } from './modules/card-networks/card-networks.module';
import { PaystackModule } from './modules/paystack/paystack.module';
import { FlutterwaveModule } from './modules/flutterwave/flutterwave.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { SettlementModule } from './modules/settlement/settlement.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // Schedule for periodic tasks (settlement file generation)
    ScheduleModule.forRoot(),

    // HTTP module for making webhook callbacks
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),

    // Mock provider modules
    NibssModule,
    NipModule,
    CardNetworksModule,
    PaystackModule,
    FlutterwaveModule,
    WebhooksModule,
    SettlementModule,
  ],
})
export class AppModule {}
