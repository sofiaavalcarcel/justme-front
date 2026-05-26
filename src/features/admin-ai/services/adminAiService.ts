import type { AiInsight, AiAlert, BusinessMetrics, ChatResponse } from '../types';
import { apiClient } from '../../../shared/api/axiosClient';

export const adminAiService = {
  getMetrics: async (): Promise<BusinessMetrics> => {
    const res = await apiClient.get<BusinessMetrics>('/admin/ai/metrics');
    return res.data;
  },

  getInsights: async (): Promise<{ insights: AiInsight[]; source: 'ollama' | 'fallback' }> => {
    const res = await apiClient.get<{ insights: AiInsight[]; source: 'ollama' | 'fallback' }>('/admin/ai/insights');
    return res.data;
  },

  getAlerts: async (): Promise<AiAlert[]> => {
    const res = await apiClient.get<AiAlert[]>('/admin/ai/alerts');
    return res.data;
  },

  chat: async (message: string): Promise<ChatResponse> => {
    const res = await apiClient.post<ChatResponse>('/admin/ai/chat', { message });
    return res.data;
  },
};
