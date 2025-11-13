import { registerAs } from '@nestjs/config';

const NODE_ENVIRONMENTS = ['development', 'staging', 'beta', 'production'];

export default registerAs('common', () => ({
  port: process.env.APP_PORT ? Number.parseInt(process.env.APP_PORT) : 3000,
  appName: process.env.APP_NAME,
  appHostName: process.env.APP_HOSTNAME,
  nodeEnv: process.env.NODE_ENV,
  isDevelopment: process.env.NODE_ENV === NODE_ENVIRONMENTS[0],
  swaggerApiRoot: process.env.SWAGGER_API_ROOT,
}));
