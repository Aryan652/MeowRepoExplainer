const stats = [
  { value: "60%", label: "Faster onboarding" },
  { value: "<10s", label: "Avg. query latency" },
  { value: "500MB", label: "Repo size supported" },
  { value: "15+", label: "Languages parsed" },
];

export function Stats() {
  return (
    <section className="px-6">
      <div className="mx-auto max-w-6xl glass-strong rounded-3xl px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-display text-3xl md:text-4xl font-semibold text-gradient-primary">{s.value}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
