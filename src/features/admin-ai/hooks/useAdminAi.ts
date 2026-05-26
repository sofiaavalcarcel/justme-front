import { useQuery, useMutation } from '@tanstack/react-query';
import { adminAiService } from '../services/adminAiService';

export function useAiMetrics() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-ai-metrics'],
    queryFn: adminAiService.getMetrics,
    staleTime: 60_000,
    retry: 2,
  });
  return { metrics: data, isLoading, error, refetch };
}

export function useAiInsights() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-ai-insights'],
    queryFn: adminAiService.getInsights,
    staleTime: 300_000, // 5 min — matches backend cache TTL
    retry: 1,
  });
  return {
    insights: data?.insights ?? [],
    insightsSource: (data?.source ?? 'fallback') as 'ollama' | 'fallback',
    isLoading,
    error,
  };
}

export function useAiAlerts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-ai-alerts'],
    queryFn: adminAiService.getAlerts,
    staleTime: 60_000,
    retry: 2,
  });
  return { alerts: data ?? [], isLoading, error };
}

export function useAiChat() {
  const mutation = useMutation({
    mutationFn: (message: string) => adminAiService.chat(message),
  });
  return {
    sendMessage: mutation.mutateAsync,
    isSending: mutation.isPending,
  };
}
