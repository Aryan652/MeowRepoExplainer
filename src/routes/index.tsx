import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { FeatureGrid } from "@/components/site/FeatureGrid";
import { ChatPreview } from "@/components/site/ChatPreview";
import { AgentsSection } from "@/components/site/AgentsSection";
import { CTA } from "@/components/site/CTA";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <Stats />
      <FeatureGrid />
      <ChatPreview />
      <AgentsSection />
      <CTA />
    </>
  );
}
