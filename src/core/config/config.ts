import { env } from 'process';
import { Environment } from './config-validator';

export default () => ({
  port: parseInt(env.PORT, 10) || 3000,
  nodeEnv: env.NODE_ENV || Environment.DEVELOPMENT,
  stage: env.STAGE || 'dev',

  database: {
    type: 'mysql',
    host: env.DB_HOST || 'localhost',
    port: parseInt(env.DB_PORT, 10) || 3306,
    username: env.DB_USERNAME || 'root',
    password: env.DB_PASSWORD || 'password',
    database: env.DB_DATABASE || 'realtime_chat',
  },

  aws: {
    region: env.AWS_REGION || 'eu-central-1',
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
