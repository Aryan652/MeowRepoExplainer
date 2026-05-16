import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Aurora } from "@/components/site/Aurora";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong rounded-3xl p-10 max-w-md text-center">
        <h1 className="font-display text-7xl font-semibold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">That route drifted into the aurora.</p>
        <div className="mt-6">
          <Link to="/" className="btn-primary rounded-full px-5 py-2 text-sm font-medium">Go home</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong rounded-3xl p-10 max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold">Something glitched</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again, or head home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="btn-primary rounded-full px-5 py-2 text-sm font-medium"
          >Retry</button>
          <a href="/" className="glass rounded-full px-5 py-2 text-sm font-medium">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RepoMind AI — Understand any codebase in minutes" },
      { name: "description", content: "RepoMind AI ingests your repository and lets you converse with it. Auto docs, architecture maps, and tech-debt insights powered by multi-agent AI." },
      { property: "og:title", content: "RepoMind AI — Understand any codebase in minutes" },
      { property: "og:description", content: "RepoMind AI ingests your repository and lets you converse with it. Auto docs, architecture maps, and tech-debt insights powered by multi-agent AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "RepoMind AI — Understand any codebase in minutes" },
      { name: "twitter:description", content: "RepoMind AI ingests your repository and lets you converse with it. Auto docs, architecture maps, and tech-debt insights powered by multi-agent AI." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/70d48473-8021-4018-a7e9-349aa5f128ef/id-preview-603c4e70--4244c96e-68aa-4f09-9663-29bc4330c81d.lovable.app-1778901522797.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/70d48473-8021-4018-a7e9-349aa5f128ef/id-preview-603c4e70--4244c96e-68aa-4f09-9663-29bc4330c81d.lovable.app-1778901522797.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Aurora />
      <Nav />
      <main className="relative">
        <Outlet />
      </main>
      <Footer />
    </QueryClientProvider>
  );
}
