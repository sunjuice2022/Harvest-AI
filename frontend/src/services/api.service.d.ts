/**
 * Frontend API client - handles all backend API calls
 */
export declare const apiClient: {
    post<T>(endpoint: string, data: unknown): Promise<T>;
    get<T>(endpoint: string): Promise<T>;
};
//# sourceMappingURL=api.service.d.ts.map