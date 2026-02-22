/**
 * Frontend API client - handles all backend API calls
 */

const API_BASE_URL = ((import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000/api").replace(/\/$/, '');

function getUserId(): string {
  try {
    const raw = localStorage.getItem('harvest_ai_user');
    const user = raw ? JSON.parse(raw) as { email?: string } : null;
    return user?.email ?? 'anonymous';
  } catch { return 'anonymous'; }
}

export const apiClient = {
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": getUserId(),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  },

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { "x-user-id": getUserId() },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  },
};
