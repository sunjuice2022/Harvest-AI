/**
 * ChatBubble component - displays individual chat messages
 */
import React from "react";
import type { ChatMessage } from "@agrisense/shared";
import "./ChatBubble.css";
interface ChatBubbleProps {
    message: ChatMessage;
    isUser: boolean;
}
export declare const ChatBubble: React.FC<ChatBubbleProps>;
export {};
//# sourceMappingURL=ChatBubble.d.ts.map