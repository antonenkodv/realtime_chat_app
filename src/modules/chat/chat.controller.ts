import { Controller, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PageBasedPaginationDTO } from './dtos/pagination.dto';
import { Message } from '../../core/entities/message.entity';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  async getMessages(
    @Query() query: PageBasedPaginationDTO,
  ): Promise<{ messages: Message[]; total: number }> {
    return this.chatService.getMessages(query);
  }
}
