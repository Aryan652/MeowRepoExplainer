import { ArrowRight, Github, Upload } from "lucide-react";
import heroOrb from "@/assets/hero-orb.jpg";

export function Hero() {
  return (
    <section className="relative pt-40 pb-24 px-6">
      <div className="mx-auto max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Now in private beta · Multi-agent v1
        </div>
        <h1 className="mt-8 font-display text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-gradient">
          Understand any codebase.
          <br />
          <span className="text-gradient-primary">In minutes, not weeks.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          RepoMind AI ingests your repository, builds a semantic map, and lets you converse with it.
          Documentation, architecture, and tech-debt insights — generated automatically.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="#try" className="btn-primary rounded-full px-6 py-3 text-sm font-medium inline-flex items-center gap-2">
            Analyze a repository <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#how" className="glass rounded-full px-6 py-3 text-sm font-medium text-foreground/90 hover:text-foreground transition-colors">
            See how it works
          </a>
        </div>

        {/* Hero visual */}
        <div className="relative mt-20">
          <div className="absolute inset-x-0 -top-10 mx-auto h-40 w-3/4 rounded-full bg-primary/30 blur-[100px]" />
          <div className="glass-strong rounded-3xl overflow-hidden ring-glow">
            <img
              src={heroOrb}
              alt="RepoMind AI visualization of a repository as a glowing neural network"
              width={1600}
              height={1200}
              className="w-full h-auto opacity-95"
            />
          </div>
        </div>

        {/* Repo input card */}
        <div id="try" className="mt-10 glass-strong rounded-2xl p-2 flex flex-col sm:flex-row items-stretch gap-2 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 px-4 flex-1">
            <Github className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="https://github.com/your-org/your-repo"
              className="w-full bg-transparent py-3 text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button className="btn-primary rounded-xl px-5 py-3 text-sm font-medium inline-flex items-center justify-center gap-2">
            <Upload className="h-4 w-4" /> Analyze
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Or drop a .zip up to 500 MB · Python, TypeScript, Go, Java, Rust and more</p>
      </div>
    </section>
  );
}
