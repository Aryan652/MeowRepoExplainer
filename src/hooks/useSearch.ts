import { useMutation } from "@tanstack/react-query";
import { semanticSearch } from "@/lib/api/search";

export function useSemanticSearch() {
  return useMutation({
    mutationFn: (vars: { repoId: string; query: string; limit?: number }) =>
      semanticSearch({ data: vars }),
  });
}
