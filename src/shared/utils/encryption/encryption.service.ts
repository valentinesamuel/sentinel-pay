import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { CryptoUtil } from './crypto.util';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly argon2MemoryCost: number;
  private readonly argon2TimeCost: number;
  private readonly argon2Parallelism: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly cryptoUtil: CryptoUtil,
  ) {
    this.argon2MemoryCost = this.configService.get<number>('common.argon2.memoryCost');
    this.argon2TimeCost = this.configService.get<number>('common.argon2.timeCost');
    this.argon2Parallelism = this.configService.get<number>('common.argon2.parallelism');
  }

  /**
   * Decrypt encrypted data using CryptoUtil
   * @param encryptedData - The encrypted data to decrypt
   * @returns Decrypted plain text
   */
  async decrypt(encryptedData: string, key?: string): Promise<string> {
    this.logger.log('Decrypting data');
    return await this.cryptoUtil.decrypt(encryptedData, key);
  }

  /**
   * Encrypt plain text data using CryptoUtil
   * @param plainText - The plain text to encrypt
   * @returns Encrypted data
   */
  async encrypt(plainText: string): Promise<string> {
    this.logger.log('Encrypting data');
    return await this.cryptoUtil.encrypt(plainText);
  }

  /**
   * Hash data using Argon2 with a pepper (secret salt)
   * Uses BVN or other secret as a pepper by combining it with the data before hashing.
   * Argon2 will then add its own random salt automatically.
   *
   * @param plainData - The plain text data to hash
   * @param pepper - The pepper/secret salt (e.g., BVN) to combine with the data
   * @returns Hashed data with Argon2
   */
  async hashWithPepper(plainData: string, pepper: string): Promise<string> {
    try {
      // Combine data with pepper (secret salt)
      // This ensures the same data with different peppers produces different hashes
      const peppered = `${plainData}:${pepper}`;

      // Argon2 will automatically generate and include its own random salt
      const hashedData = await argon2.hash(peppered, {
        type: argon2.argon2id, // Use Argon2id (recommended for password hashing)
        memoryCost: this.argon2MemoryCost,
        timeCost: this.argon2TimeCost,
        parallelism: this.argon2Parallelism,
      });

      this.logger.log('Data hashed successfully with Argon2id');
      return hashedData;
    } catch (error) {
      this.logger.error(`Error hashing data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify data against stored Argon2 hash
   * Combines the plain data with pepper before verification
   *
   * @param hashedData - The stored hashed data
   * @param plainData - The plain text data to verify
   * @param pepper - The pepper/secret salt used during hashing
   * @returns Boolean indicating if data matches the hash
   */
  async verifyHash(hashedData: string, plainData: string, pepper: string): Promise<boolean> {
    try {
      // Combine data with pepper (same as during hashing)
      const peppered = `${plainData}:${pepper}`;

      const isValid = await argon2.verify(hashedData, peppered);
      this.logger.log(`Hash verification result: ${isValid}`);

      return isValid;
    } catch (error) {
      this.logger.error(`Error verifying hash: ${error.message}`);
      return false;
    }
  }

  /**
   * Hash data using Argon2 without pepper (standard hashing)
   * @param plainData - The plain text data to hash
   * @returns Hashed data with Argon2
   */
  async hash(plainData: string): Promise<string> {
    try {
      const hashedData = await argon2.hash(plainData, {
        type: argon2.argon2id,
        memoryCost: this.argon2MemoryCost,
        timeCost: this.argon2TimeCost,
        parallelism: this.argon2Parallelism,
      });

      this.logger.log('Data hashed successfully with Argon2id');
      return hashedData;
    } catch (error) {
      this.logger.error(`Error hashing data: ${error.message}`);
      throw error;
    }
  }
}
