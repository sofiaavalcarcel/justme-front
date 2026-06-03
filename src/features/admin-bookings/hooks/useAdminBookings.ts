import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services/bookingService';

export function useAdminBookings(page = 1, limit = 10, filters = {}) {
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['admin-bookings', page, limit, filters],
    queryFn: () => bookingService.getBookings(page, limit, filters)
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) =>
      bookingService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    }
  });

  return {
    bookings: bookingsQuery.data?.data || [],
    total: bookingsQuery.data?.total || 0,
    totalPages: bookingsQuery.data?.totalPages || 1,
    // Stats are now embedded in the list response
    stats: bookingsQuery.data?.stats,
    isLoading: bookingsQuery.isLoading,
    isError: bookingsQuery.isError,
    isUpdating: updateStatusMutation.isPending,
    updateStatus: updateStatusMutation.mutate
  };
}
