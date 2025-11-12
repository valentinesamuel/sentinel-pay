import { Injectable, Logger } from '@nestjs/common';
import { HashingUtil } from './hashing.utils';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Argon2HashingUtil implements HashingUtil {
  private readonly logger = new Logger(Argon2HashingUtil.name);
  private readonly memoryCost: number;
  private readonly timeCost: number;
  private readonly parallelism: number;

  constructor(private readonly configService: ConfigService) {
    // Argon2 configuration - adjust based on your security requirements
    this.memoryCost = this.configService.get<number>('common.argon2.memoryCost') || 65536; // 64 MB
    this.timeCost = this.configService.get<number>('common.argon2.timeCost') || 3; // 3 iterations
    this.parallelism = this.configService.get<number>('common.argon2.parallelism') || 4; // 4 threads
  }

  /**
   * Hash a value using Argon2id
   */
  async hash(value: string | Buffer): Promise<string> {
    return await argon2.hash(value, {
      type: argon2.argon2id,
      memoryCost: this.memoryCost,
      timeCost: this.timeCost,
      parallelism: this.parallelism,
    });
  }

  /**
   * Compare a plain value with an Argon2 hash
   */
  async compare(value: string | Buffer, encrypted: string): Promise<boolean> {
    try {
      return await argon2.verify(encrypted, value);
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  /**
   * Derive a raw key from input using Argon2
   * This is useful for deriving encryption keys from BVN
   */
  async deriveKey(value: string | Buffer, salt: Buffer, keyLength: number = 32): Promise<Buffer> {
    return await argon2.hash(value, {
      type: argon2.argon2id,
      memoryCost: this.memoryCost,
      timeCost: this.timeCost,
      parallelism: this.parallelism,
      salt,
      raw: true,
      hashLength: keyLength,
    });
  }
}
