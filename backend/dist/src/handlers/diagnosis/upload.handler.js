/**
 * Lambda handler for POST /api/diagnosis/upload
 * Returns presigned URL for S3 photo upload
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DIAGNOSIS_CONSTANTS } from "../../constants/diagnosis.constants";
import { randomUUID } from "crypto";
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const bucketName = DIAGNOSIS_CONSTANTS.MEDIA_BUCKET;
export async function uploadPhoto(event) {
    try {
        // Extract user ID from Cognito authorizer or x-user-id header (dev)
        const userId = event.requestContext?.authorizer?.claims?.sub ||
            event.headers["x-user-id"];
        if (!userId) {
            return errorResponse(401, "Unauthorized");
        }
        // Validate content type header
        const contentType = event.headers["content-type"] || "image/jpeg";
        if (!DIAGNOSIS_CONSTANTS.ALLOWED_MIME_TYPES.includes(contentType)) {
            return errorResponse(400, "Invalid file type. Allowed: JPEG, PNG, WebP");
        }
        // Generate presigned URL
        const uploadId = randomUUID();
        const key = `diagnosis/${userId}/${uploadId}.jpg`;
        const putCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: contentType,
            Metadata: { userId },
        });
        const presignedUrl = await getSignedUrl(s3Client, putCommand, {
            expiresIn: DIAGNOSIS_CONSTANTS.UPLOAD_EXPIRY_SECONDS,
        });
        const response = {
            presignedUrl,
            uploadId,
            expires: Math.floor(Date.now() / 1000) + DIAGNOSIS_CONSTANTS.UPLOAD_EXPIRY_SECONDS,
        };
        return successResponse(response);
    }
    catch (error) {
        console.error("Error in uploadPhoto:", error);
        return errorResponse(500, "Internal server error");
    }
}
function successResponse(data) {
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };
}
function errorResponse(statusCode, message) {
    return {
        statusCode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: message }),
    };
}
//# sourceMappingURL=upload.handler.js.map