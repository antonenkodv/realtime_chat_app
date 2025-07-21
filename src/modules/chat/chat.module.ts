import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { AwsLambdaService } from 'src/core/services/aws/aws.lambda.service';
import { MessageProcessingService } from './services/message-processing.service';
import { ChatController } from './chat.controller';
import { Message } from 'src/core/entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatService,
    AwsLambdaService,
    MessageProcessingService,
  ],
  exports: [ChatGateway, AwsLambdaService],
})
export class ChatModule {}
