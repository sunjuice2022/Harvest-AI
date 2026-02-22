/**
 * Lambda handler for POST /api/diagnosis/upload
 * Returns presigned URL for S3 photo upload
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DIAGNOSIS_CONSTANTS } from '../../constants/diagnosis.constants';
import type { PhotoUploadResponse } from '@harvest-ai/shared';
import { randomUUID } from 'crypto';
import {
  APIGatewayProxyEvent, APIGatewayProxyResult,
  successResponse, errorResponse, extractUserId,
} from '../../types/api/apiGateway.types';

const s3Client = new S3Client({ region: process.env.AWS_REGION ?? 'ap-southeast-2' });
const bucketName = DIAGNOSIS_CONSTANTS.MEDIA_BUCKET;

export async function uploadPhoto(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const userId = extractUserId(event);
    if (!userId) return errorResponse(401, 'Unauthorized');

    const contentType = event.headers['content-type'] || 'image/jpeg';
    if (!DIAGNOSIS_CONSTANTS.ALLOWED_MIME_TYPES.includes(contentType)) {
      return errorResponse(400, 'Invalid file type. Allowed: JPEG, PNG, WebP');
    }

    const uploadId = randomUUID();
    const key = `diagnosis/${userId}/${uploadId}.jpg`;
    const putCommand = new PutObjectCommand({
      Bucket: bucketName, Key: key, ContentType: contentType, Metadata: { userId },
    });

    const presignedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: DIAGNOSIS_CONSTANTS.UPLOAD_EXPIRY_SECONDS,
    });

    const response: PhotoUploadResponse = {
      presignedUrl,
      uploadId,
      expires: Math.floor(Date.now() / 1000) + DIAGNOSIS_CONSTANTS.UPLOAD_EXPIRY_SECONDS,
    };
    return successResponse(response);
  } catch (error) {
    console.error('[uploadPhoto] error:', error);
    return errorResponse(500, 'Internal server error');
  }
}
