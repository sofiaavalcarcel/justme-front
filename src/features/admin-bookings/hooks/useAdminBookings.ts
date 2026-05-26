import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services/bookingService';

export function useAdminBookings(page = 1, limit = 10, filters = {}) {
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['admin-bookings', page, limit, filters],
    queryFn: () => bookingService.getBookings(page, limit, filters)
  });

  const statsQuery = useQuery({
    queryKey: ['admin-bookings-stats'],
    queryFn: () => bookingService.getStats()
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      bookingService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings-stats'] });
    }
  });

  return {
    bookings: bookingsQuery.data?.data || [],
    total: bookingsQuery.data?.total || 0,
    totalPages: bookingsQuery.data?.totalPages || 1,
    stats: statsQuery.data,
    isLoading: bookingsQuery.isLoading || statsQuery.isLoading,
    isUpdating: updateStatusMutation.isPending,
    updateStatus: updateStatusMutation.mutate
  };
}
