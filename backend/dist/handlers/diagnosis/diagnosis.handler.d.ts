/**
 * Lambda handler for POST /api/diagnosis/chat
 * Handles diagnosis requests with text and/or image
 */
interface APIGatewayProxyEvent {
    body: string | null;
    headers: Record<string, string>;
    pathParameters?: Record<string, string>;
    requestContext?: {
        authorizer?: {
            claims?: {
                sub?: string;
            };
        };
    };
}
interface APIGatewayProxyResult {
    statusCode: number;
    body: string;
    headers?: Record<string, string>;
}
export declare function diagnosisChat(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
export {};
//# sourceMappingURL=diagnosis.handler.d.ts.map