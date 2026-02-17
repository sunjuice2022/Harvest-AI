import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ChatInput component - message input bar with send button
 */
import { useState } from "react";
import "./ChatInput.css";
export const ChatInput = ({ onSendMessage, onPhotoClick, isLoading = false, placeholder = "Describe your crop issue...", }) => {
    const [message, setMessage] = useState("");
    const handleSend = () => {
        if (message.trim() && !isLoading) {
            onSendMessage(message.trim());
            setMessage("");
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    return (_jsx("div", { className: "chat-input-container", children: _jsxs("div", { className: "chat-input-wrapper", children: [_jsx("button", { className: "photo-button", onClick: onPhotoClick, disabled: isLoading, type: "button", title: "Upload photo", children: "\uD83D\uDCF8" }), _jsx("textarea", { className: "chat-input", value: message, onChange: (e) => setMessage(e.target.value), onKeyPress: handleKeyPress, placeholder: placeholder, disabled: isLoading, rows: 1 }), _jsx("button", { className: "send-button", onClick: handleSend, disabled: isLoading || !message.trim(), type: "button", title: "Send message", children: isLoading ? "..." : "📤" })] }) }));
};
//# sourceMappingURL=ChatInput.js.map