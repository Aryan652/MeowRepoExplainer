import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Github, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — RepoMind AI" },
      { name: "description", content: "Sign in to RepoMind AI." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, loginWithGithub, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate({ to: "/dashboard" });
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGithub = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGithub();
      navigate({ to: "/dashboard" });
    } catch {
      setError("GitHub login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || loading;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-28 pb-20">
      <div className="glass-strong rounded-3xl p-10 w-full max-w-md ring-glow">
        <h1 className="font-display text-3xl font-semibold text-gradient">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to continue to RepoMind AI.
        </p>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            onClick={handleGithub}
            disabled={busy}
            className="glass w-full rounded-xl py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-white/[0.08] disabled:opacity-60 transition-all"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Github className="h-4 w-4" />
            )}
            Continue with GitHub
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-white/10" /> or{" "}
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form className="space-y-4" onSubmit={handleEmailLogin}>
          <label className="block">
            <span className="text-xs text-muted-foreground">Email</span>
            <div className="mt-1 glass rounded-xl flex items-center gap-2 px-3 focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                id="login-email"
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm focus:outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs text-muted-foreground">Password</span>
            <div className="mt-1 glass rounded-xl flex items-center gap-2 px-3 focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm focus:outline-none"
              />
            </div>
          </label>

          <button
            id="login-submit"
            type="submit"
            disabled={busy}
            className="btn-primary w-full rounded-xl py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="text-foreground hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
