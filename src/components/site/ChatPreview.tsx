export function ChatPreview() {
  return (
    <section className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-2 items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-accent/80">Chat with your repo</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight text-gradient">
            Ground-truth answers, every time.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every response cites the exact file and line. Follow-ups keep context. When the answer
            isn't in your code, RepoMind says so.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {["Cited file paths & line numbers", "Conversational follow-ups", "Confidence indicators", "Saved query templates"].map((t) => (
              <li key={t} className="flex items-center gap-3 text-foreground/90">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-strong rounded-3xl p-5 ring-glow">
          <div className="flex items-center gap-2 px-2 pb-3 border-b border-white/10">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
            <span className="ml-3 text-xs text-muted-foreground">repomind · stripe-payments</span>
          </div>
          <div className="space-y-4 pt-4 text-sm">
            <div className="flex justify-end">
              <div className="glass rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%]">
                How does the authentication flow work?
              </div>
            </div>
            <div className="flex">
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%]" style={{ background: "var(--gradient-primary)", color: "var(--primary-foreground)" }}>
                Requests hit <code className="font-mono text-xs bg-black/20 px-1 rounded">middleware/auth.ts</code> which verifies a JWT via <code className="font-mono text-xs bg-black/20 px-1 rounded">services/jwt.ts:42</code>, then attaches the user to <code className="font-mono text-xs bg-black/20 px-1 rounded">ctx.user</code>.
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {["middleware/auth.ts", "services/jwt.ts:42", "routes/login.ts:18"].map((c) => (
                <span key={c} className="glass text-xs px-2.5 py-1 rounded-full font-mono text-muted-foreground">{c}</span>
              ))}
            </div>
            <div className="flex justify-end">
              <div className="glass rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%]">
                What breaks if I change the JWT signature?
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
              </span>
              Searching 412 files…
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
