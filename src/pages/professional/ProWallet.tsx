import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, History, AlertCircle, CheckCircle2, XCircle, Loader, ShieldCheck } from 'lucide-react';
import { Card, Button, Badge, Modal } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { walletService } from '../../services/walletService';
import { useTranslation } from 'react-i18next';
import './ProWallet.css';

export default function ProWallet() {
  const { t, i18n } = useTranslation();
  const { professionalId } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecharge, setShowRecharge] = useState(false);
  const [showAllTx, setShowAllTx] = useState(false);
  const [amount, setAmount] = useState('');
  const [recharging, setRecharging] = useState(false);
  const [rechargeStatus, setRechargeStatus] = useState<'success' | 'error' | null>(null);
  const [lastRechargedAmount, setLastRechargedAmount] = useState<number>(0);

  const formatCOP = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(num || 0).replace('COP', '$');
  };

  const fetchWallet = async () => {
    if (!professionalId) return;
    try {
      const data = await walletService.getBalance(professionalId);
      setBalance(data?.balance ?? 0);
      setTransactions(Array.isArray(data?.transactions) ? data.transactions : []);
    } catch (err) {
      console.warn('Failed to load wallet', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [professionalId]);

  const handleRecharge = async (customAmt?: number) => {
    const amtToPay = customAmt || Number(amount);
    if (!amtToPay || isNaN(amtToPay) || !professionalId) return;
    
    setRecharging(true);
    setLastRechargedAmount(amtToPay);
    try {
      await walletService.recharge(professionalId, { amount: amtToPay, currency: 'COP' });
      setRechargeStatus('success');
      setAmount('');
      // Refresh wallet immediately to show updated balance
      await fetchWallet();
      
      setTimeout(() => {
        setShowRecharge(false);
        setRechargeStatus(null);
      }, 3500);
    } catch (err) {
      console.error('Wallet recharge failed:', err);
      setRechargeStatus('error');
    } finally {
      setRecharging(false);
    }
  };

  const getBalanceStatusLabel = () => {
    if (balance === null) return '...';
    if (balance < -20000) return t('proWallet.accountSuspended');
    if (balance < 0) return t('proWallet.negative');
    if (balance < 20000) return t('proWallet.below', { defaultValue: 'Saldo Bajo' });
    return t('sharedPages.pro.verified', { defaultValue: 'Activa' });
  };

  if (loading) {
    return (
      <div className="pro-wallet" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
      </div>
    );
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthEarnings = transactions
    .filter(tx => tx.type === 'payment' || tx.type === 'earning' || tx.type === 'recharge')
    .filter(tx => {
      const d = new Date(tx.createdAt || tx.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const commissionsPaid = transactions
    .filter(tx => tx.type === 'commission')
    .reduce((acc, curr) => acc + Math.abs(parseFloat(curr.amount) || 0), 0);

  const handleCloseRecharge = () => {
    if (!recharging) {
      setShowRecharge(false);
      setRechargeStatus(null);
    }
  };

  return (
    <div className="pro-wallet">
      <div className="wallet-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={20} />
          </div>
          {t('proWallet.title')}
        </h1>
        <Badge variant={balance !== null && balance < 0 ? 'error' : 'success'} size="md">
          {balance !== null && balance >= 20000 ? 'Billetera Activa' : getBalanceStatusLabel()}
        </Badge>
      </div>

      <div className="wallet-grid">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="wallet-main">
          {/* Balance Card */}
          <Card variant="gradient" padding="lg" className="wallet-balance-card premium-shadow">
            <div className="wallet-top">
              <div>
                <span className="wallet-label">{t('proWallet.available')}</span>
                <h2 className="wallet-amount">{formatCOP(balance ?? 0)}</h2>
              </div>
              <Button className="recharge-btn" variant="secondary" icon={<Plus size={18} />} onClick={() => setShowRecharge(true)}>
                {t('proWallet.rechargeBtn')}
              </Button>
            </div>
            <div className="wallet-info-row">
              <div className="wallet-info-item">
                <span className="w-info-label">{t('proWallet.rate')}</span>
                <span className="w-info-val">10%</span>
              </div>
              <div className="wallet-info-item">
                <span className="w-info-label">Estado</span>
                <span className="w-info-val" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} /> {balance !== null && balance < 0 ? 'Limitado' : 'Activo'}
                </span>
              </div>
            </div>
          </Card>

          {balance !== null && balance < 20000 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="low-balance-warning">
              <AlertCircle size={20} />
              <div>
                <strong>{balance < -20000 ? t('proWallet.accountSuspended') : 'Aviso de Saldo Bajo'}</strong>
                <p>{balance < -20000 ? t('proWallet.suspendedMsg') : 'Tu saldo es menor a 20.000 COP. Recarga para seguir recibiendo reservas.'}</p>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="wallet-stats">
            <Card variant="default" padding="md" className="wallet-stat-card">
              <div className="ws-icon" style={{ background: 'var(--success-50)', color: 'var(--success-500)' }}>
                <ArrowDownLeft size={20} />
              </div>
              <div>
                <span className="ws-label">{t('proWallet.thisMonth')}</span>
                <span className="ws-val" style={{ color: 'var(--success-600)' }}>+{formatCOP(thisMonthEarnings)}</span>
              </div>
            </Card>
            <Card variant="default" padding="md" className="wallet-stat-card">
              <div className="ws-icon" style={{ background: 'var(--error-50)', color: 'var(--error-500)' }}>
                <ArrowUpRight size={20} />
              </div>
              <div>
                <span className="ws-label">{t('proWallet.commPaid')}</span>
                <span className="ws-val" style={{ color: 'var(--error-600)' }}>-{formatCOP(commissionsPaid)}</span>
              </div>
            </Card>
          </div>

          {/* Transactions */}
          <div className="wallet-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><History size={18} /> {t('proWallet.txHistory')}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAllTx(true)}>{t('userHome.seeAll')}</Button>
            </div>
            <div className="txn-list">
              {transactions.length === 0 ? (
                <div className="pw-empty" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                  <Wallet size={48} style={{ margin: '0 auto var(--space-3)' }} />
                  <p>{t('proWallet.noTx')}</p>
                </div>
              ) : (
                transactions.slice(0, 10).map((tx) => {
                  const isPositive = tx.type === 'payment' || tx.type === 'recharge' || tx.type === 'earning';
                  return (
                    <Card key={tx.id} variant="default" padding="sm" className="txn-card">
                      <div className={`txn-icon ${isPositive ? 'txn-in' : 'txn-out'}`}>
                        {isPositive ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div className="txn-info">
                        <span className="txn-desc">{tx.description || t('adminDash.transaction')}</span>
                        <span className="txn-date">{new Date(tx.createdAt || tx.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="txn-right">
                        <span className={`txn-amount ${isPositive ? 'txn-positive' : 'txn-negative'}`}>
                          {isPositive ? '+' : '-'}{formatCOP(Math.abs(parseFloat(tx.amount || 0)))}
                        </span>
                        <Badge size="sm" variant={tx.status === 'completed' || tx.status === 'paid' ? 'success' : 'warning'}>{tx.status}</Badge>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recharge Modal */}
      <Modal 
        isOpen={showRecharge} 
        onClose={handleCloseRecharge} 
        title={t('proWallet.rechargeTitle')}
        size="md"
      >
        <div className="recharge-panel">
          {rechargeStatus === 'success' ? (
            <div className="recharge-status-view">
              <div className="success-lottie-sim">
                <CheckCircle2 size={64} color="var(--success-500)" />
              </div>
              <h3>{t('proWallet.successTitle')}</h3>
              <p>{t('proWallet.successMsg', { amount: formatCOP(lastRechargedAmount || '0') })}</p>
            </div>
          ) : rechargeStatus === 'error' ? (
            <div className="recharge-status-view">
              <XCircle size={64} color="var(--error-500)" />
              <h3>{t('proWallet.failTitle')}</h3>
              <p>{t('proWallet.failMsg')}</p>
              <Button onClick={() => setRechargeStatus(null)}>{t('userHome.retry')}</Button>
            </div>
          ) : (
            <>
              <h3>{t('proWallet.selectAmount', { defaultValue: 'Selecciona monto' })} (COP)</h3>
              <div className="recharge-amounts">
                {[50000, 100000, 200000, 500000].map(v => (
                  <button key={v} className="recharge-amount-btn" onClick={() => handleRecharge(v)}>
                    {formatCOP(v)}
                  </button>
                ))}
              </div>
              <div className="recharge-custom">
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--neutral-400)' }}>
                    $
                  </span>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    placeholder="0" 
                    style={{ paddingLeft: 25 }}
                  />
                </div>
                <Button 
                  loading={recharging} 
                  disabled={!amount || Number(amount) <= 0}
                  onClick={() => handleRecharge()}
                  icon={<Plus size={18} />}
                >
                  {t('proWallet.rechargeBtn')}
                </Button>
              </div>
              <p className="recharge-hint">
                <ShieldCheck size={12} style={{ display: 'inline', marginRight: 4 }} />
                Pago procesado de forma segura a través de MercadoPago.
              </p>
            </>
          )}
        </div>
      </Modal>

      {/* View All Transactions Modal */}
      <Modal
        isOpen={showAllTx}
        onClose={() => setShowAllTx(false)}
        title={t('proWallet.txHistory')}
        size="lg"
      >
        <div className="all-tx-list" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {transactions.map((tx) => {
            const isPositive = tx.type === 'payment' || tx.type === 'recharge' || tx.type === 'earning';
            return (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)', borderBottom: '1px solid var(--neutral-100)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className={`txn-icon ${isPositive ? 'txn-in' : 'txn-out'}`} style={{ width: 32, height: 32 }}>
                    {isPositive ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{tx.description || 'Transacción'}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' }}>
                      {new Date(tx.createdAt || tx.date).toLocaleDateString(undefined, { day: 'numeric', month: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, color: isPositive ? 'var(--success-600)' : 'var(--error-600)' }}>
                    {isPositive ? '+' : '-'}{formatCOP(Math.abs(parseFloat(tx.amount || 0)))}
                  </p>
                  <Badge size="sm" variant={tx.status === 'completed' || tx.status === 'paid' ? 'success' : 'warning'}>{tx.status}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
