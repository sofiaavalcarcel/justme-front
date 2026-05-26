import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Loader, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, Receipt
} from 'lucide-react';
import { Card, Badge, Button } from '../../../components/ui';
import { useAdminTransactions } from '../hooks/useAdminTransactions';
import type { Transaction } from '../types';
import { useTranslation } from 'react-i18next';

export function AdminTransactionsTable() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { 
    transactions, total, totalPages, isLoadingTransactions, stats, isLoadingStats 
  } = useAdminTransactions(page, 10);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="admin-transactions-feature" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-4)' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--neutral-900)', letterSpacing: '-0.02em', marginBottom: 'var(--space-1)' }}>
            {t('sharedPages.admin.txTitle', 'Transactions')}
          </h2>
          <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)' }}>
            Historial completo de movimientos financieros en la plataforma.
          </p>
        </div>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        <Card variant="glass" style={{ border: '1px solid var(--neutral-200)', boxShadow: 'var(--shadow-md)', transition: 'transform 0.2s', cursor: 'pointer' }} className="hover-lift">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ padding: '12px', background: 'var(--primary-50)', color: 'var(--primary-600)', borderRadius: 'var(--radius-xl)' }}>
              <TrendingUp size={28} />
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sharedPages.admin.totalRev', 'Total Revenue')}</p>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, color: 'var(--neutral-900)', letterSpacing: '-0.01em' }}>
                {isLoadingStats ? '...' : formatCurrency(stats?.totalRevenue || 0)}
              </h3>
            </div>
          </div>
        </Card>
        
        <Card variant="glass" style={{ border: '1px solid var(--neutral-200)', boxShadow: 'var(--shadow-md)', transition: 'transform 0.2s', cursor: 'pointer' }} className="hover-lift">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ padding: '12px', background: 'var(--success-50)', color: 'var(--success-600)', borderRadius: 'var(--radius-xl)' }}>
              <DollarSign size={28} />
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sharedPages.admin.commissions', 'Commissions')}</p>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, color: 'var(--neutral-900)', letterSpacing: '-0.01em' }}>
                {isLoadingStats ? '...' : formatCurrency(stats?.totalCommissions || 0)}
              </h3>
            </div>
          </div>
        </Card>

        <Card variant="glass" style={{ border: '1px solid var(--neutral-200)', boxShadow: 'var(--shadow-md)', transition: 'transform 0.2s', cursor: 'pointer' }} className="hover-lift">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ padding: '12px', background: 'var(--accent-50)', color: 'var(--accent-600)', borderRadius: 'var(--radius-xl)' }}>
              <Wallet size={28} />
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('sharedPages.admin.totalTx', 'Total Transactions')}</p>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, color: 'var(--neutral-900)', letterSpacing: '-0.01em' }}>
                {isLoadingStats ? '...' : stats?.totalTx || 0}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      <Card variant="glass" padding="none" style={{ overflow: 'hidden', border: '1px solid var(--neutral-200)', boxShadow: 'var(--shadow-md)' }}>
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--neutral-50)', borderBottom: '1px solid var(--neutral-200)' }}>
                <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>
                  Descripción
                </th>
                <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>
                  Tipo
                </th>
                <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>
                  Monto
                </th>
                <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em' }}>
                  Fecha
                </th>
                <th style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--neutral-500)', letterSpacing: '0.05em', textAlign: 'center' }}>
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingTransactions ? (
                <tr>
                  <td colSpan={5} style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                    <Loader className="spin" size={32} style={{ color: 'var(--primary-500)', margin: '0 auto' }} />
                  </td>
                </tr>
              ) : !transactions || transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-400)' }}>
                        <Receipt size={32} />
                      </div>
                      <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                        {t('sharedPages.admin.noTx', 'No transactions found')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {transactions.map((tx: Transaction, index: number) => (
                    <motion.tr 
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      style={{ borderBottom: '1px solid var(--neutral-100)', backgroundColor: 'var(--neutral-0)', transition: 'background-color 0.2s' }}
                      whileHover={{ backgroundColor: 'var(--neutral-50)' }}
                    >
                      <td style={{ padding: 'var(--space-4)' }}>
                        <p style={{ fontWeight: 600, color: 'var(--neutral-900)', fontSize: 'var(--text-sm)' }}>{tx.description}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', fontFamily: 'monospace' }}>ID: {tx.id}</p>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: tx.type === 'payment' ? 'var(--success-50)' : 'var(--primary-50)', color: tx.type === 'payment' ? 'var(--success-600)' : 'var(--primary-600)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                          {tx.type === 'payment' ? (
                            <ArrowDownLeft size={14} />
                          ) : (
                            <ArrowUpRight size={14} />
                          )}
                          <span style={{ textTransform: 'capitalize' }}>{tx.type}</span>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: tx.type === 'payment' ? 'var(--success-600)' : 'var(--neutral-900)' }}>
                          {tx.type === 'payment' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                      </td>
                      <td style={{ padding: 'var(--space-4)', color: 'var(--neutral-500)', fontSize: 'var(--text-sm)' }}>
                        {new Date(tx.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                        <Badge variant={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'error'} size="sm" style={{ fontWeight: 600, padding: '4px 10px' }}>
                          {tx.status}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {total > 0 && (
          <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--neutral-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--neutral-50)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', fontWeight: 500 }}>
              Mostrando {transactions.length} de {total} transacciones
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              <Button 
                size="sm" 
                variant="outline" 
                disabled={page <= 1} 
                onClick={() => setPage(p => p - 1)}
                icon={<ChevronLeft size={16} />}
                style={{ width: '32px', height: '32px', padding: 0 }}
              />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--neutral-700)', minWidth: '40px', textAlign: 'center' }}>
                {page} / {totalPages || 1}
              </span>
              <Button 
                size="sm" 
                variant="outline" 
                disabled={page >= (totalPages || 1)} 
                onClick={() => setPage(p => p + 1)}
                icon={<ChevronRight size={16} />}
                style={{ width: '32px', height: '32px', padding: 0 }}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
