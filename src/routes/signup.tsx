import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Github, Mail, Lock, User, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — RepoMind AI" },
      { name: "description", content: "Create your RepoMind AI account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signup, loginWithGithub, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signup(name, email, password);
      navigate({ to: "/dashboard" });
    } catch {
      setError("Could not create account. Please try again.");
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
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start understanding code in minutes.
        </p>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleGithub}
          disabled={busy}
          className="mt-6 glass w-full rounded-xl py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-white/[0.08] disabled:opacity-60 transition-all"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Github className="h-4 w-4" />
          )}
          Continue with GitHub
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-white/10" /> or{" "}
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form className="space-y-4" onSubmit={handleSignup}>
          <label className="block">
            <span className="text-xs text-muted-foreground">Name</span>
            <div className="mt-1 glass rounded-xl flex items-center gap-2 px-3 focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                id="signup-name"
                required
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm focus:outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs text-muted-foreground">Work email</span>
            <div className="mt-1 glass rounded-xl flex items-center gap-2 px-3 focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                id="signup-email"
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
            <span className="text-xs text-muted-foreground">
              Password{" "}
              <span className="text-muted-foreground/60">(min 8 chars)</span>
            </span>
            <div className="mt-1 glass rounded-xl flex items-center gap-2 px-3 focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                id="signup-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm focus:outline-none"
              />
            </div>
          </label>

          <button
            id="signup-submit"
            type="submit"
            disabled={busy}
            className="btn-primary w-full rounded-xl py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
