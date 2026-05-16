# Tech Rules & Stack Definition - RepoMind AI

Defining the technical rules and the technology stack is a foundational step that dictates the tools, frameworks, languages, and platforms to be used throughout the project. This ensures consistency, compatibility, and scalability across the RepoMind AI codebase.

## 1. Frontend & Framework

- **Framework:** TanStack Start (Full-stack React framework).
- **Routing:** TanStack React Router (`@tanstack/react-router`) for type-safe routing.
- **State Management:** TanStack Query (`@tanstack/react-query`) for remote data synchronization and caching.
- **UI Library:** React 19, utilizing customized Radix UI components (`@radix-ui/*`) for accessible primitives.
- **Styling Rules:** Vanilla CSS combined with Tailwind CSS v4. Use predefined utility classes, `clsx`, and `tailwind-merge` for conditional styling. The design language must focus on modern, dynamic aesthetics, incorporating elements like glassmorphism, subtle gradients, and smooth animations.
- **Icons & Visuals:** Lucide React (`lucide-react`) for consistent iconography; Recharts (`recharts`) for data visualization and charts.

## 2. Build & Tooling

- **Package Manager:** Bun (`bunfig.toml`, `bun.lock`). It is strictly required to use Bun for dependency resolution and script execution to ensure reproducibility and fast builds.
- **Bundler:** Vite (`vite.config.ts`, `@vitejs/plugin-react`).
- **Linting & Formatting:** ESLint v9 and Prettier. All new code must adhere to the existing `.prettierrc` and `eslint.config.js` rules.
- **Language:** TypeScript v5. Strict type-checking is enforced across the entire codebase to prevent runtime errors.

## 3. Deployment & Infrastructure

- **Deployment Platform:** Cloudflare Pages/Workers. The application is architected to run at the edge.
- **Configuration:** Maintain Cloudflare-specific configuration and environment variable bindings in `wrangler.jsonc`.
- **Plugin Requirement:** The build process must use `@cloudflare/vite-plugin` for Vite builds targeting Cloudflare environments.
