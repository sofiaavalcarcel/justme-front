export interface AnalyticsStats {
  avgRating: number;
  monthlyGrowth: number;
  bookingRate: number;
  cancelRate: number;
  totalBookings: number;
  completedBookings: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalProfessionals: number;
  totalBookings: number;
  totalRevenue: number;
  commissionsCollected: number;
  activeServices: number;
  avgRating: number;
}

export interface RevenueData {
  label: string;
  revenue: number;
  bookings: number;
}

export interface RecentActivity {
  id: string;
  type: 'registration' | 'booking';
  title: string;
  description: string;
  timestamp: string;
  userName: string;
  userAvatar?: string;
}
