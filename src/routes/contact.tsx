import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — RepoMind AI" },
      { name: "description", content: "Get in touch with the RepoMind AI team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="pt-32 pb-20 px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-primary/80">Contact</p>
        <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight text-gradient">Talk to us.</h1>
        <p className="mt-3 text-muted-foreground">For partnerships, enterprise pilots, or feedback.</p>
      </div>
      <form className="mx-auto mt-12 max-w-xl glass-strong rounded-3xl p-8 space-y-4">
        <label className="block">
          <span className="text-xs text-muted-foreground">Name</span>
          <input className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Email</span>
          <input type="email" className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Message</span>
          <textarea rows={5} className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none" />
        </label>
        <button type="button" className="btn-primary w-full rounded-xl py-2.5 text-sm font-medium">Send message</button>
        <p className="text-center text-xs text-muted-foreground">
          Or jump straight in — <Link to="/signup" className="underline text-foreground">create an account</Link>.
        </p>
      </form>
    </div>
  );
}
