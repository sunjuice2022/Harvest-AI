// Mock S3 presigned URLs
const MOCK_BUCKET = "agrisense-media-mock";
export async function mockGeneratePresignedUrl(fileName, fileType) {
    // Simulate presigned URL
    // In real app: https://bucket.s3.amazonaws.com/path?X-Amz-Signature=...
    const uploadId = Date.now().toString();
    const mockUrl = `https://${MOCK_BUCKET}.s3.amazonaws.com/diagnosis/${uploadId}/${fileName}?mock-presigned=true&expires-in=600`;
    return mockUrl;
}
export async function mockValidateFileType(mimeType) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    return allowedTypes.includes(mimeType);
}
// Simulate S3 upload success
export async function mockConfirmUpload(presignedUrl) {
    // In real app: PUT to presignedUrl with file content
    // For mock: just validate URL format
    return presignedUrl.includes(MOCK_BUCKET);
}
//# sourceMappingURL=s3.mock.js.map