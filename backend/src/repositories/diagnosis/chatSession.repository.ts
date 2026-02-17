/**
 * ChatSession repository - handles DynamoDB operations
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DIAGNOSIS_CONSTANTS } from "../../constants/diagnosis.constants";
import { toChatSession, toChatSessionItem, type ChatSessionItem } from "../../models/diagnosis/chatSession.model";
import type { ChatSession } from "@agrisense/shared";

export class ChatSessionRepository {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor(region?: string) {
    const client = new DynamoDBClient({ region: region || process.env.AWS_REGION });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = DIAGNOSIS_CONSTANTS.CHAT_SESSIONS_TABLE;
  }

  async getSession(userId: string, sessionId: string): Promise<ChatSession | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { PK: userId, SK: sessionId },
    });

    const result = await this.docClient.send(command);
    return result.Item ? toChatSession(result.Item as ChatSessionItem) : null;
  }

  async createSession(session: ChatSession): Promise<void> {
    const item = toChatSessionItem(session);
    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    });

    await this.docClient.send(command);
  }

  async updateSession(session: ChatSession): Promise<void> {
    session.updatedAt = Date.now();
    const item = toChatSessionItem(session);
    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    });

    await this.docClient.send(command);
  }

  async getUserSessions(userId: string, limit: number = 10): Promise<ChatSession[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: "PK = :userId",
      ExpressionAttributeValues: { ":userId": userId },
      ScanIndexForward: false,
      Limit: limit,
    });

    const result = await this.docClient.send(command);
    return (result.Items || []).map((item) => toChatSession(item as ChatSessionItem));
  }
}
