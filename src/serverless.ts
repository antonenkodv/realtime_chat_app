import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { configure as serverlessExpress } from '@codegenie/serverless-express';
import { Context, Handler } from 'aws-lambda';

import { AppModule } from './app.module';

let cachedServer: Handler;

async function bootstrap() {
  if (!cachedServer) {
    console.log('❄️ COLD START: Initializing NestJS application...');

    const nestApp = await NestFactory.create(AppModule);
    nestApp.enableCors();
    nestApp.useGlobalPipes(new ValidationPipe());
    await nestApp.init();

    const expressApp = nestApp.getHttpAdapter().getInstance();
    cachedServer = serverlessExpress({ app: expressApp });
  } else {
    console.log('🔥 HOT START: Using cached server');
  }

  return cachedServer;
}

export const handler = async (event: any, context: Context, callback: any) => {
  console.log(`📥 Request: ${event.httpMethod} ${event.path}`);

  try {
    const server = await bootstrap();
    const result = await server(event, context, callback);
    console.log('✅ Request completed');
    return result;
  } catch (error) {
    throw error;
  }
};
