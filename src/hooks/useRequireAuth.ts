/**
 * useRequireAuth — Route guard hook.
 *
 * Call this at the top of any protected page component.
 * If the user is not authenticated, it redirects to /login
 * and returns `false`. Returns `true` when auth is confirmed.
 */

import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export function useRequireAuth(): boolean {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  return !loading && !!user;
}
