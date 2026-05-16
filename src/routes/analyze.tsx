import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Github, Upload, Check, Loader2 } from "lucide-react";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze repository — RepoMind AI" },
      { name: "description", content: "Connect a GitHub repository or upload a ZIP archive to analyze." },
    ],
  }),
  component: AnalyzePage,
});

const steps = [
  "Cloning repository",
  "Detecting languages & frameworks",
  "Parsing AST & extracting symbols",
  "Computing embeddings",
  "Running multi-agent analysis",
];

function AnalyzePage() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!running) return;
    if (step >= steps.length) {
      const t = setTimeout(() => navigate({ to: "/repo/$repoId", params: { repoId: "stripe-payments" } }), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [running, step, navigate]);

  return (
    <div className="pt-32 pb-20 px-6">
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-primary/80">New analysis</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold tracking-tight text-gradient">
            Point us at your code.
          </h1>
          <p className="mt-3 text-muted-foreground">Public GitHub URL or a .zip up to 500 MB.</p>
        </header>

        <div className="mt-12 glass-strong rounded-3xl p-2 flex flex-col sm:flex-row gap-2 ring-glow">
          <div className="flex items-center gap-2 px-4 flex-1">
            <Github className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              defaultValue="https://github.com/acme/stripe-payments"
              className="w-full bg-transparent py-3 text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={() => setRunning(true)}
            disabled={running}
            className="btn-primary rounded-2xl px-5 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {running ? "Analyzing…" : "Analyze"}
          </button>
        </div>

        <div className="mt-4 glass rounded-2xl p-6 text-center text-sm text-muted-foreground border-dashed">
          <Upload className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
          Drop a .zip here or <span className="text-foreground underline">browse</span>
        </div>

        {running && (
          <div className="mt-10 glass-strong rounded-3xl p-8">
            <h2 className="font-display text-lg font-semibold">Analysis in progress</h2>
            <ul className="mt-6 space-y-4">
              {steps.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <li key={s} className="flex items-center gap-3 text-sm">
                    <span className={`h-6 w-6 rounded-full inline-flex items-center justify-center ${done ? "bg-primary text-primary-foreground" : active ? "glass" : "glass opacity-50"}`}>
                      {done ? <Check className="h-3.5 w-3.5" /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />}
                    </span>
                    <span className={done ? "text-foreground" : active ? "text-foreground" : "text-muted-foreground"}>{s}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
