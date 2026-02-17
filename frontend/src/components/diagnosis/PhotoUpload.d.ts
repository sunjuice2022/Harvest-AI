/**
 * PhotoUpload component - handles camera capture and gallery upload
 */
import React from "react";
import "./PhotoUpload.css";
interface PhotoUploadProps {
    onPhotoSelected: (file: File) => void;
    isLoading?: boolean;
    uploadProgress?: number;
}
export declare const PhotoUpload: React.FC<PhotoUploadProps>;
export {};
//# sourceMappingURL=PhotoUpload.d.ts.map