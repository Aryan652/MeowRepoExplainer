import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileText, BookOpen, Map, Network } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRepoDocs } from "@/lib/api/docs";

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
  
  const { data: docs, isLoading } = useQuery({
    queryKey: ["repo-docs", repoId],
    queryFn: () => getRepoDocs({ data: { repoId } }),
  });
  
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
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">
            {activeDoc?.title || docTypes.find((d) => d.id === active)?.title || "Documentation"}
          </h2>
          <button className="glass rounded-full px-3 py-1.5 text-xs inline-flex items-center gap-2 hover:bg-white/[0.08]">
            <Download className="h-3.5 w-3.5" /> Export .md
          </button>
        </div>
        {activeDoc ? (
          <pre className="mt-5 whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/90 glass rounded-2xl p-5 overflow-auto">
{activeDoc.content}
          </pre>
        ) : (
          <div className="mt-5 text-center text-muted-foreground glass rounded-2xl p-10">
            <p>No documentation available for this section.</p>
            <p className="text-xs mt-2">Documentation will be generated during repository analysis.</p>
          </div>
        )}
      </article>
    </div>
  );
}
