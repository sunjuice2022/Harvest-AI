import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DiagnosisPage } from "./pages/DiagnosisPage";
export const App = () => {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/diagnosis", element: _jsx(DiagnosisPage, {}) }), _jsx(Route, { path: "/", element: _jsxs("div", { style: { padding: "40px", textAlign: "center" }, children: [_jsx("h1", { children: "\uD83C\uDF3E AgriSense AI" }), _jsx("p", { children: "Welcome to Crop Diagnosis AI" }), _jsx("p", { children: _jsx("a", { href: "/diagnosis", style: { color: "#84cc16", fontSize: "18px" }, children: "Go to Diagnosis Chatbot \u2192" }) })] }) })] }) }));
};
//# sourceMappingURL=App.js.map