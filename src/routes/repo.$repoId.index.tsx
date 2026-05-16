import { createFileRoute, useParams } from "@tanstack/react-router";
import { Activity, FileCode, FlaskConical, AlertTriangle, GitBranch, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRepoById } from "@/lib/api/repos";

export const Route = createFileRoute("/repo/$repoId/")({
  component: RepoOverview,
});

function RepoOverview() {
  const { repoId } = useParams({ from: "/repo/$repoId/" });
  
  const { data: repo, isLoading } = useQuery({
    queryKey: ["repo", repoId],
    queryFn: () => getRepoById({ data: { id: repoId } }),
  });
  
  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading...</div>;
  }
  
  if (!repo) {
    return <div className="text-center text-muted-foreground">Repository not found</div>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Stat label="Health score" value={`${repo.health}`} suffix="/100" tone="primary" icon={Activity} />
      <Stat label="Tech-debt items" value={`${repo.debt}`} icon={AlertTriangle} />
      <Stat label="Test coverage" value={`${repo.coverage}%`} icon={FlaskConical} />

      <div className="glass-strong rounded-3xl p-6 lg:col-span-2">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Repository summary
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{repo.description}</p>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Built primarily in <span className="text-foreground">{repo.language}</span>. The system follows a layered architecture with clear separation between transport, domain, and persistence. Authentication is JWT-based, with sessions issued at <code className="font-mono text-xs glass px-1.5 py-0.5 rounded">/auth/login</code> and validated by middleware on every request.
        </p>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Languages", value: `${repo.language}, JSON, YAML` },
            { label: "Frameworks", value: "Express, Prisma" },
            { label: "Entry points", value: "src/server.ts" },
            { label: "Branches", value: "main, dev" },
          ].map((m) => (
            <div key={m.label} className="glass rounded-xl p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</div>
              <div className="mt-1 text-sm">{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-strong rounded-3xl p-6">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-accent" /> Recent agent activity
        </h2>
        <ul className="mt-4 space-y-3 text-sm">
          {[
            { who: "Documentation Agent", what: "Generated README v3", when: "2h" },
            { who: "Security Agent", what: "Flagged 2 hardcoded keys", when: "2h" },
            { who: "Architecture Agent", what: "Updated module graph", when: "3h" },
            { who: "Refactor Agent", what: "Detected 4 duplicates", when: "1d" },
          ].map((a) => (
            <li key={a.what} className="flex items-start gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <div className="text-foreground">{a.what}</div>
                <div className="text-xs text-muted-foreground">{a.who} · {a.when} ago</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-strong rounded-3xl p-6 lg:col-span-3">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <FileCode className="h-4 w-4 text-primary" /> Language distribution
        </h2>
        <div className="mt-5 space-y-3">
          {[
            { lang: "TypeScript", pct: 62 },
            { lang: "JSON", pct: 18 },
            { lang: "YAML", pct: 12 },
            { lang: "Markdown", pct: 8 },
          ].map((l) => (
            <div key={l.lang}>
              <div className="flex justify-between text-xs mb-1.5"><span>{l.lang}</span><span className="text-muted-foreground">{l.pct}%</span></div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${l.pct}%`, background: "var(--gradient-primary)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, suffix, tone, icon: Icon }: { label: string; value: string; suffix?: string; tone?: "primary"; icon: typeof Activity }) {
  return (
    <div className="glass-strong rounded-3xl p-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <div className="mt-3 font-display text-4xl font-semibold flex items-baseline gap-1">
        <span className={tone === "primary" ? "text-gradient-primary" : "text-gradient"}>{value}</span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}
