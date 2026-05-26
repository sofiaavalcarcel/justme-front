import { useQuery } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';

export function useAdminTransactions(page = 1, limit = 10) {
  const transactionsQuery = useQuery({
    queryKey: ['admin-transactions', page, limit],
    queryFn: () => transactionService.getTransactions(page, limit),
    placeholderData: (previousData) => previousData
  });

  const statsQuery = useQuery({
    queryKey: ['admin-financial-stats'],
    queryFn: () => transactionService.getStats()
  });

  return {
    transactions: transactionsQuery.data?.data || [],
    total: transactionsQuery.data?.total || 0,
    totalPages: transactionsQuery.data?.totalPages || 1,
    isLoadingTransactions: transactionsQuery.isLoading,
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading
  };
}
