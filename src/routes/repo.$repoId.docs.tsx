import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileText, BookOpen, Map, Network } from "lucide-react";

export const Route = createFileRoute("/repo/$repoId/docs")({
  component: DocsPage,
});

const docs = [
  { id: "readme", icon: FileText, title: "README.md", desc: "Project overview, install, and usage." },
  { id: "api", icon: Network, title: "API Reference", desc: "All HTTP endpoints with parameters." },
  { id: "onboarding", icon: BookOpen, title: "Onboarding Guide", desc: "Get a new dev productive in a day." },
  { id: "architecture", icon: Map, title: "Architecture Notes", desc: "Layers, components, data flow." },
];

const sample: Record<string, string> = {
  readme: `# stripe-payments\n\nA payment service handling Stripe checkout, webhooks, and reconciliation.\n\n## Install\n\n\`\`\`bash\nbun install\nbun dev\n\`\`\`\n\n## Architecture\n\n- \`src/server.ts\` — HTTP entry point\n- \`src/routes/\` — REST endpoints\n- \`src/services/\` — business logic\n- \`src/db/\` — Prisma schema & migrations\n`,
  api: `## POST /checkout\nCreate a new Stripe checkout session.\n\n**Body**\n- \`amount\` number — minor units\n- \`currency\` string — ISO 4217\n\n**Returns** \`{ url: string }\`\n\n## POST /webhooks/stripe\nReceives Stripe events. Verifies signature via STRIPE_WEBHOOK_SECRET.\n`,
  onboarding: `# Onboarding\n\n1. Clone repo and copy \`.env.example\` to \`.env\`.\n2. Start Postgres locally with \`docker compose up\`.\n3. Run migrations: \`bun prisma migrate dev\`.\n4. Start dev server: \`bun dev\`.\n5. Hit http://localhost:3000/health to verify.\n`,
  architecture: `# Architecture\n\nLayered: transport → service → repository → db.\nAuth: JWT verified in \`middleware/auth.ts\`.\nWebhooks isolated in \`routes/webhooks/\`.\n`,
};

function DocsPage() {
  const [active, setActive] = useState("readme");
  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <aside className="glass-strong rounded-3xl p-3 h-fit">
        {docs.map((d) => (
          <button
            key={d.id}
            onClick={() => setActive(d.id)}
            className={`w-full text-left rounded-2xl px-3 py-3 flex items-start gap-3 transition-colors ${active === d.id ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"}`}
          >
            <d.icon className={`h-4 w-4 mt-0.5 ${active === d.id ? "text-primary" : "text-muted-foreground"}`} />
            <div>
              <div className="text-sm font-medium">{d.title}</div>
              <div className="text-xs text-muted-foreground">{d.desc}</div>
            </div>
          </button>
        ))}
      </aside>
      <article className="glass-strong rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{docs.find((d) => d.id === active)?.title}</h2>
          <button className="glass rounded-full px-3 py-1.5 text-xs inline-flex items-center gap-2 hover:bg-white/[0.08]">
            <Download className="h-3.5 w-3.5" /> Export .md
          </button>
        </div>
        <pre className="mt-5 whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/90 glass rounded-2xl p-5 overflow-auto">
{sample[active]}
        </pre>
      </article>
    </div>
  );
}
