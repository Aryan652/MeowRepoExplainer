import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Sparkles, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth";

const publicLinks = [
  { to: "/", label: "Overview" },
  { to: "/features", label: "Features" },
  { to: "/agents", label: "Agents" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function Nav() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user?.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[min(96%,980px)]">
      <nav className="glass-strong rounded-full px-3 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 px-3 py-1.5">
          <span
            className="relative inline-flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-display font-semibold tracking-tight text-foreground">
            RepoMind{" "}
            <span className="text-muted-foreground font-normal">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-1 text-sm">
          {publicLinks.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="px-3 py-1.5 rounded-full text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{
                  className:
                    "px-3 py-1.5 rounded-full text-foreground bg-white/5",
                }}
                activeOptions={{ exact: true }}
              >
                {l.label}
              </Link>
            </li>
          ))}
          {user && (
            <li>
              <Link
                to="/dashboard"
                className="px-3 py-1.5 rounded-full text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{
                  className: "px-3 py-1.5 rounded-full text-foreground bg-white/5",
                }}
              >
                App
              </Link>
            </li>
          )}
        </ul>

        {/* Auth actions */}
        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              id="nav-user-menu"
              onClick={() => setMenuOpen((o) => !o)}
              className="glass rounded-full pl-1.5 pr-3 py-1 flex items-center gap-2 text-sm hover:bg-white/[0.08] transition-colors"
            >
              {/* Avatar */}
              <span
                className="h-7 w-7 rounded-full inline-flex items-center justify-center text-xs font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </span>
              <span className="hidden sm:block max-w-[120px] truncate text-foreground">
                {user.name}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 glass-strong rounded-2xl p-2 shadow-lg">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  id="nav-logout"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="btn-primary rounded-full px-4 py-1.5 text-sm font-medium"
            >
              Try free
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
