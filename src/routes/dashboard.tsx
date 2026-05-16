import { createFileRoute, Link } from "@tanstack/react-router";
import { Github, Plus, Search, Star, Activity, FileCode, Clock } from "lucide-react";
import { repos } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — RepoMind AI" },
      { name: "description", content: "Your analyzed repositories." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="pt-32 pb-20 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary/80">Workspace</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold tracking-tight text-gradient">
              Your repositories
            </h1>
            <p className="mt-2 text-muted-foreground">{repos.length} analyzed · last activity 2 hours ago</p>
          </div>
          <Link
            to="/analyze"
            className="btn-primary rounded-full px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Analyze repository
          </Link>
        </div>

        <div className="mt-8 glass rounded-2xl flex items-center gap-2 px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search repositories…" className="w-full bg-transparent py-3 text-sm focus:outline-none" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {repos.map((r) => (
            <Link
              key={r.id}
              to="/repo/$repoId"
              params={{ repoId: r.id }}
              className="glass rounded-2xl p-6 group transition-all hover:-translate-y-0.5 hover:bg-white/[0.08]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl glass inline-flex items-center justify-center">
                    <Github className="h-5 w-5 text-foreground/80" />
                  </div>
                  <div>
                    <p className="font-display font-semibold">{r.org}/{r.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" /> {r.stars}</span>
                      <span>·</span>
                      <span>{r.language}</span>
                    </p>
                  </div>
                </div>
                <StatusPill status={r.status} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{r.description}</p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
                <Metric icon={Activity} label="Health" value={`${r.health}%`} />
                <Metric icon={FileCode} label="Files" value={`${r.files}`} />
                <Metric icon={Clock} label="Updated" value={r.lastAnalyzed} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: "ready" | "analyzing" | "error" }) {
  const map = {
    ready: { label: "Ready", color: "bg-emerald-400" },
    analyzing: { label: "Analyzing", color: "bg-amber-400 animate-pulse" },
    error: { label: "Error", color: "bg-red-400" },
  } as const;
  const s = map[status];
  return (
    <span className="glass text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${s.color}`} /> {s.label}
    </span>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="glass rounded-xl px-3 py-2">
      <div className="flex items-center gap-1.5 text-muted-foreground"><Icon className="h-3 w-3" /> {label}</div>
      <div className="mt-1 font-display text-sm text-foreground">{value}</div>
    </div>
  );
}
