/** Utility for formatting consistent API Gateway Lambda proxy responses. */

import { APIGatewayProxyResult } from 'aws-lambda';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000',
  'Access-Control-Allow-Credentials': 'true',
};

export function formatApiResponse<T>(statusCode: number, body: T): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function formatApiError(error: unknown): APIGatewayProxyResult {
  const message = error instanceof Error ? error.message : 'Internal server error';
  const statusCode = resolveStatusCode(error);

  console.error('[API Error]', { message, error });

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: message }),
  };
}

function resolveStatusCode(error: unknown): number {
  if (error instanceof ValidationError) return 400;
  if (error instanceof NotFoundError) return 404;
  return 500;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
