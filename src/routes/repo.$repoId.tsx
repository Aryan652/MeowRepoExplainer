import { createFileRoute, Link, Outlet, useParams } from "@tanstack/react-router";
import { ArrowLeft, MessageSquare, FileText, Network, AlertTriangle, LayoutDashboard } from "lucide-react";
import { getRepo } from "@/lib/mock-data";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export const Route = createFileRoute("/repo/$repoId")({
  component: RepoLayout,
  notFoundComponent: () => (
    <div className="pt-40 text-center">
      <p className="text-muted-foreground">Repository not found.</p>
      <Link to="/dashboard" className="btn-primary inline-block mt-4 rounded-full px-5 py-2 text-sm">Back to dashboard</Link>
    </div>
  ),
});

const tabs = [
  { to: "/repo/$repoId", label: "Overview", icon: LayoutDashboard, exact: true as boolean },
  { to: "/repo/$repoId/chat", label: "Chat", icon: MessageSquare, exact: false as boolean },
  { to: "/repo/$repoId/docs", label: "Docs", icon: FileText, exact: false as boolean },
  { to: "/repo/$repoId/architecture", label: "Architecture", icon: Network, exact: false as boolean },
  { to: "/repo/$repoId/debt", label: "Tech debt", icon: AlertTriangle, exact: false as boolean },
] as const;

function RepoLayout() {
  const authed = useRequireAuth();
  const { repoId } = useParams({ from: "/repo/$repoId" });
  const repo = getRepo(repoId);

  if (!authed) return null;

  return (
    <div className="pt-28 pb-20 px-6">
      <div className="mx-auto max-w-6xl">
        <Link to="/dashboard" className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> All repositories
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-gradient">
              {repo ? `${repo.org}/${repo.name}` : repoId}
            </h1>
            {repo && (
              <p className="mt-1 text-sm text-muted-foreground">
                {repo.language} · {repo.files} files · {repo.size} · last analyzed {repo.lastAnalyzed}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 glass rounded-full p-1 inline-flex flex-wrap gap-1">
          {tabs.map((t) => (
            <Link
              key={t.label}
              to={t.to}
              params={{ repoId }}
              activeOptions={{ exact: t.exact }}
              className="px-4 py-1.5 rounded-full text-sm text-muted-foreground inline-flex items-center gap-2 hover:text-foreground transition-colors"
              activeProps={{ className: "px-4 py-1.5 rounded-full text-sm text-primary-foreground inline-flex items-center gap-2", style: { background: "var(--gradient-primary)" } }}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
