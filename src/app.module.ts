import { Module } from '@nestjs/common';
import { DatabaseModule } from './core/database/database.module';
import ConfigModule from './core/config/config.module';
import { ChatModule } from './modules/chat/chat.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    ChatModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
  ],
})
export class AppModule {}
