import { plainToInstance } from 'class-transformer';
import {
  IsDefined,
  IsNumber,
  IsString,
  IsOptional,
  validateSync,
} from 'class-validator';

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  STAGING = 'staging',
  TEST = 'test',
}

class EnvironmentVariables {
  @IsNumber()
  @IsDefined()
  PORT: number;

  @IsString()
  @IsOptional()
  NODE_ENV: string;

  @IsString()
  @IsOptional()
  STAGE: string;

  @IsString()
  @IsDefined()
  DB_HOST: string;

  @IsNumber()
  @IsOptional()
  DB_PORT: number;

  @IsString()
  @IsDefined()
  DB_USERNAME: string;

  @IsString()
  @IsDefined()
  DB_PASSWORD: string;

  @IsString()
  @IsDefined()
  DB_DATABASE: string;

  @IsString()
  @IsOptional()
  AWS_REGION: string;

  @IsString()
  @IsOptional()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  @IsOptional()
  AWS_SECRET_ACCESS_KEY: string;
}

export function configValidator(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    errors.forEach(error => {
      console.error(
        `- ${error.property}: ${Object.values(error.constraints || {}).join(', ')}`,
      );
    });
    throw new Error(
      'Configuration validation failed. Please check your .env file.',
    );
  }

  console.log('✅ Configuration validation passed');
  return validatedConfig;
}
