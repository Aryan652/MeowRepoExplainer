import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="px-6 py-28">
      <div className="relative mx-auto max-w-5xl glass-strong rounded-3xl p-12 md:p-16 text-center overflow-hidden ring-glow">
        <div className="absolute inset-0 -z-10 aurora opacity-60" />
        <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-gradient">
          Make every repo readable.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Onboard faster. Document automatically. Ship with confidence.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="#try" className="btn-primary rounded-full px-6 py-3 text-sm font-medium inline-flex items-center gap-2">
            Start free <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#" className="glass rounded-full px-6 py-3 text-sm font-medium hover:text-foreground">
            Talk to the team
          </a>
        </div>
      </div>
    </section>
  );
}
