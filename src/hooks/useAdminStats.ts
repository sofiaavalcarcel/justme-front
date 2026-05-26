import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export interface AdminStatsDto {
  totalUsers: number;
  totalProfessionals: number;
  totalBookings: number;
  totalRevenue: number;
  commissionsCollected: number;
  activeServices: number;
}

export interface MonthlyRevenueDto {
  label: string;
  revenue: number;
  bookings: number;
}

interface AdminDashboardData {
  stats: AdminStatsDto | null;
  activities: any[];
  transactions: any[];
  revenueChart: MonthlyRevenueDto[];
  loading: boolean;
  error: string | null;
  activityMeta: { total: number; page: number; totalPages: number } | null;
  transactionMeta: { total: number; page: number; totalPages: number } | null;
  fetchActivities: (page: number, limit: number, filters?: any) => Promise<void>;
  fetchTransactions: (page: number, limit: number) => Promise<void>;
  reload: () => Promise<void>;
}

export function useAdminStats(): AdminDashboardData {
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [revenueChart, setRevenueChart] = useState<MonthlyRevenueDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activityMeta, setActivityMeta] = useState<any>(null);
  const [transactionMeta, setTransactionMeta] = useState<any>(null);

  const fetchActivities = async (page: number = 1, limit: number = 5, filters: any = {}) => {
    try {
      const { type, startDate, endDate } = filters;
      let url = `/admin/activity?page=${page}&limit=${limit}`;
      if (type) url += `&type=${type}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const res = await apiClient.get(url);
      setActivities(res.data.data || []);
      setActivityMeta({ total: res.data.total, page: res.data.page, totalPages: res.data.totalPages });
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const fetchTransactions = async (page: number = 1, limit: number = 10) => {
    try {
      const res = await apiClient.get(`/admin/transactions?page=${page}&limit=${limit}`);
      setTransactions(res.data.data || []);
      setTransactionMeta({ total: res.data.total, page: res.data.page, totalPages: res.data.totalPages });
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, activityRes, txRes, chartRes] = await Promise.all([
        apiClient.get<AdminStatsDto>('/admin/stats'),
        apiClient.get('/admin/activity?page=1&limit=5'),
        apiClient.get('/admin/transactions?page=1&limit=10'),
        apiClient.get<MonthlyRevenueDto[]>('/admin/revenue-chart'),
      ]);

      setStats(statsRes.data);
      setActivities(activityRes.data?.data || []);
      setActivityMeta({ total: activityRes.data?.total || 0, page: 1, totalPages: activityRes.data?.totalPages || 1 });
      
      setTransactions(txRes.data?.data || []);
      setTransactionMeta({ total: txRes.data?.total || 0, page: 1, totalPages: txRes.data?.totalPages || 1 });
      
      setRevenueChart(chartRes.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudieron cargar los datos del dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return { 
    stats, activities, transactions, revenueChart, loading, error, 
    activityMeta, transactionMeta, fetchActivities, fetchTransactions, 
    reload: loadAll 
  };
}

