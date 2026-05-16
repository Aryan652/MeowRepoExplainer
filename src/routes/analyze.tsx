import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Github, Upload, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCreateRepo } from "@/hooks/useRepos";
import { useStartAnalysis, useAnalysisProgress } from "@/hooks/useAnalysis";

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
  { id: "cloning", label: "Cloning repository" },
  { id: "language_detection", label: "Detecting languages & frameworks" },
  { id: "ast_parsing", label: "Parsing AST & extracting symbols" },
  { id: "embeddings", label: "Computing embeddings" },
  { id: "agents", label: "Running multi-agent analysis" },
  { id: "completed", label: "Completed" },
] as const;

function AnalyzePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [url, setUrl] = useState("https://github.com/acme/stripe-payments");
  const [jobId, setJobId] = useState<string | null>(null);
  const [repoId, setRepoId] = useState<string | null>(null);

  const createRepo = useCreateRepo();
  const startAnalysis = useStartAnalysis();
  const { data: progressData } = useAnalysisProgress(jobId);

  const running = createRepo.isPending || startAnalysis.isPending || !!jobId;

  const handleAnalyze = async () => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    try {
      // Parse URL nicely (super naive for demo)
      const parts = url.replace("https://github.com/", "").split("/");
      const org = parts[0] || "unknown";
      const name = parts[1] || "repo";

      // 1. Create Repo in DB
      const { id: newRepoId } = await createRepo.mutateAsync({
        userId: user.id,
        org,
        name,
        githubUrl: url,
      });

      setRepoId(newRepoId);

      // 2. Start Analysis Job
      const { jobId: newJobId } = await startAnalysis.mutateAsync({
        repoId: newRepoId,
      });

      setJobId(newJobId);
    } catch (err) {
      console.error(err);
      alert("Failed to start analysis");
    }
  };

  // Redirect on completion
  useEffect(() => {
    if (progressData?.step === "completed" && repoId) {
      const t = setTimeout(() => {
        navigate({ to: "/repo/$repoId", params: { repoId } });
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [progressData?.step, repoId, navigate]);

  const currentStepId = progressData?.step || "cloning";
  const currentStepIndex = steps.findIndex((s) => s.id === currentStepId);

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
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full bg-transparent py-3 text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={running || !url}
            className="btn-primary rounded-2xl px-5 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {running ? "Analyzing…" : "Analyze"}
          </button>
        </div>

        <div className="mt-4 glass rounded-2xl p-6 text-center text-sm text-muted-foreground border-dashed">
          <Upload className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
          Drop a .zip here or <span className="text-foreground underline cursor-pointer">browse</span>
        </div>

        {running && (
          <div className="mt-10 glass-strong rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold">Analysis in progress</h2>
              {progressData && (
                <span className="text-sm font-medium text-primary">{progressData.progress}%</span>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-8">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${progressData?.progress || 0}%`,
                  background: "var(--gradient-primary)"
                }}
              />
            </div>

            <ul className="space-y-4">
              {steps.filter(s => s.id !== "completed").map((s, i) => {
                const done = i < currentStepIndex || currentStepId === "completed";
                const active = i === currentStepIndex && currentStepId !== "completed";
                return (
                  <li key={s.id} className="flex items-center gap-3 text-sm">
                    <span className={`h-6 w-6 rounded-full inline-flex items-center justify-center ${done ? "bg-primary text-primary-foreground" : active ? "glass" : "glass opacity-50"}`}>
                      {done ? <Check className="h-3.5 w-3.5" /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />}
                    </span>
                    <span className={done ? "text-foreground" : active ? "text-foreground" : "text-muted-foreground"}>{s.label}</span>
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
