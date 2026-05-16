import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileText, BookOpen, Map, Network, RefreshCw, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRepoDocs, generateRepoDocs, getDocsGenerationStatus } from "@/lib/api/docs";
import { toast } from "sonner";

export const Route = createFileRoute("/repo/$repoId/docs")({
  component: DocsPage,
});

const docTypes = [
  { id: "readme", icon: FileText, title: "README.md", desc: "Project overview, install, and usage." },
  { id: "api", icon: Network, title: "API Reference", desc: "All HTTP endpoints with parameters." },
  { id: "onboarding", icon: BookOpen, title: "Onboarding Guide", desc: "Get a new dev productive in a day." },
  { id: "architecture", icon: Map, title: "Architecture Notes", desc: "Layers, components, data flow." },
];

function DocsPage() {
  const { repoId } = useParams({ from: "/repo/$repoId/docs" });
  const [active, setActive] = useState("readme");
  const queryClient = useQueryClient();
  
  const { data: docs, isLoading } = useQuery({
    queryKey: ["repo-docs", repoId],
    queryFn: () => getRepoDocs({ data: { repoId } }),
    refetchInterval: (query) => {
      // Poll every 3 seconds if any doc is still generating
      const data = query.state.data;
      const hasGenerating = data?.some((d: any) => d.content?.includes("⏳ Generating"));
      return hasGenerating ? 3000 : false;
    },
  });

  const { data: status } = useQuery({
    queryKey: ["repo-docs-status", repoId],
    queryFn: () => getDocsGenerationStatus({ data: { repoId } }),
    refetchInterval: 5000, // Check status every 5 seconds
  });

  const generateMutation = useMutation({
    mutationFn: () => generateRepoDocs({ data: { repoId } }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Documentation generation started! This may take a few minutes.");
        queryClient.invalidateQueries({ queryKey: ["repo-docs", repoId] });
        queryClient.invalidateQueries({ queryKey: ["repo-docs-status", repoId] });
      } else {
        toast.error(result.message || "Failed to start documentation generation");
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });

  const handleGenerate = () => {
    if (status?.status === "generating") {
      toast.info("Documentation is already being generated");
      return;
    }
    generateMutation.mutate();
  };
  
  if (isLoading) {
    return <div className="text-center text-muted-foreground">Loading documentation...</div>;
  }
  
  const docsMap = docs?.reduce((acc, doc) => {
    acc[doc.docType] = doc;
    return acc;
  }, {} as Record<string, any>) || {};
  
  const activeDoc = docsMap[active];
  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <aside className="glass-strong rounded-3xl p-3 h-fit">
        {docTypes.map((d) => (
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">
            {activeDoc?.title || docTypes.find((d) => d.id === active)?.title || "Documentation"}
          </h2>
          <div className="flex items-center gap-2">
            {status?.status === "generating" && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </span>
            )}
            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || status?.status === "generating"}
              className="glass rounded-full px-3 py-1.5 text-xs inline-flex items-center gap-2 hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {status?.status === "generating" ? "Generating..." : "Generate Docs"}
            </button>
            <button className="glass rounded-full px-3 py-1.5 text-xs inline-flex items-center gap-2 hover:bg-white/[0.08]">
              <Download className="h-3.5 w-3.5" /> Export .md
            </button>
          </div>
        </div>
        {activeDoc ? (
          <div className="mt-5">
            {activeDoc.content.includes("⏳ Generating") ? (
              <div className="glass rounded-2xl p-10 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                <p className="text-muted-foreground">Generating documentation...</p>
                <p className="text-xs text-muted-foreground mt-2">This may take a few minutes</p>
              </div>
            ) : activeDoc.content.includes("❌") ? (
              <div className="glass rounded-2xl p-10 text-center">
                <p className="text-red-400 mb-2">Documentation generation failed</p>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{activeDoc.content}</pre>
                <button
                  onClick={handleGenerate}
                  className="mt-4 glass rounded-full px-4 py-2 text-sm inline-flex items-center gap-2 hover:bg-white/[0.08]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry Generation
                </button>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/90 glass rounded-2xl p-5 overflow-auto max-h-[600px]">
{activeDoc.content}
              </pre>
            )}
          </div>
        ) : (
          <div className="mt-5 text-center text-muted-foreground glass rounded-2xl p-10">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="mb-2">No documentation available for this section.</p>
            <p className="text-xs mb-4">Click "Generate Docs" to create AI-powered documentation.</p>
            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="glass rounded-full px-4 py-2 text-sm inline-flex items-center gap-2 hover:bg-white/[0.08] disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              Generate Documentation
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
