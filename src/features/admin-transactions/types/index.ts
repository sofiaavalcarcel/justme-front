export interface Transaction {
  id: string;
  description: string;
  type: 'payment' | 'payout' | 'refund' | 'commission' | 'COMMISSION' | 'TOP_UP' | 'ADJUSTMENT' | 'REFUND' | 'BONUS';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  wallet?: {
    id: number;
    professionalId: number;
    professional?: {
      id: number;
      userId: number;
      user?: {
        id: number;
        name: string;
        lastName: string;
        email: string;
        avatar?: string;
      };
    };
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
