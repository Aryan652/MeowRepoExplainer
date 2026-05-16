/**
 * auth.tsx — Context-based auth layer for RepoMind AI.
 *
 * This module provides a thin auth context that mirrors the shape of popular
 * auth providers (Supabase, Clerk, Auth0).  To wire up a real backend, replace
 * the `login` / `signup` / `loginWithGithub` implementations with the
 * provider's SDK calls and keep everything else unchanged.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: "email" | "github";
};

export type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = "repomind_user";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored) as AuthUser);
    } catch {
      /* ignore parse errors */
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = (u: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  /**
   * Email / password sign-in.
   * TODO: replace with `supabase.auth.signInWithPassword(...)` or equivalent.
   */
  const login = async (email: string, _password: string) => {
    setLoading(true);
    // Simulate network round-trip
    await delay(600);
    persist({
      id: `user_${Math.random().toString(36).slice(2, 9)}`,
      name: email.split("@")[0],
      email,
      provider: "email",
    });
    setLoading(false);
  };

  /**
   * Email / password sign-up.
   * TODO: replace with `supabase.auth.signUp(...)` or equivalent.
   */
  const signup = async (name: string, email: string, _password: string) => {
    setLoading(true);
    await delay(600);
    persist({
      id: `user_${Math.random().toString(36).slice(2, 9)}`,
      name,
      email,
      provider: "email",
    });
    setLoading(false);
  };

  /**
   * GitHub OAuth.
   * TODO: replace with `supabase.auth.signInWithOAuth({ provider: 'github' })`
   * or redirect to `/api/auth/github` when backend is ready.
   */
  const loginWithGithub = async () => {
    setLoading(true);
    await delay(800);
    persist({
      id: `gh_${Math.random().toString(36).slice(2, 9)}`,
      name: "GitHub User",
      email: "github@user.dev",
      avatarUrl: `https://github.com/ghost.png`,
      provider: "github",
    });
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, loginWithGithub, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
