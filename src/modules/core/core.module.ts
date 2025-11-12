import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '@shared/utils/jwt/jwt.service';
import { CryptoUtil } from '@shared/utils/encryption/crypto.util';
import { RandomnessUtil } from '@shared/utils/encryption/randomness.util';
import { EncryptionService } from '@shared/utils/encryption/encryption.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    JwtModule.register({}), // Configuration is handled in the service via ConfigService
  ],
  providers: [JwtService, CryptoUtil, RandomnessUtil, EncryptionService],
  exports: [
    JwtService,
    CryptoUtil,
    RandomnessUtil,
    EncryptionService,
    // Repositories
    // Services
    // UseCases
  ],
})
export class CoreModule {}
