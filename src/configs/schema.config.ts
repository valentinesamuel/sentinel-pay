import * as Joi from 'joi';

const NODE_ENVIRONMENTS: string[] = ['local', 'development', 'staging', 'beta', 'production'];
const DEFAULT_NODE_ENV: string = NODE_ENVIRONMENTS[0];
const DEFAULT_APP_PORT: number = 3000;
// const DEFAULT_DATABASE_PORT: number = 5432;
const IS_DEVELOPMENT_DEFAULT: boolean = false;
// const DEFAULT_DATABASE_RETRY_ATTEMPTS: number = 5;

export default {
  envFilePath: [
    '.local.env',
    '.development.env',
    '.staging.env',
    '.beta.env',
    '.production.env',
    '.env',
  ],
  cache: true,
  isGlobal: true,
  validationOptions: {
    allowUnknown: true,
    abortEarly: true,
  },
  validationSchema: Joi.object({
    // common
    PORT: Joi.number().default(DEFAULT_APP_PORT),
    APP_NAME: Joi.string().required(),
    APP_HOSTNAME: Joi.string().required(),
    CORS_WHITELIST: Joi.string().required(),
    NODE_ENV: Joi.string()
      .valid(...NODE_ENVIRONMENTS)
      .default(DEFAULT_NODE_ENV),
    TOKEN_ENCRYPTION_KEY: Joi.string().required(),
    IS_DEVELOPMENT: Joi.boolean().default(IS_DEVELOPMENT_DEFAULT),

    // typeorm
    // DATABASE_TYPE: Joi.string().required(),
    // DATABASE_DB: Joi.string().required(),
    // DATABASE_HOST: Joi.string().required(),
    // DATABASE_PORT: Joi.number().integer().default(DEFAULT_DATABASE_PORT),
    // DATABASE_USER: Joi.string().required(),
    // DATABASE_PASSWORD: Joi.string().required(),
    // DATABASE_LOGGING: Joi.boolean().default(false),
    // DATABASE_SYNC: Joi.boolean().when('NODE_ENV', {
    //   is: Joi.string().equal(DEFAULT_NODE_ENV),
    //   then: Joi.boolean().default(true),
    //   otherwise: Joi.boolean().default(false),
    // }),
    // DATABASE_RETRY_ATTEMPTS: Joi.number().default(DEFAULT_DATABASE_RETRY_ATTEMPTS),

    // // swagger
    // SWAGGER_API_ROOT: Joi.string().required(),

    // JWT
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN_MINUTES: Joi.string().required(),
    JWT_TEMP_TOKEN_EXPIRES_IN_MINUTES: Joi.string().required(),
    JWT_REFRESH_TOKEN_EXPIRES_IN_DAYS: Joi.string().optional(),

    // Auth
    BCRYPT_SALT_ROUNDS: Joi.number().required(),
    OTP_VALIDITY_IN_MINUTES: Joi.number().required(),
    CLIENT_AUTH_NAME: Joi.string().required(),
    CLIENT_AUTH_SERVICE_KEY: Joi.string().required(),
    CLIENT_AUTH_ENCRYPTION_KEY_NAME: Joi.string().required(),

    // Encryption
    ENCRYPTION_IV_LENGTH: Joi.number().required(),
    ENCRYPTION_KEY: Joi.string().required(),
    ENCRYPTION_SALT: Joi.string().required(),
    BVN_ENCRYPTION_ALGORITHM: Joi.string().required(),
    BVN_ENCRYPTION_KEY: Joi.string().required(),
    ENCRYPTION_ALGORITHM: Joi.string().required(),

    // Hashing
    HASHING_ALGORITHM: Joi.string().required(),

    // Sendgrid
    SENDGRID_API_KEY: Joi.string().required(),
    SENDGRID_SENDER_NAME: Joi.string().required(),
    SENDGRID_SENDER_EMAIL: Joi.string().required(),

    ARGON2_MEMORY_COST: Joi.number().required(),
    ARGON2_TIME_COST: Joi.number().required(),
    ARGON2_PARALLELISM: Joi.number().required(),
  }),
};
