import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../core/entities/message.entity';
import { PageBasedPaginationDTO } from './dtos/pagination.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async saveMessage(content: string, userId: string): Promise<Message> {
    const message = this.messageRepository.create({ content, userId });
    return this.messageRepository.save(message);
  }

  async getMessages(
    query: PageBasedPaginationDTO,
  ): Promise<{ messages: Message[]; total: number }> {
    const { limit, offset } = query;

    const [messages, total] = await this.messageRepository.findAndCount({
      order: {
        timestamp: 'DESC',
      },
      skip: offset,
      take: limit,
    });

    return { messages, total };
  }
}
