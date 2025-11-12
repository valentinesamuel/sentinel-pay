import { registerAs } from '@nestjs/config';

const NODE_ENVIRONMENTS = ['development', 'staging', 'beta', 'production'];

export default registerAs('common', () => ({
  port: process.env.APP_PORT ? Number.parseInt(process.env.APP_PORT) : 3000,
  appName: process.env.APP_NAME,
  appHostName: process.env.APP_HOSTNAME,
  nodeEnv: process.env.NODE_ENV,
  tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY,
  isDevelopment: process.env.NODE_ENV === NODE_ENVIRONMENTS[0],
  swaggerApiRoot: process.env.SWAGGER_API_ROOT,
  bcryptSaltRounds: Number.parseInt(process.env.BCRYPT_SALT_ROUNDS),
  auth: {
    clientAuthName: process.env.CLIENT_AUTH_NAME,
    clientAuthServiceKey: process.env.CLIENT_AUTH_SERVICE_KEY,
    otpName: process.env.APP_OTP_NAME,
    otp: {
      expiry: Number.parseInt(process.env.OTP_VALIDITY_IN_MINUTES),
    },
    encryption: {
      ivLength: parseInt(process.env.ENCRYPTION_IV_LENGTH),
      key: process.env.ENCRYPTION_KEY,
      algorithm: process.env.ENCRYPTION_ALGORITHM,
      salt: process.env.ENCRYPTION_SALT,
    },
    clientAuthEncryptionKeyName: process.env.CLIENT_AUTH_ENCRYPTION_KEY_NAME,
    hashing: {
      algorithm: process.env.HASHING_ALGORITHM,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN_MINUTES,
    tempTokenExpiresIn: process.env.JWT_TEMP_TOKEN_EXPIRES_IN_MINUTES,
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS || '30',
  },
  bvn: {
    encryption: {
      algorithm: process.env.BVN_ENCRYPTION_ALGORITHM,
      key: process.env.BVN_ENCRYPTION_KEY,
      ivLength: parseInt(process.env.BVN_ENCRYPTION_IV_LENGTH),
      authTagLength: parseInt(process.env.BVN_ENCRYPTION_AUTH_TAG_LENGTH),
    },
  },
  otp: {
    otpValidityInMinutes: parseInt(process.env.OTP_VALIDITY_IN_MINUTES),
  },
  argon2: {
    memoryCost: Number.parseInt(process.env.ARGON2_MEMORY_COST),
    timeCost: Number.parseInt(process.env.ARGON2_TIME_COST),
    parallelism: Number.parseInt(process.env.ARGON2_PARALLELISM),
  },
  defaultSMSProvider: process.env.DEFAULT_SMS_PROVIDER,
}));
