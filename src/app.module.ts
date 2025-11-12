import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configSchema from '@config/schema.config';
import common from '@config/common.config';
import notification from '@config/notification.config';
import typeorm from '@config/typeorm.config';
import { Broker } from '@broker/broker';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { CoreModule } from '@modules/core/core.module';
import { OnboardingModule } from '@modules/onboard/onboarding.module';
import { CustomerModule } from '@modules/customer/customer.module';
import { UtilModule } from '@modules/utils/utils.module';
import { AuthModule } from '@modules/auth/auth.module';
import { WalletModule } from '@modules/wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [common, typeorm, notification],
      ...configSchema,
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.get('typeorm'),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 30000, limit: 10 }]),
    EventEmitterModule.forRoot(),
    CoreModule,
    OnboardingModule,
    CustomerModule,
    UtilModule,
    AuthModule,
    WalletModule,
  ],
  controllers: [],
  providers: [
    Broker,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [Broker],
})
export class AppModule {}
