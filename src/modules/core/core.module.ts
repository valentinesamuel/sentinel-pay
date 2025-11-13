import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoUtil } from '@shared/utils/encryption/crypto.util';
import { RandomnessUtil } from '@shared/utils/encryption/randomness.util';
import { EncryptionService } from '@shared/utils/encryption/encryption.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([])],
  providers: [CryptoUtil, RandomnessUtil, EncryptionService],
  exports: [
    CryptoUtil,
    RandomnessUtil,
    EncryptionService,
    // Repositories
    // Services
    // UseCases
  ],
})
export class CoreModule {}
