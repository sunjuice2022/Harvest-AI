/**
 * ChatInput component - message input bar with send button
 */
import React from "react";
import "./ChatInput.css";
interface ChatInputProps {
    onSendMessage: (message: string) => void;
    onPhotoClick: () => void;
    isLoading?: boolean;
    placeholder?: string;
}
export declare const ChatInput: React.FC<ChatInputProps>;
export {};
//# sourceMappingURL=ChatInput.d.ts.map