import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ChatService } from './modules/chat/chat.service';

let app: any;

async function initializeApp() {
  if (!app) {
    app = await NestFactory.createApplicationContext(AppModule);
    console.log('✅ NestJS app context initialized successfully');
  }
  return app;
}

function createSuccessResponse(data: any): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    },
    body: JSON.stringify(data),
  };
}

function createErrorResponse(
  error: any,
  statusCode: number = 500,
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      error: 'Request failed',
      details: error.message,
      timestamp: new Date().toISOString(),
    }),
  };
}

export const getMessages = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const nestApp = await initializeApp();
    const chatService = nestApp.get(ChatService);

    const roomId = event.queryStringParameters?.roomId;
    const limit = event.queryStringParameters?.limit
      ? parseInt(event.queryStringParameters.limit, 10)
      : 20;
    const offset = event.queryStringParameters?.offset
      ? parseInt(event.queryStringParameters.offset, 10)
      : 0;

    const result = await chatService.getMessages({ roomId, limit, offset });

    return createSuccessResponse({
      messages: result.messages,
      total: result.total,
      limit,
      offset,
      hasMore: offset + limit < result.total,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
};

export const processMessage = async (event: any): Promise<any> => {
  try {
    const { content } = event;

    if (!content || typeof content !== 'string') {
      throw new Error('Content is required and must be a string');
    }

    let processedContent = content
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: links
      .replace(/on\w+\s*=\s*['""][^'""]*/gi, ''); // Remove event handlers

    if (processedContent.length > 1000) {
      processedContent = processedContent.substring(0, 1000) + '...';
    }

    const bannedWords = ['spam', 'scam', 'hack'];
    bannedWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      processedContent = processedContent.replace(regex, '***');
    });

    const metadata = {
      originalLength: content.length,
      processedLength: processedContent.length,
      sanitized: content !== processedContent,
      processedAt: new Date().toISOString(),
      processingVersion: '1.0.0',
    };

    const result = {
      processedContent,
      metadata,
    };

    return result;
  } catch (error) {
    throw error;
  }
};
