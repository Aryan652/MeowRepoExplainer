import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-12 grid gap-8 md:grid-cols-4 text-sm">
        <div className="md:col-span-2">
          <p className="font-display text-xl font-semibold text-gradient">RepoMind AI</p>
          <p className="mt-3 max-w-sm text-muted-foreground">
            Understand any repository in minutes. Powered by multi-agent AI and grounded retrieval.
          </p>
        </div>
        <div>
          <p className="font-medium text-foreground/90">Product</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
            <li><Link to="/agents" className="hover:text-foreground">Agents</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-foreground/90">Company</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Sign in</Link></li>
            <li><Link to="/settings" className="hover:text-foreground">Settings</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-6 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
        <span>© 2026 RepoMind AI</span>
        <span>Crafted with intent.</span>
      </div>
    </footer>
  );
}
