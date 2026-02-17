/**
 * useDiagnosis hook - manages diagnosis chat state and API interactions
 */
import { useState, useCallback, useRef, useEffect } from "react";
// Simple UUID v4 generator for browser
function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
export function useDiagnosis() {
    const [state, setState] = useState({
        session: null,
        isLoading: false,
        error: null,
        uploadProgress: 0,
    });
    // Use ref to store userId so it's stable across renders
    const userIdRef = useRef("");
    // Initialize userId once
    useEffect(() => {
        if (!userIdRef.current) {
            let userId = localStorage.getItem("userId");
            if (!userId) {
                userId = `user-${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem("userId", userId);
            }
            userIdRef.current = userId;
        }
    }, []);
    const initializeSession = useCallback(async () => {
        const newSession = {
            sessionId: generateUUID(),
            userId: userIdRef.current,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setState((prev) => ({ ...prev, session: newSession, error: null }));
    }, []);
    const sendMessage = useCallback(async (message, imageUrl) => {
        if (!state.session) {
            setState((prev) => ({ ...prev, error: "No active session" }));
            return null;
        }
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await fetch(`${API_BASE_URL}/diagnosis/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userIdRef.current,
                },
                body: JSON.stringify({
                    sessionId: state.session.sessionId,
                    message,
                    imageUrl,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = (await response.json());
            // Update session with new messages
            const updatedSession = {
                ...state.session,
                messages: [
                    ...state.session.messages,
                    {
                        id: generateUUID(),
                        role: "user",
                        content: message,
                        imageUrl,
                        timestamp: Date.now(),
                    },
                    {
                        id: data.messageId,
                        role: "assistant",
                        content: formatDiagnosisForDisplay(data.diagnosis),
                        timestamp: Date.now(),
                        diagnosis: data.diagnosis,
                    },
                ],
                lastDiagnosis: data.diagnosis,
                updatedAt: Date.now(),
            };
            setState((prev) => ({
                ...prev,
                session: updatedSession,
                isLoading: false,
            }));
            return data.diagnosis;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
            return null;
        }
    }, [state.session]);
    const uploadPhoto = useCallback(async (file) => {
        // Validate file
        if (file.size > 10 * 1024 * 1024) {
            setState((prev) => ({ ...prev, error: "File too large (max 10MB)" }));
            return "";
        }
        console.log("📸 Starting photo upload:", file.name, file.type);
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            // Get presigned URL
            console.log("🔄 Requesting presigned URL from backend...");
            const urlResponse = await fetch(`${API_BASE_URL}/diagnosis/upload`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userIdRef.current,
                },
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type,
                }),
            });
            if (!urlResponse.ok) {
                throw new Error(`Failed to get upload URL: ${urlResponse.status}`);
            }
            const { presignedUrl } = await urlResponse.json();
            console.log("✅ Got presigned URL");
            // For mock mode, we skip the actual S3 upload and just use the file as data URL
            // In real AWS mode, you would PUT to the presignedUrl here
            let imageUrl = presignedUrl;
            // Try to create a data URL for better mock testing
            if (API_BASE_URL.includes("localhost")) {
                console.log("📱 Mock mode: Converting to data URL...");
                // In mock/local mode, use a data URL so the image actually displays
                const reader = new FileReader();
                await new Promise((resolve) => {
                    reader.onload = () => {
                        imageUrl = reader.result;
                        console.log("✅ Data URL created, length:", imageUrl.length);
                        resolve(undefined);
                    };
                    reader.readAsDataURL(file);
                });
            }
            else {
                console.log("🌐 Production mode: Uploading to S3...");
                // In production, upload to S3 via presigned URL
                const uploadResponse = await fetch(presignedUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Type": file.type,
                    },
                    body: file,
                });
                if (!uploadResponse.ok) {
                    throw new Error("Failed to upload file to S3");
                }
                // Extract base URL without query params
                imageUrl = presignedUrl.split("?")[0];
                console.log("✅ File uploaded to S3");
            }
            console.log("✅ Upload complete, imageUrl length:", imageUrl.length);
            setState((prev) => ({
                ...prev,
                isLoading: false,
                uploadProgress: 100,
            }));
            return imageUrl;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Upload failed";
            console.error("❌ Upload error:", errorMessage);
            setState((prev) => ({
                ...prev,
                error: errorMessage,
                isLoading: false,
                uploadProgress: 0,
            }));
            return "";
        }
    }, []);
    const loadSession = useCallback(async (sessionId) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await fetch(`${API_BASE_URL}/diagnosis/sessions`, {
                headers: {
                    "x-user-id": userIdRef.current,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to load session");
            }
            const session = await response.json();
            setState((prev) => ({
                ...prev,
                session,
                isLoading: false,
            }));
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load session";
            setState((prev) => ({
                ...prev,
                error: errorMessage,
                isLoading: false,
            }));
        }
    }, []);
    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);
    const actions = {
        initializeSession,
        sendMessage,
        uploadPhoto,
        loadSession,
        clearError,
    };
    return [state, actions];
}
function formatDiagnosisForDisplay(diagnosis) {
    const parts = [
        `${diagnosis.condition} (${diagnosis.confidence}% confidence)`,
        `Severity: ${diagnosis.severity}`,
        `\n${diagnosis.description}`,
    ];
    if (diagnosis.treatment && diagnosis.treatment.length > 0) {
        parts.push("\nTreatment:");
        parts.push(diagnosis.treatment.map((t) => `• ${t}`).join("\n"));
    }
    return parts.join("\n");
}
//# sourceMappingURL=useDiagnosis.js.map