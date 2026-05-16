export type Repo = {
  id: string;
  name: string;
  org: string;
  stars: string;
  language: string;
  files: number;
  size: string;
  lastAnalyzed: string;
  status: "ready" | "analyzing" | "error";
  health: number;
  debt: number;
  coverage: number;
  description: string;
};

export const repos: Repo[] = [
  {
    id: "stripe-payments",
    name: "stripe-payments",
    org: "acme",
    stars: "1.2k",
    language: "TypeScript",
    files: 412,
    size: "84 MB",
    lastAnalyzed: "2 hours ago",
    status: "ready",
    health: 86,
    debt: 23,
    coverage: 71,
    description: "Payment service handling Stripe checkout, webhooks, and reconciliation.",
  },
  {
    id: "vector-db",
    name: "vector-db",
    org: "acme",
    stars: "8.4k",
    language: "Rust",
    files: 1280,
    size: "212 MB",
    lastAnalyzed: "yesterday",
    status: "ready",
    health: 74,
    debt: 41,
    coverage: 58,
    description: "High-performance vector database with HNSW indexing and gRPC API.",
  },
  {
    id: "next-commerce",
    name: "next-commerce",
    org: "lena-os",
    stars: "342",
    language: "TypeScript",
    files: 624,
    size: "118 MB",
    lastAnalyzed: "3 days ago",
    status: "analyzing",
    health: 68,
    debt: 35,
    coverage: 49,
    description: "Headless commerce starter built on Next.js, Stripe, and Postgres.",
  },
  {
    id: "ml-pipeline",
    name: "ml-pipeline",
    org: "acme",
    stars: "—",
    language: "Python",
    files: 287,
    size: "56 MB",
    lastAnalyzed: "last week",
    status: "ready",
    health: 91,
    debt: 12,
    coverage: 82,
    description: "Internal ML training pipeline with feature store and experiment tracking.",
  },
];

export const getRepo = (id: string) => repos.find((r) => r.id === id);
