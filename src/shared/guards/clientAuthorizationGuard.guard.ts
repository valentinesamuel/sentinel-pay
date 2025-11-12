import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

import { CryptoUtil } from '@shared/utils/encryption/crypto.util';

@Injectable()
export class ClientAuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(ClientAuthorizationGuard.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly cryptoUtils: CryptoUtil,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // Get the token from the request headers
    const accessKey = req?.headers[this.configService.get<string>('common.auth.clientAuthName')];
    const encryptionKey =
      req?.headers[this.configService.get<string>('common.auth.clientAuthEncryptionKeyName')];
    const serviceKey = this.configService.get<string>('common.auth.clientAuthServiceKey');

    const clientId = await this.cryptoUtils.hash(`${serviceKey}${encryptionKey}`);

    if (!accessKey) {
      this.logger.error('❌ ERR_USR_1: Request is forbidden');
      throw new ForbiddenException('Request is forbidden', 'ERR_USR_1');
    }

    if (accessKey !== clientId) {
      this.logger.error('❌ ERR_USR_2: Request is forbidden');
      throw new ForbiddenException('Request is forbidden', 'ERR_USR_2');
    }

    this.logger.log('✅ Request is authorized for protected routes');
    return true;
  }
}
