import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoUtil {
  private readonly logger = new Logger(CryptoUtil.name);
  private readonly ivLength: number;
  private readonly cypherAlgorithm: string;
  private readonly hashingAlgorithm: string;

  constructor(private readonly configService: ConfigService) {
    this.ivLength = this.configService.get<number>('common.auth.encryption.ivLength');
    this.cypherAlgorithm = this.configService.get<string>('common.auth.encryption.algorithm');
    this.hashingAlgorithm = this.configService.get<string>('common.auth.hashing.algorithm');
  }

  /**
   * Returns a concatenated string of IV, Auth Tag, and Ciphertext, separated by ':'.
   *
   * @param {string} text The plaintext string to encrypt.
   * @returns {Promise<string>} The combined IV:Tag:Ciphertext as a hex string.
   */
  async encrypt(text: string, key?: string): Promise<string> {
    const iv = crypto.randomBytes(Number(this.ivLength));

    const hashedKey = await this.hash(key);

    const cipher = crypto.createCipheriv(this.cypherAlgorithm, Buffer.from(hashedKey, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':fci' + encrypted.toString('hex');
  }

  /**
   * Performs an integrity check using the Authentication Tag and performs decryption.
   *
   * @param {string} text The combined IV:Tag:Ciphertext hex string.
   * @returns {Promise<string>} The decrypted plaintext string.
   */
  async decrypt(text: string, key?: string): Promise<string> {
    try {
      const textParts = text.split(':fci');
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encryptedText = Buffer.from(textParts.join(':fci'), 'hex');

      const hashedKey = await this.hash(key);

      const decipher = crypto.createDecipheriv(
        this.cypherAlgorithm,
        Buffer.from(hashedKey, 'hex'),
        iv,
      );
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      throw new BadRequestException('Unable to decrypt pin');
    }
  }

  async hash(str: string): Promise<string> {
    const sha256Hasher = crypto.createHash(this.hashingAlgorithm);
    const hash = sha256Hasher.update(str).digest('hex');
    return hash;
  }
}
