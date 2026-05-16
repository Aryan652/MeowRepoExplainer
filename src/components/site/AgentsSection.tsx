import { BookOpen, Shield, Wrench, FlaskConical, Network } from "lucide-react";

export const agents = [
  { icon: BookOpen, name: "Documentation Agent", desc: "Generates READMEs, API docs, onboarding guides — kept in sync with your code." },
  { icon: Shield, name: "Security Agent", desc: "Detects hardcoded secrets, unsafe patterns, and exposed endpoints." },
  { icon: Wrench, name: "Refactor Agent", desc: "Spots duplication, complexity, and refactor candidates with rationale." },
  { icon: FlaskConical, name: "Testing Agent", desc: "Maps untested modules and proposes targeted test cases." },
  { icon: Network, name: "Architecture Agent", desc: "Builds module graphs, API flows and service maps you can navigate." },
];

export function AgentsSection() {
  return (
    <section className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-primary/80">Multi-agent system</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight text-gradient">
            Five specialists. One shared brain.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Agents run in parallel where they can, in sequence where they must. Trigger any one on demand.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((a, i) => (
            <div
              key={a.name}
              className="glass rounded-2xl p-6 relative overflow-hidden hover:bg-white/[0.08] transition-colors"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl opacity-60" />
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl glass">
                  <a.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">agent_0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{a.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
