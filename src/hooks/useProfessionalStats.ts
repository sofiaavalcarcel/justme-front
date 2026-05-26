import { useState, useEffect, useCallback } from 'react';
import { professionalsService } from '../services/professionalsService';

export interface DashboardStats {
  totalRevenue: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  monthlyTrend: number;
  averageRating: number;
  totalClients: number;
  completedBookings: number;
  walletBalance: number;
  weeklyEarningsByDay: number[];
  weeklyBookingsByDay: number[];
  topServices: { name: string; count: number; revenue: number }[];
  recentReviews: any[];
  incentive: any;
}

export function useProfessionalStats(professionalId: string | number | null) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!professionalId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await professionalsService.getDashboardStats(String(professionalId));
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err?.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [professionalId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
