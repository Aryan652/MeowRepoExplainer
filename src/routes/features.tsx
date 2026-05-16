import { createFileRoute } from "@tanstack/react-router";
import { FeatureGrid } from "@/components/site/FeatureGrid";
import { ChatPreview } from "@/components/site/ChatPreview";
import { CTA } from "@/components/site/CTA";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — RepoMind AI" },
      { name: "description", content: "Explore RepoMind AI capabilities: chat, auto docs, architecture maps and tech-debt analysis." },
      { property: "og:title", content: "RepoMind AI · Features" },
      { property: "og:description", content: "Six surfaces, one grounded retrieval layer." },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  return (
    <div className="pt-32">
      <header className="px-6 text-center max-w-3xl mx-auto">
        <p className="text-sm uppercase tracking-[0.2em] text-primary/80">Features</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl font-semibold tracking-tight text-gradient">
          Everything in one canvas.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Designed to feel like a single product, not a stack of tools.
        </p>
      </header>
      <FeatureGrid />
      <ChatPreview />
      <CTA />
    </div>
  );
}
