import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { useSemanticSearch } from "@/hooks/useSearch";

export const Route = createFileRoute("/repo/$repoId/chat")({
  component: ChatPage,
});

type Msg = { role: "user" | "ai"; text: string; cites?: string[] };

const initial: Msg[] = [
  { role: "user", text: "How does the authentication flow work?" },
  {
    role: "ai",
    text: "Requests hit middleware/auth.ts which verifies a JWT via services/jwt.ts:42, then attaches the user to ctx.user before handlers run.",
    cites: ["middleware/auth.ts", "services/jwt.ts:42", "routes/login.ts:18"],
  },
];

const templates = [
  "Explain the authentication flow",
  "Find all unused functions",
  "Where is payment handled?",
  "What breaks if I change UserService?",
];

function ChatPage() {
  const { repoId } = useParams({ from: "/repo/$repoId" });
  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const search = useSemanticSearch();

  const send = async (text: string) => {
    if (!text.trim() || search.isPending) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");

    try {
      const results = await search.mutateAsync({ repoId, query: text, limit: 3 });
      
      const cites = results.map(r => `${r.filePath}${r.functionName ? `:${r.functionName}` : ''}`);
      const aiText = results.length > 0
        ? `Based on the repository context, here are the most relevant code snippets I found for your query. The primary matches are in ${results[0].filePath}.`
        : "I couldn't find any directly relevant code snippets for your query in the current index.";

      setMsgs((m) => [...m, {
        role: "ai",
        text: aiText,
        cites,
      }]);
    } catch (err) {
      console.error(err);
      setMsgs((m) => [...m, { role: "ai", text: "Sorry, I encountered an error searching the repository." }]);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div className="glass-strong rounded-3xl flex flex-col h-[68vh]">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-display font-semibold">Chat with this repo</span>
          <span className="ml-auto text-xs text-muted-foreground">412 files indexed</span>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
              <div
                className={
                  m.role === "user"
                    ? "glass rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] text-sm"
                    : "rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm"
                }
                style={m.role === "ai" ? { background: "var(--gradient-primary)", color: "var(--primary-foreground)" } : undefined}
              >
                <p>{m.text}</p>
                {m.cites && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.cites.map((c) => (
                      <span key={c} className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/20 text-white/90">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <form
          className="p-3 border-t border-white/10 flex gap-2"
          onSubmit={(e) => { e.preventDefault(); send(input); }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this repository…"
            className="flex-1 glass rounded-xl px-4 py-2.5 text-sm focus:outline-none"
          />
          <button disabled={search.isPending} className="btn-primary rounded-xl px-4 py-2.5 text-sm inline-flex items-center gap-2 disabled:opacity-50">
            {search.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
          </button>
        </form>
      </div>

      <aside className="glass-strong rounded-3xl p-5">
        <h3 className="font-display text-sm font-semibold">Templates</h3>
        <div className="mt-3 space-y-2">
          {templates.map((t) => (
            <button
              key={t}
              onClick={() => send(t)}
              className="w-full text-left glass rounded-xl px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
        <h3 className="mt-6 font-display text-sm font-semibold">Confidence</h3>
        <p className="mt-2 text-xs text-muted-foreground">RepoMind only answers from indexed code. When unsure, it tells you.</p>
      </aside>
    </div>
  );
}
