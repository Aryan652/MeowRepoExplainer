import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "Overview" },
  { to: "/features", label: "Features" },
  { to: "/agents", label: "Agents" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function Nav() {
  return (
    <header className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[min(96%,980px)]">
      <nav className="glass-strong rounded-full px-3 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 px-3 py-1.5">
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "var(--gradient-primary)" }}>
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-display font-semibold tracking-tight text-foreground">
            RepoMind <span className="text-muted-foreground font-normal">AI</span>
          </span>
        </Link>
        <ul className="hidden md:flex items-center gap-1 text-sm">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="px-3 py-1.5 rounded-full text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "px-3 py-1.5 rounded-full text-foreground bg-white/5" }}
                activeOptions={{ exact: true }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          to="/"
          className="btn-primary rounded-full px-4 py-1.5 text-sm font-medium"
        >
          Try free
        </Link>
      </nav>
    </header>
  );
}
