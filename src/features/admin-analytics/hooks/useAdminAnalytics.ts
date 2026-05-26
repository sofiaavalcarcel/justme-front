import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

export function useAdminAnalytics() {
  const statsQuery = useQuery({
    queryKey: ['admin-analytics-stats'],
    queryFn: () => analyticsService.getStats()
  });

  const summaryQuery = useQuery({
    queryKey: ['admin-dashboard-summary'],
    queryFn: () => analyticsService.getDashboardSummary()
  });

  const revenueQuery = useQuery({
    queryKey: ['admin-revenue-chart'],
    queryFn: () => analyticsService.getRevenueChart()
  });

  const activityQuery = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: () => analyticsService.getRecentActivity(1, 10)
  });

  const isLoading = 
    statsQuery.isLoading || 
    summaryQuery.isLoading || 
    revenueQuery.isLoading || 
    activityQuery.isLoading;

  return {
    analytics: statsQuery.data,
    summary: summaryQuery.data,
    revenue: revenueQuery.data,
    activity: activityQuery.data?.data || [],
    isLoading,
    isError: statsQuery.isError || summaryQuery.isError || revenueQuery.isError
  };
}
