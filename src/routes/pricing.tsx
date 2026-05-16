import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { CTA } from "@/components/site/CTA";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — RepoMind AI" },
      { name: "description", content: "Simple plans for individual developers, teams, and enterprises." },
      { property: "og:title", content: "RepoMind AI · Pricing" },
      { property: "og:description", content: "Free for OSS. Scales with your team." },
    ],
  }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Explorer",
    price: "Free",
    blurb: "For OSS and personal repos.",
    features: ["3 repositories", "Up to 100 MB each", "Chat & auto docs", "Community support"],
  },
  {
    name: "Team",
    price: "$29",
    suffix: "/seat · month",
    blurb: "For working teams.",
    features: ["Unlimited repositories", "Up to 500 MB each", "All 5 agents", "Architecture exports", "Priority support"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    blurb: "For organizations.",
    features: ["Self-hosted option", "SSO + audit logs", "Dedicated agents", "SLA & onboarding"],
  },
];

function PricingPage() {
  return (
    <div className="pt-32 pb-12">
      <header className="px-6 text-center max-w-3xl mx-auto">
        <p className="text-sm uppercase tracking-[0.2em] text-primary/80">Pricing</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl font-semibold tracking-tight text-gradient">
          Simple, transparent.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Free for open-source. Scales naturally with your team.
        </p>
      </header>

      <section className="px-6 mt-16">
        <div className="mx-auto max-w-6xl grid gap-5 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-3xl p-8 relative ${t.featured ? "glass-strong ring-glow" : "glass"}`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
                  Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-semibold">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold text-gradient">{t.price}</span>
                {t.suffix && <span className="text-xs text-muted-foreground">{t.suffix}</span>}
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
              <button className={`mt-8 w-full rounded-full py-2.5 text-sm font-medium ${t.featured ? "btn-primary" : "glass"}`}>
                {t.name === "Enterprise" ? "Contact sales" : "Get started"}
              </button>
            </div>
          ))}
        </div>
      </section>
      <div className="mt-16">
        <CTA />
      </div>
    </div>
  );
}
