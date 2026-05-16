import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Github, Mail } from "lucide-react";

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
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-28 pb-20">
      <div className="glass-strong rounded-3xl p-10 w-full max-w-md ring-glow">
        <h1 className="font-display text-3xl font-semibold text-gradient">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to continue to RepoMind AI.</p>

        <div className="mt-8 space-y-3">
          <button className="glass w-full rounded-xl py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-white/[0.08]">
            <Github className="h-4 w-4" /> Continue with GitHub
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
        </div>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/dashboard" });
          }}
        >
          <label className="block">
            <span className="text-xs text-muted-foreground">Email</span>
            <div className="mt-1 glass rounded-xl flex items-center gap-2 px-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input type="email" required placeholder="you@company.com" className="w-full bg-transparent py-2.5 text-sm focus:outline-none" />
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Password</span>
            <input type="password" required className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
          </label>
          <button type="submit" className="btn-primary w-full rounded-xl py-2.5 text-sm font-medium">
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="text-foreground hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
