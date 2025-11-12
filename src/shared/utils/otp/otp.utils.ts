import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class OtpActionUtil {
  private readonly logger = new Logger(OtpActionUtil.name);

  constructor() {}

  async can(authorizedActions: string[], actions: string[]): Promise<boolean> {
    for (const authorizedAction of authorizedActions) {
      if (actions.includes(authorizedAction)) return true;
    }
    throw new UnauthorizedException('You are not authorized to perform this action');
  }
}
