import { Global, Module } from '@nestjs/common';
import { databaseProvider } from './database.providers';

@Global()
@Module({
  imports: [databaseProvider],
  exports: [databaseProvider],
})
export class DatabaseModule {}
