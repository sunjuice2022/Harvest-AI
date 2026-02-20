/**
 * VoiceChatService — general agricultural AI chatbot via Amazon Bedrock (PRD §4.5)
 */
interface ServiceConfig {
    region?: string;
}
export interface HistoryItem {
    role: "user" | "assistant";
    content: string;
}
export declare class VoiceChatService {
    private client;
    constructor(config?: ServiceConfig);
    chat(message: string, history?: HistoryItem[], language?: string): Promise<string>;
}
export {};
//# sourceMappingURL=voiceChat.service.d.ts.map