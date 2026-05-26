export interface Transaction {
  id: string;
  description: string;
  type: 'payment' | 'payout' | 'refund' | 'commission';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface AdminStats {
  totalRevenue: number;
  totalCommissions: number;
  totalTx: number;
}

export interface TransactionResponse {
  data: Transaction[];
  total: number;
  totalPages: number;
}
