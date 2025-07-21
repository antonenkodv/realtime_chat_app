import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { MessageProcessingService } from './services/message-processing.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly messageProcessingService: MessageProcessingService,
  ) {}

  afterInit() {
    console.log('🔌 WebSocket Gateway initialized');
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const roomId = socket.handshake.query.roomId as string;
    if (roomId) {
      socket.join(roomId);
      console.log(
        `👤 Client ${socket.id} connected and joined room: ${roomId}`,
      );

      // Notify room about new connection
      socket.to(roomId).emit('user-joined', {
        userId: socket.id,
        roomId: roomId,
        timestamp: new Date().toISOString(),
      });
    } else {
      this.sendError(socket, 'Room ID is required to connect');
      socket.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const roomId = socket.handshake.query.roomId as string;
    console.log(
      `👋 Client ${socket.id} disconnected from room: ${roomId || 'unknown'}`,
    );

    if (roomId) {
      // Notify room about user leaving
      socket.to(roomId).emit('user-left', {
        userId: socket.id,
        roomId: roomId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() { content, roomId }: { content: string; roomId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      if (!content || !roomId) {
        this.sendError(client, 'Content and roomId are required');
        return;
      }

      await this.processMessage(content, roomId, client);
    } catch (error) {
      this.sendError(client, 'Failed to process message: ' + error.message);
    }
  }

  private async processMessage(
    content: string,
    roomId: string,
    client: Socket,
  ): Promise<void> {
    const processedContent =
      await this.messageProcessingService.processMessage(content);

    const message = await this.chatService.saveMessage(
      processedContent,
      client.id,
    );

    const messagePayload = {
      id: message.id,
      content: message.content,
      userId: message.userId,
      roomId: roomId,
      timestamp: message.timestamp,
      processed: true,
    };

    this.server.to(roomId).emit('message', messagePayload);
  }

  sendError(socket: Socket, message: string) {
    socket.emit('error', {
      error: message,
      timestamp: new Date().toISOString(),
    });
  }
}
