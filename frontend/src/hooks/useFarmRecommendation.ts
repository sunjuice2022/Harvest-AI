/**
 * useFarmRecommendation — manages form state and API call for Farm Planning Advisor
 */

import { useState, useCallback } from "react";
import type { FarmRecommendationRequest, FarmRecommendationResponse } from "@agrisense/shared";
import { getCurrentLanguage } from "./useLanguage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface UseFarmRecommendationState {
  result: FarmRecommendationResponse | null;
  isLoading: boolean;
  error: string | null;
}

interface UseFarmRecommendationActions {
  getRecommendations: (request: FarmRecommendationRequest) => Promise<void>;
  clearResult: () => void;
  clearError: () => void;
}

async function fetchRecommendations(
  request: FarmRecommendationRequest,
): Promise<FarmRecommendationResponse> {
  const response = await fetch(`${API_BASE_URL}/farm-recommendation`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-language": getCurrentLanguage() },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Request failed: HTTP ${response.status}`);
  }

  return response.json() as Promise<FarmRecommendationResponse>;
}

export function useFarmRecommendation(): [UseFarmRecommendationState, UseFarmRecommendationActions] {
  const [state, setState] = useState<UseFarmRecommendationState>({
    result: null,
    isLoading: false,
    error: null,
  });

  const getRecommendations = useCallback(async (request: FarmRecommendationRequest) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await fetchRecommendations(request);
      setState({ result, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  }, []);

  const clearResult = useCallback(() => {
    setState((prev) => ({ ...prev, result: null }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return [state, { getRecommendations, clearResult, clearError }];
}
