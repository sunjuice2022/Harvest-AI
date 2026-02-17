/**
 * ChatSession repository - handles DynamoDB operations
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DIAGNOSIS_CONSTANTS } from "../../constants/diagnosis.constants";
import { toChatSession, toChatSessionItem } from "../../models/diagnosis/chatSession.model";
export class ChatSessionRepository {
    constructor(region) {
        const client = new DynamoDBClient({ region: region || process.env.AWS_REGION });
        this.docClient = DynamoDBDocumentClient.from(client);
        this.tableName = DIAGNOSIS_CONSTANTS.CHAT_SESSIONS_TABLE;
    }
    async getSession(userId, sessionId) {
        const command = new GetCommand({
            TableName: this.tableName,
            Key: { PK: userId, SK: sessionId },
        });
        const result = await this.docClient.send(command);
        return result.Item ? toChatSession(result.Item) : null;
    }
    async createSession(session) {
        const item = toChatSessionItem(session);
        const command = new PutCommand({
            TableName: this.tableName,
            Item: item,
        });
        await this.docClient.send(command);
    }
    async updateSession(session) {
        session.updatedAt = Date.now();
        const item = toChatSessionItem(session);
        const command = new PutCommand({
            TableName: this.tableName,
            Item: item,
        });
        await this.docClient.send(command);
    }
    async getUserSessions(userId, limit = 10) {
        const command = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: "PK = :userId",
            ExpressionAttributeValues: { ":userId": userId },
            ScanIndexForward: false,
            Limit: limit,
        });
        const result = await this.docClient.send(command);
        return (result.Items || []).map((item) => toChatSession(item));
    }
}
//# sourceMappingURL=chatSession.repository.js.map