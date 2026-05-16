/**
 * src/hooks/useRepos.ts
 *
 * TanStack Query hooks that wrap the server functions in src/lib/api/repos.ts.
 * Components should import these hooks — never call server functions directly.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listRepos,
  getRepoById,
  createRepo,
  getRepoArchitecture,
  type RepoSummary,
} from "@/lib/api/repos";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const repoKeys = {
  all: ["repos"] as const,
  detail: (id: string) => ["repos", id] as const,
  architecture: (id: string) => ["repos", id, "architecture"] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetch all repositories for the current user's workspace.
 */
export function useRepos() {
  return useQuery<RepoSummary[]>({
    queryKey: repoKeys.all,
    queryFn: () => listRepos(),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Fetch a single repository by ID.
 */
export function useRepo(id: string) {
  return useQuery<RepoSummary | null>({
    queryKey: repoKeys.detail(id),
    queryFn: () => getRepoById({ data: { id } }),
    staleTime: 1000 * 60,
    enabled: !!id,
  });
}

/**
 * Create a new repository and invalidate the list cache on success.
 */
export function useCreateRepo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      userId: string;
      name: string;
      org: string;
      githubUrl?: string;
      language?: string;
    }) => createRepo({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: repoKeys.all });
    },
  });
}

/**
 * Fetch architecture graph for a repo.
 */
export function useRepoArchitecture(id: string) {
  return useQuery({
    queryKey: repoKeys.architecture(id),
    queryFn: () => getRepoArchitecture({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}
