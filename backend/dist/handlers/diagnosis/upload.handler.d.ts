/**
 * Lambda handler for POST /api/diagnosis/upload
 * Returns presigned URL for S3 photo upload
 */
interface APIGatewayProxyEvent {
    body: string | null;
    headers: Record<string, string>;
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
export declare function uploadPhoto(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
export {};
//# sourceMappingURL=upload.handler.d.ts.map