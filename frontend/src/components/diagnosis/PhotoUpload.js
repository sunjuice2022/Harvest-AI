import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PhotoUpload component - handles camera capture and gallery upload
 */
import { useRef, useState } from "react";
import "./PhotoUpload.css";
export const PhotoUpload = ({ onPhotoSelected, isLoading = false, uploadProgress = 0, }) => {
    const [preview, setPreview] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState("");
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const handleFileSelect = (file) => {
        if (file.size > 10 * 1024 * 1024) {
            alert("File too large (max 10MB)");
            return;
        }
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result);
        };
        reader.readAsDataURL(file);
        setSelectedFileName(file.name);
        onPhotoSelected(file);
    };
    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };
    const handleCameraCapture = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };
    const handleGalleryClick = () => {
        fileInputRef.current?.click();
    };
    const handleCameraClick = () => {
        cameraInputRef.current?.click();
    };
    const handleClearPreview = () => {
        setPreview(null);
        setSelectedFileName("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (cameraInputRef.current) {
            cameraInputRef.current.value = "";
        }
    };
    return (_jsxs("div", { className: "photo-upload", children: [preview ? (_jsxs("div", { className: "photo-preview", children: [_jsx("img", { src: preview, alt: "preview", className: "preview-image" }), _jsxs("div", { className: "preview-info", children: [_jsx("span", { className: "preview-filename", children: selectedFileName }), isLoading && (_jsxs("div", { className: "upload-progress", children: [_jsx("div", { className: "progress-bar", style: { width: `${uploadProgress}%` } }), _jsxs("span", { className: "progress-text", children: [uploadProgress, "%"] })] }))] }), !isLoading && (_jsx("button", { className: "clear-button", onClick: handleClearPreview, type: "button", children: "\u2715" }))] })) : (_jsxs("div", { className: "upload-actions", children: [_jsxs("button", { className: "upload-button camera-button", onClick: handleCameraClick, disabled: isLoading, type: "button", children: [_jsx("span", { className: "button-icon", children: "\uD83D\uDCF7" }), _jsx("span", { className: "button-text", children: "Take Photo" })] }), _jsx("span", { className: "upload-divider", children: "or" }), _jsxs("button", { className: "upload-button gallery-button", onClick: handleGalleryClick, disabled: isLoading, type: "button", children: [_jsx("span", { className: "button-icon", children: "\uD83D\uDDBC\uFE0F" }), _jsx("span", { className: "button-text", children: "Upload Photo" })] })] })), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleFileInputChange, style: { display: "none" }, capture: false }), _jsx("input", { ref: cameraInputRef, type: "file", accept: "image/*", onChange: handleCameraCapture, style: { display: "none" }, capture: "environment" })] }));
};
//# sourceMappingURL=PhotoUpload.js.map