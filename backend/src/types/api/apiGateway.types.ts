/** Shared API Gateway Lambda event and result types used across all handlers. */

export interface APIGatewayProxyEvent {
  body: string | null;
  headers: Record<string, string>;
  pathParameters?: Record<string, string> | null;
  queryStringParameters?: Record<string, string> | null;
  requestContext?: {
    authorizer?: {
      claims?: { sub?: string };
    };
  };
}

export interface APIGatewayProxyResult {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
}

export function successResponse(data: unknown): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

export function errorResponse(statusCode: number, message: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: message }),
  };
}

export function extractUserId(event: APIGatewayProxyEvent): string | undefined {
  return event.requestContext?.authorizer?.claims?.sub ?? event.headers['x-user-id'];
}
