import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, FileWarning, Repeat, Skull, FlaskConical } from "lucide-react";

export const Route = createFileRoute("/repo/$repoId/debt")({
  component: DebtPage,
});

const items = [
  { sev: "high", icon: Skull, title: "Cyclic import detected", path: "src/services/user.ts ↔ src/services/auth.ts", note: "Refactor shared types into src/types/." },
  { sev: "high", icon: FlaskConical, title: "Untested critical module", path: "src/services/payment.ts", note: "0% coverage on a payment-handling module." },
  { sev: "med", icon: Repeat, title: "Duplicated block (38 lines)", path: "src/utils/format.ts vs src/lib/format.ts", note: "Consolidate into a single utility." },
  { sev: "med", icon: FileWarning, title: "High complexity function", path: "src/services/reconcile.ts:142", note: "Cyclomatic complexity of 21." },
  { sev: "low", icon: AlertTriangle, title: "Dead code: unused export", path: "src/lib/legacy.ts:12", note: "No references found across the repo." },
];

const sevColor: Record<string, string> = {
  high: "text-red-300 bg-red-500/10 border-red-500/30",
  med: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  low: "text-sky-300 bg-sky-500/10 border-sky-500/30",
};

function DebtPage() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-4">
        {[
          { label: "Total items", value: "23" },
          { label: "High severity", value: "5", tone: "red" },
          { label: "Duplicated lines", value: "412" },
          { label: "Untested files", value: "18" },
        ].map((k) => (
          <div key={k.label} className="glass-strong rounded-3xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</div>
            <div className="mt-2 font-display text-3xl font-semibold text-gradient">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-strong rounded-3xl p-6">
        <h2 className="font-display text-lg font-semibold">Prioritized findings</h2>
        <ul className="mt-5 space-y-3">
          {items.map((it) => (
            <li key={it.title} className="glass rounded-2xl p-4 flex items-start gap-4 hover:bg-white/[0.08] transition-colors">
              <div className="h-10 w-10 rounded-xl glass inline-flex items-center justify-center shrink-0">
                <it.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${sevColor[it.sev]}`}>{it.sev}</span>
                  <span className="font-medium text-foreground">{it.title}</span>
                </div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">{it.path}</div>
                <p className="mt-2 text-sm text-muted-foreground">{it.note}</p>
              </div>
              <button className="glass rounded-full px-3 py-1.5 text-xs hover:bg-white/[0.08]">View fix</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
