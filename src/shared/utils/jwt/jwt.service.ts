import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { CryptoUtil } from '@shared/utils/encryption/crypto.util';

export interface JwtPayload {
  [key: string]: any;
}

export interface JwtSignOptions {
  expiresIn?: string | number;
}

@Injectable()
export class JwtService {
  private readonly secret: string;
  private readonly defaultExpiresIn: string;
  private readonly tempTokenExpiresIn: string;
  private readonly logger = new Logger(JwtService.name);

  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
    private readonly cryptoUtil: CryptoUtil,
  ) {
    this.secret = this.configService.get<string>('common.jwt.secret');
    this.defaultExpiresIn = this.configService.get<string>('common.jwt.expiresIn');
    this.tempTokenExpiresIn = this.configService.get<string>('common.jwt.tempTokenExpiresIn');
  }

  /**
   * Encrypt a payload using CryptoUtil
   */
  private async encryptPayload(payload: JwtPayload): Promise<string> {
    const plaintext = JSON.stringify(payload);
    return await this.cryptoUtil.encrypt(plaintext);
  }

  /**
   * Decrypt an encrypted payload using CryptoUtil
   */
  private async decryptPayload(encryptedData: string): Promise<JwtPayload> {
    const decrypted = await this.cryptoUtil.decrypt(encryptedData);
    return JSON.parse(decrypted);
  }

  /**
   * Sign a JWT token with payload
   */
  sign(payload: JwtPayload, options?: JwtSignOptions): string {
    return this.jwtService.sign(payload, {
      secret: this.secret,
      expiresIn: options?.expiresIn || this.defaultExpiresIn,
    });
  }

  /**
   * Sign a temporary token (shorter expiry)
   */
  signTemporaryToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.secret,
      expiresIn: this.tempTokenExpiresIn,
    });
  }

  /**
   * Sign an encrypted temporary token
   * Encrypts the payload before signing, making it unreadable even if decoded
   */
  async signEncryptedTemporaryToken(payload: JwtPayload): Promise<string> {
    const encryptedPayload = await this.encryptPayload(payload);

    return this.jwtService.sign(
      { data: encryptedPayload },
      {
        secret: this.secret,
        expiresIn: this.tempTokenExpiresIn,
      },
    );
  }

  /**
   * Verify and decode a JWT token
   */
  verify<T extends object = JwtPayload>(token: string): T {
    try {
      return this.jwtService.verify<T>(token, {
        secret: this.secret,
      });
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Verify and decrypt an encrypted JWT token
   */
  async verifyEncryptedToken<T extends object = JwtPayload>(token: string): Promise<T> {
    try {
      // First verify the JWT signature
      const verified = this.jwtService.verify<{ data: string }>(token, {
        secret: this.secret,
      });

      // Then decrypt the payload
      return (await this.decryptPayload(verified.data)) as T;
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Decode a token without verifying (use cautiously)
   */
  decode<T extends object = JwtPayload>(token: string): T | null {
    return this.jwtService.decode<T>(token);
  }
}
