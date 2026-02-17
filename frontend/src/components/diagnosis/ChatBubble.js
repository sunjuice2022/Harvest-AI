import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "./ChatBubble.css";
export const ChatBubble = ({ message, isUser }) => {
    return (_jsxs("div", { className: `chat-bubble ${isUser ? "user" : "assistant"}`, children: [message.imageUrl && _jsx("img", { src: message.imageUrl, alt: "uploaded", className: "chat-image" }), _jsxs("div", { className: "chat-content", children: [message.diagnosis && (_jsx(DiagnosisResultCard, { diagnosis: message.diagnosis })), _jsx("p", { className: "chat-text", children: message.content })] }), _jsx("span", { className: "chat-timestamp", children: new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }) })] }));
};
const DiagnosisResultCard = ({ diagnosis }) => {
    const severityColors = {
        critical: "#EF4444",
        warning: "#F59E0B",
        info: "#3B82F6",
    };
    return (_jsxs("div", { className: "diagnosis-card", children: [_jsxs("div", { className: "diagnosis-header", children: [_jsx("h3", { className: "diagnosis-condition", children: diagnosis.condition }), _jsxs("span", { className: "diagnosis-confidence", children: [diagnosis.confidence, "%"] })] }), _jsx("div", { className: "diagnosis-severity", style: { borderLeftColor: severityColors[diagnosis.severity] }, children: diagnosis.severity.toUpperCase() }), diagnosis.treatment && diagnosis.treatment.length > 0 && (_jsxs("div", { className: "diagnosis-treatment", children: [_jsx("strong", { children: "Treatment:" }), _jsx("ul", { children: diagnosis.treatment.slice(0, 3).map((t, i) => (_jsx("li", { children: t }, i))) })] }))] }));
};
//# sourceMappingURL=ChatBubble.js.map