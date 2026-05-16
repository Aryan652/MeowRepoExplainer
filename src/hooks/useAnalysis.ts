import { useMutation, useQuery } from "@tanstack/react-query";
import { startAnalysis, getAnalysisProgress } from "@/lib/api/analysis";

export const analysisKeys = {
  progress: (jobId: string) => ["analysis", "progress", jobId] as const,
};

export function useStartAnalysis() {
  return useMutation({
    mutationFn: (vars: { repoId: string; githubUrl: string }) => startAnalysis({ data: vars }),
  });
}

export function useAnalysisProgress(jobId: string | null) {
  return useQuery({
    queryKey: analysisKeys.progress(jobId!),
    queryFn: () => getAnalysisProgress({ data: { jobId: jobId! } }),
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Poll every 1.5 seconds if the job is not completed yet
      return query.state.data?.step === "completed" ? false : 1500;
    },
  });
}
