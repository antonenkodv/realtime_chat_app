import { ConfigModule } from '@nestjs/config';
import { configValidator } from './config-validator';
import config from './config';
import * as path from 'path';
import { cwd } from 'process';

const envFile = `.env`;
const envFilePath = path.resolve(cwd(), envFile);

export default ConfigModule.forRoot({
  envFilePath,
  load: [config],
  isGlobal: true,
  validate: configValidator,
});
