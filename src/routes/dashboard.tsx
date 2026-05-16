import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Github,
  Plus,
  Search,
  Star,
  Activity,
  FileCode,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRepos } from "@/hooks/useRepos";
import type { RepoSummary } from "@/lib/api/repos";

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
  const authed = useRequireAuth();
  const { data: repos, isLoading, isError, refetch } = useRepos();
  const [search, setSearch] = useState("");

  if (!authed) return null;

  const filtered = (repos ?? []).filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.org.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="pt-32 pb-20 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary/80">
              Workspace
            </p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold tracking-tight text-gradient">
              Your repositories
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isLoading
                ? "Loading…"
                : `${repos?.length ?? 0} analyzed · last activity 2 hours ago`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              title="Refresh"
              className="glass rounded-full p-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <Link
              to="/analyze"
              className="btn-primary rounded-full px-5 py-2.5 text-sm font-medium inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Analyze repository
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mt-8 glass rounded-2xl flex items-center gap-2 px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            id="dashboard-search"
            placeholder="Search repositories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent py-3 text-sm focus:outline-none"
          />
        </div>

        {/* States */}
        {isLoading && (
          <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin" />
            <p className="text-sm">Loading repositories…</p>
          </div>
        )}

        {isError && (
          <div className="mt-10 glass rounded-2xl px-6 py-5 flex items-start gap-3 text-red-300 border border-red-500/20">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Could not load repositories</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Check your database connection or{" "}
                <button
                  className="underline hover:text-foreground"
                  onClick={() => refetch()}
                >
                  try again
                </button>
                .
              </p>
            </div>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="mt-16 text-center text-muted-foreground">
            <p className="text-sm">
              {search ? "No repositories match your search." : "No repositories yet."}
            </p>
            {!search && (
              <Link
                to="/analyze"
                className="mt-4 btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
              >
                <Plus className="h-4 w-4" /> Analyze your first repo
              </Link>
            )}
          </div>
        )}

        {/* Repo grid */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {filtered.map((r) => (
              <RepoCard key={r.id} repo={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RepoCard({ repo: r }: { repo: RepoSummary }) {
  return (
    <Link
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
            <p className="font-display font-semibold">
              {r.org}/{r.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3" /> {r.stars}
              </span>
              <span>·</span>
              <span>{r.language}</span>
            </p>
          </div>
        </div>
        <StatusPill status={r.status} />
      </div>
      <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
        {r.description}
      </p>
      <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
        <Metric icon={Activity} label="Health" value={`${r.health}%`} />
        <Metric icon={FileCode} label="Files" value={`${r.files}`} />
        <Metric icon={Clock} label="Updated" value={r.lastAnalyzed} />
      </div>
    </Link>
  );
}

function StatusPill({
  status,
}: {
  status: "ready" | "analyzing" | "error";
}) {
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

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="glass rounded-xl px-3 py-2">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 font-display text-sm text-foreground">{value}</div>
    </div>
  );
}
