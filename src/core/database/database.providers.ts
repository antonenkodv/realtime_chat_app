import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Environment } from '../config/config-validator';

export const databaseProvider: DynamicModule = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (cfg: ConfigService) =>
    ({
      ...cfg.get('database'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: cfg.get<string>('nodeEnv') === Environment.DEVELOPMENT,
      ssl:
        cfg.get<string>('nodeEnv') === Environment.PRODUCTION
          ? { rejectUnauthorized: false }
          : false,
    }) as TypeOrmModuleOptions,
});
