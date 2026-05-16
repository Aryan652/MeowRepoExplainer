import { createFileRoute } from "@tanstack/react-router";
import { AgentsSection, agents } from "@/components/site/AgentsSection";
import { CTA } from "@/components/site/CTA";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agents — RepoMind AI" },
      { name: "description", content: "Five specialised AI agents that document, secure, refactor, test and map your codebase." },
      { property: "og:title", content: "RepoMind AI · Agents" },
      { property: "og:description", content: "Documentation, Security, Refactor, Testing and Architecture agents." },
    ],
  }),
  component: AgentsPage,
});

function AgentsPage() {
  return (
    <div className="pt-32">
      <header className="px-6 text-center max-w-3xl mx-auto">
        <p className="text-sm uppercase tracking-[0.2em] text-accent/80">The crew</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl font-semibold tracking-tight text-gradient">
          Meet the agents.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Each one is sharp at one thing. Together they think in parallel.
        </p>
      </header>
      <AgentsSection />
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-4xl glass-strong rounded-3xl p-8">
          <h2 className="font-display text-2xl font-semibold">How orchestration works</h2>
          <ol className="mt-6 space-y-4 text-sm text-muted-foreground">
            {agents.map((a, i) => (
              <li key={a.name} className="flex gap-4">
                <span className="font-mono text-primary">0{i + 1}</span>
                <span><span className="text-foreground font-medium">{a.name}</span> — {a.desc}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <CTA />
    </div>
  );
}
