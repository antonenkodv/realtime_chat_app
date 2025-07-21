import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AwsLambdaService } from '../../../core/services/aws/aws.lambda.service';
import { InternalServerErrorException } from '@nestjs/common';

export interface ProcessedMessage {
  processedContent: string;
  metadata: {
    originalLength: number;
    processedLength: number;
    sanitized: boolean;
    processedAt: string;
    processingVersion: string;
  };
}

@Injectable()
export class MessageProcessingService {
  constructor(
    private readonly awsLambdaService: AwsLambdaService,
    private readonly configService: ConfigService,
  ) {}

  async processMessage(content: string): Promise<string> {
    try {
      const processed =
        await this.awsLambdaService.invokeOrThrow<ProcessedMessage>({
          functionName: `nestjs-chat-app-${this.configService.get<string>('stage')}-processMessage`,
          payload: { content },
        });

      console.log('✅ Message processed by Lambda:', {
        originalLength: processed.metadata.originalLength,
        processedLength: processed.metadata.processedLength,
        sanitized: processed.metadata.sanitized,
      });

      return processed.processedContent;
    } catch (error) {
      throw new InternalServerErrorException('Lambda failed: ' + error.message);
    }
  }
}
