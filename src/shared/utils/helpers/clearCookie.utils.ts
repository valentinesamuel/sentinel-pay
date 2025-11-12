import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

const configService = new ConfigService();

export const clearVerifiedOtpCookie = (res: Response) => {
  res.clearCookie(configService.get<string>('common.auth.cookie.verifiedOtpCookieName'));
};
