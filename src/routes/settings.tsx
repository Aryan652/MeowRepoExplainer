import { createFileRoute } from "@tanstack/react-router";
import { User, Bell, Key, Trash2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — RepoMind AI" },
      { name: "description", content: "Manage your RepoMind AI account and preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="pt-32 pb-20 px-6">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-primary/80">Settings</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-gradient">Account</h1>

        <div className="mt-10 space-y-5">
          <Section icon={User} title="Profile">
            <Field label="Name" defaultValue="Priya Sharma" />
            <Field label="Email" defaultValue="priya@acme.dev" type="email" />
          </Section>

          <Section icon={Key} title="API & integrations">
            <Field label="GitHub access token" defaultValue="ghp_••••••••••••••••" />
            <Field label="OpenAI / IBM model key" defaultValue="sk-••••••••••••••••" />
          </Section>

          <Section icon={Bell} title="Notifications">
            <Toggle label="Email me when analysis completes" defaultChecked />
            <Toggle label="Weekly tech-debt digest" defaultChecked />
            <Toggle label="Security agent alerts" />
          </Section>

          <div className="glass-strong rounded-3xl p-6 border border-red-500/20">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2 text-red-300">
              <Trash2 className="h-4 w-4" /> Danger zone
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Permanently delete your account and all associated repositories.</p>
            <button className="mt-4 rounded-full px-4 py-2 text-sm font-medium border border-red-500/30 text-red-300 hover:bg-red-500/10">
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <section className="glass-strong rounded-3xl p-6">
      <h2 className="font-display text-lg font-semibold flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h2>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input type={type} defaultValue={defaultValue} className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
    </label>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between gap-3 glass rounded-xl px-4 py-3 cursor-pointer">
      <span className="text-sm">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="h-4 w-8 appearance-none rounded-full bg-white/10 checked:bg-primary transition-colors relative cursor-pointer
        before:absolute before:top-0.5 before:left-0.5 before:h-3 before:w-3 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4" />
    </label>
  );
}
