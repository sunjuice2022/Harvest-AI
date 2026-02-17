import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * DiagnosisPage - main crop diagnosis chatbot interface
 */
import { useEffect, useRef, useState } from "react";
import { ChatBubble } from "../components/diagnosis/ChatBubble";
import { ChatInput } from "../components/diagnosis/ChatInput";
import { PhotoUpload } from "../components/diagnosis/PhotoUpload";
import { useDiagnosis } from "../hooks/useDiagnosis";
import "./DiagnosisPage.css";
export const DiagnosisPage = () => {
    const [state, actions] = useDiagnosis();
    const [showPhotoUpload, setShowPhotoUpload] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState("");
    const messagesEndRef = useRef(null);
    const initializedRef = useRef(false);
    useEffect(() => {
        // Initialize session on mount (only once)
        if (!initializedRef.current && !state.session) {
            initializedRef.current = true;
            actions.initializeSession();
        }
    }, []);
    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [state.session?.messages]);
    const handlePhotoSelected = async (file) => {
        console.log("📸 Photo selected:", file.name, file.size, file.type);
        setShowPhotoUpload(true);
        console.log("🔄 Calling uploadPhoto...");
        const imageUrl = await actions.uploadPhoto(file);
        console.log("✅ Upload complete, imageUrl:", imageUrl ? "✓ (length: " + imageUrl.length + ")" : "✗ empty");
        if (imageUrl) {
            setSelectedImageUrl(imageUrl);
            console.log("✅ Image URL set for next message");
        }
        else {
            console.log("❌ Upload failed, no imageUrl returned");
        }
    };
    const handleSendMessage = async (message) => {
        if (state.isLoading)
            return;
        const imageUrl = selectedImageUrl || undefined;
        const diagnosis = await actions.sendMessage(message, imageUrl);
        if (diagnosis) {
            setSelectedImageUrl("");
        }
    };
    if (!state.session) {
        return (_jsxs("div", { className: "diagnosis-page loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Initializing diagnostic chatbot..." })] }));
    }
    return (_jsxs("div", { className: "diagnosis-page", children: [_jsxs("div", { className: "diagnosis-header", children: [_jsx("h1", { children: "\uD83C\uDF3E Crop Diagnosis AI" }), _jsx("p", { children: "Upload a photo or describe your plant issue for instant diagnosis" })] }), state.error && (_jsxs("div", { className: "error-banner", children: [_jsx("span", { children: state.error }), _jsx("button", { onClick: actions.clearError, className: "close-error", children: "\u2715" })] })), _jsx("div", { className: "chat-container", children: state.session.messages.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-icon", children: "\uD83C\uDF31" }), _jsx("h2", { children: "Welcome to Crop Diagnosis AI" }), _jsx("p", { children: "Start by uploading a photo of your plant or describing the issue you're experiencing." }), selectedImageUrl && (_jsx("div", { className: "selected-photo-badge", children: _jsx("span", { children: "\uD83D\uDCF8 Photo selected - Ready to send!" }) })), _jsxs("div", { className: "empty-actions", children: [_jsx("button", { className: "action-button", onClick: () => setShowPhotoUpload(true), type: "button", children: "\uD83D\uDCF8 Upload Photo" }), _jsx("span", { className: "divider", children: "or" }), _jsx("button", { className: "action-button text-button", onClick: () => {
                                        const input = document.querySelector(".chat-input");
                                        input?.focus();
                                    }, type: "button", children: "\uD83D\uDCAC Type Description" })] })] })) : (_jsxs("div", { className: "messages-list", children: [state.session.messages.map((message) => (_jsx(ChatBubble, { message: message, isUser: message.role === "user" }, message.id))), selectedImageUrl && (_jsxs("div", { className: "photo-preview-in-chat", children: [_jsx("img", { src: selectedImageUrl, alt: "selected for diagnosis" }), _jsx("span", { children: "\uD83D\uDCF8 Photo ready to send" })] })), _jsx("div", { ref: messagesEndRef })] })) }), showPhotoUpload && (_jsx("div", { className: "photo-upload-modal", children: _jsxs("div", { className: "photo-upload-content", children: [_jsx("h3", { children: "Upload Plant Photo" }), _jsx(PhotoUpload, { onPhotoSelected: handlePhotoSelected, isLoading: state.isLoading, uploadProgress: state.uploadProgress }), _jsx("button", { className: "close-modal", onClick: () => {
                                setShowPhotoUpload(false);
                            }, type: "button", children: "Done" })] }) })), _jsxs("div", { className: "chat-footer", children: [selectedImageUrl && (_jsxs("div", { className: "photo-status", children: [_jsx("span", { children: "\u2705 Photo selected" }), _jsx("button", { className: "remove-photo", onClick: () => {
                                    setSelectedImageUrl("");
                                    console.log("❌ Photo removed");
                                }, type: "button", title: "Remove photo", children: "\u2715" })] })), _jsx(ChatInput, { onSendMessage: handleSendMessage, onPhotoClick: () => setShowPhotoUpload(true), isLoading: state.isLoading })] })] }));
};
//# sourceMappingURL=DiagnosisPage.js.map