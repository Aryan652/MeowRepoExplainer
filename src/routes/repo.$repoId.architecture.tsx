import { createFileRoute, useParams } from "@tanstack/react-router";
import { Maximize2, Filter, Download, Loader2 } from "lucide-react";
import { useRepoArchitecture } from "@/hooks/useRepos";

export const Route = createFileRoute("/repo/$repoId/architecture")({
  component: ArchitecturePage,
});

function ArchitecturePage() {
  const { repoId } = useParams({ from: "/repo/$repoId" });
  const { data: arch, isLoading, isError } = useRepoArchitecture(repoId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mb-4" />
        <p>Loading architecture graph...</p>
      </div>
    );
  }

  if (isError || !arch) {
    return (
      <div className="py-20 text-center text-red-300">
        Failed to load architecture graph.
      </div>
    );
  }

  const find = (id: string) => arch.nodes.find((n) => n.id === id)!;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div className="glass-strong rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Module dependency graph</h2>
          <div className="flex gap-2">
            <button className="glass rounded-full px-3 py-1.5 text-xs inline-flex items-center gap-1.5"><Filter className="h-3 w-3" /> Filter</button>
            <button className="glass rounded-full px-3 py-1.5 text-xs inline-flex items-center gap-1.5"><Download className="h-3 w-3" /> Export</button>
            <button className="glass rounded-full px-3 py-1.5 text-xs inline-flex items-center gap-1.5"><Maximize2 className="h-3 w-3" /> Fullscreen</button>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: "radial-gradient(ellipse at center, oklch(0.2 0.03 265 / 0.5), oklch(0.14 0.02 270 / 0.5))" }}>
          <svg viewBox="0 0 800 300" className="w-full h-[420px]">
            <defs>
              <linearGradient id="edge" x1="0" x2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.16 245)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="oklch(0.72 0.18 305)" stopOpacity="0.7" />
              </linearGradient>
              <radialGradient id="node">
                <stop offset="0%" stopColor="oklch(0.3 0.04 265)" />
                <stop offset="100%" stopColor="oklch(0.18 0.02 265)" />
              </radialGradient>
            </defs>
            {arch.edges.map(([a, b], i) => {
              const A = find(a);
              const B = find(b);
              if (!A || !B) return null;
              return (
                <line key={i} x1={A.x + 60} y1={A.y + 20} x2={B.x + 60} y2={B.y + 20}
                      stroke="url(#edge)" strokeWidth="1.5" />
              );
            })}
            {arch.nodes.map((n) => (
              <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
                <rect width="120" height="40" rx="12" fill="url(#node)" stroke={(n as any).color === "primary" ? "oklch(0.78 0.16 245)" : (n as any).color === "accent" ? "oklch(0.72 0.18 305)" : "oklch(1 0 0 / 0.15)"} strokeWidth="1.5" />
                <text x="60" y="25" textAnchor="middle" fill="white" fontSize="12" fontFamily="ui-sans-serif">{n.label}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <aside className="glass-strong rounded-3xl p-5">
        <h3 className="font-display text-sm font-semibold">Layers</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {arch.layers.map((l) => (
            <li key={l.name} className="glass rounded-xl px-3 py-2 flex items-center justify-between">
              <span>{l.name}</span>
              <span className="text-xs text-muted-foreground">{l.count}</span>
            </li>
          ))}
        </ul>
        <h3 className="mt-6 font-display text-sm font-semibold">Hot paths</h3>
        <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
          {arch.hotPaths.map((path, i) => (
            <li key={i}>{path}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
