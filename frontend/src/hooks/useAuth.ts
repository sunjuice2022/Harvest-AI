/** Shared auth state hook — UI-only mock, persists session in localStorage. */

import { useState, useCallback } from 'react';

export interface AuthUser {
  name: string;
  email: string;
}

const STORAGE_KEY = 'harvest_ai_user';

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);

  const signIn = useCallback(async (email: string, _password: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 800));
    const name = email.split('@')[0]?.replace(/[._]/g, ' ') ?? 'Farmer';
    const formatted = name.charAt(0).toUpperCase() + name.slice(1);
    const authUser: AuthUser = { name: formatted, email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const signUp = useCallback(async (name: string, email: string, _password: string): Promise<void> => {
    await new Promise((r) => setTimeout(r, 800));
    const authUser: AuthUser = { name, email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, signIn, signUp, signOut };
}
