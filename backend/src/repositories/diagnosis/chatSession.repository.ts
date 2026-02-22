/**
 * ChatSession repository - handles DynamoDB operations
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DIAGNOSIS_CONSTANTS } from '../../constants/diagnosis.constants';
import { toChatSession, toChatSessionItem, type ChatSessionItem } from '../../models/diagnosis/chatSession.model';
import type { ChatSession } from '@harvest-ai/shared';

export class ChatSessionRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(region?: string) {
    const client = new DynamoDBClient({ region: region ?? process.env.AWS_REGION ?? 'ap-southeast-2' });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = DIAGNOSIS_CONSTANTS.CHAT_SESSIONS_TABLE;
  }

  async getSession(userId: string, sessionId: string): Promise<ChatSession | null> {
    try {
      const command = new GetCommand({
        TableName: this.tableName,
        Key: { PK: userId, SK: sessionId },
      });
      const result = await this.docClient.send(command);
      return result.Item ? toChatSession(result.Item as ChatSessionItem) : null;
    } catch (error) {
      console.error('[ChatSessionRepository.getSession] error:', error);
      throw error;
    }
  }

  async createSession(session: ChatSession): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: this.tableName,
        Item: toChatSessionItem(session),
      });
      await this.docClient.send(command);
    } catch (error) {
      console.error('[ChatSessionRepository.createSession] error:', error);
      throw error;
    }
  }

  async updateSession(session: ChatSession): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: this.tableName,
        Item: toChatSessionItem(session),
      });
      await this.docClient.send(command);
    } catch (error) {
      console.error('[ChatSessionRepository.updateSession] error:', error);
      throw error;
    }
  }

  async getUserSessions(userId: string, limit = 10): Promise<ChatSession[]> {
    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'PK = :userId',
        ExpressionAttributeValues: { ':userId': userId },
        ScanIndexForward: false,
        Limit: limit,
      });
      const result = await this.docClient.send(command);
      return (result.Items || []).map((item) => toChatSession(item as ChatSessionItem));
    } catch (error) {
      console.error('[ChatSessionRepository.getUserSessions] error:', error);
      throw error;
    }
  }
}
