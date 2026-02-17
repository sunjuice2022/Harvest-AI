/**
 * Lambda handler for GET /api/diagnosis/sessions
 * Returns chat session list and detail
 */
interface APIGatewayProxyEvent {
    pathParameters?: Record<string, string> | null;
    queryStringParameters?: Record<string, string> | null;
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
export declare function getSessions(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
export {};
//# sourceMappingURL=sessions.handler.d.ts.map