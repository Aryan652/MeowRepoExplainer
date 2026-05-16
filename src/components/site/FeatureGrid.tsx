import { MessageSquare, FileText, Network, AlertTriangle, ShieldCheck, Workflow } from "lucide-react";

const features = [
  { icon: MessageSquare, title: "Conversational Q&A", body: "Ask plain-English questions. Get cited answers tied to real files and lines." },
  { icon: FileText, title: "Auto Documentation", body: "READMEs, API references, and onboarding guides — generated and editable." },
  { icon: Network, title: "Architecture Maps", body: "Interactive dependency graphs and request flows for any service." },
  { icon: AlertTriangle, title: "Tech-Debt Radar", body: "Dead code, cycles, duplication, and untested modules surfaced & ranked." },
  { icon: ShieldCheck, title: "Security Insights", body: "Hardcoded secrets, insecure patterns, and exposed endpoints flagged." },
  { icon: Workflow, title: "Multi-Agent Engine", body: "Specialised agents collaborate on docs, refactors, tests and architecture." },
];

export function FeatureGrid() {
  return (
    <section id="how" className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-primary/80">Capabilities</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight text-gradient">
            Everything you need to make sense of code.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Six tightly-integrated surfaces, one grounded retrieval layer. No hallucinations — just citations.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group glass rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.08]"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl glass">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
