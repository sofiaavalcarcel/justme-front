export interface BusinessMetrics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  totalUsers: number;
  activeUsers: number;
  totalProfessionals: number;
  activeProfessionals: number;
  avgRating: number;
  topService: string;
  cancelRate: number;
  bookingRate: number;
  recentGrowth: number;
  inactiveProCount: number;
  highCancelUserCount: number;
}

export interface AiInsight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  message: string;
  metric?: string | number;
}

export interface AiAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'professionals' | 'users' | 'bookings' | 'revenue';
  title: string;
  description: string;
  count?: number;
  actionLabel?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  source?: 'ollama' | 'fallback';
}

export interface ChatResponse {
  reply: string;
  source: 'ollama' | 'fallback';
  intent?: string;
}
