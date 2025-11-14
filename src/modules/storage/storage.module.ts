import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AzureBlobService } from './azure-blob.service';
import { StorageController } from './storage.controller';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [AzureBlobService],
  exports: [AzureBlobService], // Export so other modules can use the service
})
export class StorageModule {}
