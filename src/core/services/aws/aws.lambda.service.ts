import { Injectable } from '@nestjs/common';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { ConfigService } from '@nestjs/config';

export interface LambdaInvokeOptions {
  functionName: string;
  payload?: Record<string, any>;
  invocationType?: 'Event' | 'RequestResponse';
}

@Injectable()
export class AwsLambdaService {
  private readonly lambda: LambdaClient;

  constructor(private readonly configService: ConfigService) {
    const { region, accessKeyId, secretAccessKey } =
      this.configService.get('aws') ?? {};

    this.lambda = new LambdaClient({
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? { accessKeyId, secretAccessKey }
          : undefined,
    });
  }

  async invokeOrThrow<T = any>(options: LambdaInvokeOptions): Promise<T> {
    const command = new InvokeCommand({
      FunctionName: options.functionName,
      Payload: options.payload
        ? Buffer.from(JSON.stringify(options.payload))
        : undefined,
      InvocationType: options.invocationType ?? 'RequestResponse',
    });

    const response = await this.lambda.send(command).catch(err => {
      throw new Error(
        err instanceof Error ? err.message : 'Unknown Lambda invocation error',
      );
    });

    if (response.FunctionError) {
      throw new Error(`Lambda error: ${response.FunctionError}`);
    }

    if (!response.Payload) {
      throw new Error('Lambda returned empty payload');
    }

    try {
      return JSON.parse(Buffer.from(response.Payload).toString()) as T;
    } catch {
      throw new Error('Failed to parse Lambda response');
    }
  }
}
