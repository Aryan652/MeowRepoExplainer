import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Github } from "lucide-react";

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
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-28 pb-20">
      <div className="glass-strong rounded-3xl p-10 w-full max-w-md ring-glow">
        <h1 className="font-display text-3xl font-semibold text-gradient">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Start understanding code in minutes.</p>

        <button className="mt-8 glass w-full rounded-xl py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-white/[0.08]">
          <Github className="h-4 w-4" /> Continue with GitHub
        </button>

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
            <span className="text-xs text-muted-foreground">Name</span>
            <input required className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Work email</span>
            <input type="email" required className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Password</span>
            <input type="password" required className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
          </label>
          <button type="submit" className="btn-primary w-full rounded-xl py-2.5 text-sm font-medium">
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
