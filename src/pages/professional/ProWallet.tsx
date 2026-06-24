import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, Plus, History,
  AlertTriangle, CheckCircle2, XCircle, Loader2, ShieldCheck,
  CreditCard, TrendingUp, TrendingDown, RefreshCw,
  Lock, ChevronRight, Banknote
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { walletService } from '../../services/walletService';
import { useTranslation } from 'react-i18next';
import './ProWallet.css';

// Stripe Integration
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// ─── Stripe Card Form ──────────────────────────────────────────────────────────
interface StripeFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: () => void;
  onBack: () => void;
  isConfirming: boolean;
}

function StripeCardForm({ clientSecret, onSuccess, onError, onBack, isConfirming }: StripeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardReady, setCardReady] = useState(false);
  const [email, setEmail] = useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || processing || isConfirming) return;
    const card = elements.getElement(CardNumberElement);
    if (!card) return;

    setProcessing(true);
    setCardError(null);

    const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
      receipt_email: email ? email : undefined,
    });

    if (error) {
      setCardError(error.message || 'Error al procesar el pago.');
      onError();
      setProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
      // keep processing=true while parent confirms on backend
    } else {
      setCardError('Estado de pago desconocido.');
      onError();
      setProcessing(false);
    }
  };

  const isLoading = processing || isConfirming;

  return (
    <form onSubmit={handlePay} className="stripe-card-form">
      {/* Card header */}
      <div className="stripe-card-header">
        <div className="stripe-card-icon-wrap">
          <CreditCard size={22} />
        </div>
        <div>
          <p className="stripe-card-title">Datos de tarjeta</p>
          <p className="stripe-card-subtitle">Crédito o débito · Pago seguro con Stripe</p>
        </div>
      </div>

      {/* Email input */}
      <div className="stripe-card-field">
        <input 
          type="email" 
          placeholder="Correo electrónico para recibo (opcional)" 
          className="stripe-custom-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Card fields */}
      <div className={`stripe-card-container ${cardError ? 'has-error' : ''}`}>
        <div className="stripe-card-field border-bottom">
          <CardNumberElement
            onChange={(e) => {
              setCardReady(e.complete);
              if (e.error) setCardError(e.error.message || null);
              else setCardError(null);
            }}
            options={{
              style: {
                base: {
                  fontSize: '15px',
                  color: '#1a1a2e',
                  fontFamily: '"Inter", "Helvetica Neue", Helvetica, sans-serif',
                  fontWeight: '500',
                  letterSpacing: '0.025em',
                  '::placeholder': { color: '#a0aec0' },
                },
                invalid: { color: '#e53e3e', iconColor: '#e53e3e' },
              },
              showIcon: true,
            }}
          />
        </div>
        <div className="stripe-card-row">
          <div className="stripe-card-field border-right">
            <CardExpiryElement
              options={{
                style: {
                  base: {
                    fontSize: '15px',
                    color: '#1a1a2e',
                    fontFamily: '"Inter", "Helvetica Neue", Helvetica, sans-serif',
                    fontWeight: '500',
                    '::placeholder': { color: '#a0aec0' },
                  },
                  invalid: { color: '#e53e3e' },
                },
              }}
            />
          </div>
          <div className="stripe-card-field">
            <CardCvcElement
              options={{
                style: {
                  base: {
                    fontSize: '15px',
                    color: '#1a1a2e',
                    fontFamily: '"Inter", "Helvetica Neue", Helvetica, sans-serif',
                    fontWeight: '500',
                    '::placeholder': { color: '#a0aec0' },
                  },
                  invalid: { color: '#e53e3e' },
                },
              }}
            />
          </div>
        </div>
      </div>

      {cardError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="stripe-field-error"
        >
          <XCircle size={14} />
          <span>{cardError}</span>
        </motion.div>
      )}

      {/* Actions */}
      <div className="stripe-form-actions">
        <button
          type="button"
          className="stripe-back-btn"
          onClick={onBack}
          disabled={isLoading}
        >
          ← Volver
        </button>
        <button
          type="submit"
          className={`stripe-pay-btn ${(!cardReady || isLoading) ? 'disabled' : ''}`}
          disabled={!cardReady || isLoading || !stripe}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="spin" />
              {isConfirming ? 'Confirmando...' : 'Procesando...'}
            </>
          ) : (
            <>
              <Lock size={14} />
              Pagar ahora
            </>
          )}
        </button>
      </div>

      {/* Security badge */}
      <div className="stripe-security-row">
        <ShieldCheck size={13} />
        <span>Cifrado SSL 256-bit · PCI DSS compliant · Powered by Stripe</span>
      </div>
    </form>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProWallet() {
  const { i18n } = useTranslation();
  const { professionalId } = useAuth();

  // Wallet state
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [showRecharge, setShowRecharge] = useState(false);
  const [showAllTx, setShowAllTx] = useState(false);

  // Recharge flow: 'select' → 'checkout' → 'confirming' → 'success' | 'error'
  const [rechargeStep, setRechargeStep] = useState<'select' | 'checkout' | 'confirming' | 'success' | 'error'>('select');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const formatCOP = (val: number | string | null | undefined) => {
    const num = typeof val === 'string' ? parseFloat(val) : (val ?? 0);
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(num || 0).replace('COP', '$');
  };

  const fetchWallet = async (silent = false) => {
    if (!professionalId) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await walletService.getBalance(professionalId);
      setBalance(parseFloat(data?.balance ?? '0'));
      setTransactions(Array.isArray(data?.transactions) ? data.transactions : []);
    } catch { /* silently fail */ }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchWallet(); }, [professionalId]);

  // ── Computed ─────────────────────────────────────────────────────────────────
  const balanceNum = balance ?? 0;
  const isNegative = balanceNum < 0;
  const isLow      = balanceNum <= 20000 && balanceNum > 0;
  const canBook     = balanceNum > 0;

  const totalCommissions = transactions
    .filter(tx => tx.type === 'COMMISSION')
    .reduce((s, tx) => s + Math.abs(parseFloat(tx.amount) || 0), 0);

  const totalTopUps = transactions
    .filter(tx => tx.type === 'TOP_UP')
    .reduce((s, tx) => s + Math.abs(parseFloat(tx.amount) || 0), 0);

  // ── Recharge flow ─────────────────────────────────────────────────────────────
  const PRESET_AMOUNTS = [50000, 100000, 200000, 500000];

  const openRecharge = () => {
    setRechargeStep('select');
    setSelectedAmount(null);
    setCustomAmount('');
    setStripeClientSecret(null);
    setShowRecharge(true);
  };

  const closeRecharge = () => {
    if (rechargeStep === 'confirming') return;
    setShowRecharge(false);
    setTimeout(() => {
      setRechargeStep('select');
      setStripeClientSecret(null);
      setSelectedAmount(null);
      setCustomAmount('');
    }, 300);
  };

  const handleProceedToCheckout = async () => {
    const amt = selectedAmount ?? Number(customAmount);
    if (!amt || amt <= 0 || !professionalId) return;
    setLoadingIntent(true);
    try {
      const intent = await walletService.createPaymentIntent(professionalId, amt);
      if (!intent?.clientSecret) throw new Error('Sin clientSecret');
      setStripeClientSecret(intent.clientSecret);
      setSelectedAmount(amt);
      setRechargeStep('checkout');
    } catch {
      setRechargeStep('error');
    } finally {
      setLoadingIntent(false);
    }
  };

  const handleStripeSuccess = async (paymentIntentId: string) => {
    setRechargeStep('confirming');
    try {
      await walletService.confirmPayment(paymentIntentId);
      await fetchWallet(true);
      setRechargeStep('success');
      setTimeout(() => closeRecharge(), 4000);
    } catch {
      setRechargeStep('error');
    }
  };

  // ── Transaction display helpers ───────────────────────────────────────────────
  const txTypeLabel = (type: string) => {
    if (type === 'TOP_UP')     return 'Recarga de saldo';
    if (type === 'COMMISSION') return 'Comisión JUSTME';
    if (type === 'BONUS')      return 'Bono plataforma';
    if (type === 'REFUND')     return 'Reembolso';
    if (type === 'ADJUSTMENT') return 'Ajuste';
    return type;
  };

  const isCredit = (type: string) => type === 'TOP_UP' || type === 'BONUS' || type === 'REFUND';

  // ── Loading skeleton ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pw-page">
        <div className="pw-skeleton-hero" />
        <div className="pw-skeleton-stats">
          {[1, 2, 3].map(i => <div key={i} className="pw-skeleton-stat" />)}
        </div>
        <div className="pw-skeleton-list">
          {[1, 2, 3, 4].map(i => <div key={i} className="pw-skeleton-row" />)}
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="pw-page">

      {/* ── PAGE HEADER ── */}
      <div className="pw-page-header">
        <div className="pw-page-title">
          <div className="pw-title-icon">
            <Wallet size={22} />
          </div>
          <div>
            <h1>Balance Operativo</h1>
            <p>Saldo prepagado para acceder a la plataforma JUSTME</p>
          </div>
        </div>
        <button className={`pw-refresh-btn ${refreshing ? 'spinning' : ''}`} onClick={() => fetchWallet(true)}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* ── HERO BALANCE CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`pw-hero-card ${isNegative ? 'hero-negative' : isLow ? 'hero-warning' : 'hero-active'}`}
      >
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />

        <div className="hero-top-row">
          <div className="hero-badge">
            <span className={`hw-status-dot ${isNegative ? 'error' : isLow ? 'warning' : 'success'}`} />
            {isNegative ? 'Cuenta suspendida' : isLow ? 'Saldo bajo' : !canBook ? 'Sin saldo' : 'Activo'}
          </div>
          <div className="hero-currency-tag">COP</div>
        </div>

        <div className="hero-balance-section">
          <span className="hero-balance-label">Saldo operativo disponible</span>
          <h2 className="hero-balance-amount">{formatCOP(balanceNum)}</h2>
          <span className="hero-balance-sub">Comisión por reserva completada: 9% del precio del servicio</span>
        </div>

        <div className="hero-actions">
          <button className="hero-recharge-btn" onClick={openRecharge}>
            <Plus size={18} />
            Recargar saldo
          </button>
          <div className="hero-stripe-badge">
            <ShieldCheck size={14} />
            <span>Pagos vía Stripe</span>
          </div>
        </div>
      </motion.div>

      {/* ── BLOCKING ALERT when canBook = false ── */}
      <AnimatePresence>
        {!canBook && (
          <motion.div
            key="block-alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pw-alert alert-error"
          >
            <AlertTriangle size={18} />
            <div className="pw-alert-body">
              <strong>🚫 No puedes recibir nuevas reservas</strong>
              <p>Tu saldo operativo es {formatCOP(balanceNum)}. Recarga para que los clientes puedan reservarte.</p>
            </div>
            <button className="pw-alert-cta" onClick={openRecharge}>
              Recargar <ChevronRight size={14} />
            </button>
          </motion.div>
        )}
        {canBook && isLow && (
          <motion.div
            key="low-alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pw-alert alert-warning"
          >
            <AlertTriangle size={18} />
            <div className="pw-alert-body">
              <strong>⚡ Saldo operativo bajo</strong>
              <p>Te quedan {formatCOP(balanceNum)}. Recarga pronto para no perder visibilidad.</p>
            </div>
            <button className="pw-alert-cta" onClick={openRecharge}>
              Recargar <ChevronRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HOW IT WORKS (informational) ── */}
      <div className="pw-info-box">
        <div className="pw-info-row">
          <div className="pw-info-item">
            <div className="pw-info-icon green"><TrendingUp size={18} /></div>
            <div>
              <span className="pw-info-label">Total recargado</span>
              <span className="pw-info-val">{formatCOP(totalTopUps)}</span>
            </div>
          </div>
          <div className="pw-info-item">
            <div className="pw-info-icon red"><TrendingDown size={18} /></div>
            <div>
              <span className="pw-info-label">Comisiones cobradas</span>
              <span className="pw-info-val">-{formatCOP(totalCommissions)}</span>
            </div>
          </div>
          <div className="pw-info-item">
            <div className="pw-info-icon blue"><Banknote size={18} /></div>
            <div>
              <span className="pw-info-label">Total movimientos</span>
              <span className="pw-info-val">{transactions.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRANSACTION HISTORY TABLE ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pw-tx-section"
      >
        <div className="pw-tx-header">
          <div className="pw-tx-title">
            <History size={18} />
            <h2>Historial de movimientos</h2>
            {transactions.length > 0 && <span className="pw-tx-count">{transactions.length}</span>}
          </div>
          {transactions.length > 5 && (
            <button className="pw-see-all-btn" onClick={() => setShowAllTx(true)}>
              Ver todo <ChevronRight size={14} />
            </button>
          )}
        </div>

        {transactions.length === 0 ? (
          <div className="pw-tx-empty">
            <div className="pw-empty-icon"><Wallet size={36} /></div>
            <p>Sin movimientos todavía</p>
            <span>Las recargas y comisiones aparecerán aquí</span>
          </div>
        ) : (
          <div className="pw-audit-table-wrap">
            <table className="pw-audit-table">
              <thead>
                <tr>
                  <th className="pw-th-date">Fecha</th>
                  <th className="pw-th-desc">Descripción</th>
                  <th className="pw-th-price text-right">Precio servicio</th>
                  <th className="pw-th-amount text-right">Comisión / Monto</th>
                  <th className="pw-th-balance text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map((tx, idx) => {
                  const credit = isCredit(tx.type);
                  const commission = tx.type === 'COMMISSION';
                  return (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * idx }}
                      className={`pw-audit-row ${credit ? 'row-credit' : commission ? 'row-commission' : ''}`}
                    >
                      <td className="pw-audit-date" data-label="Fecha">
                        {new Date(tx.createdAt).toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="pw-audit-desc" data-label="Descripción">
                        <div className="pw-audit-desc-inner">
                          <div className={`pw-audit-dot ${credit ? 'dot-green' : commission ? 'dot-purple' : 'dot-gray'}`} />
                          <div>
                            <span className="pw-audit-type">{txTypeLabel(tx.type)}</span>
                            {tx.relatedBookingId && (
                              <span className="pw-audit-meta">Reserva #{tx.relatedBookingId}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="pw-audit-service text-right" data-label="Precio servicio">
                        {tx.serviceAmount ? formatCOP(tx.serviceAmount) : '—'}
                      </td>
                      <td className={`pw-audit-amount text-right ${credit ? 'amount-credit' : 'amount-debit'}`} data-label="Monto">
                        {credit ? '+' : ''}{formatCOP(tx.amount)}
                        {commission && tx.commissionPercentage && (
                          <span className="pw-audit-pct">({(Number(tx.commissionPercentage) * 100).toFixed(0)}%)</span>
                        )}
                      </td>
                      <td className="pw-audit-balance text-right" data-label="Saldo">
                        {tx.balanceAfter !== null && tx.balanceAfter !== undefined
                          ? formatCOP(tx.balanceAfter)
                          : '—'}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TOP-UP MODAL                                                           */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showRecharge && (
          <div className="pw-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeRecharge()}>
            <motion.div
              className="pw-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              {rechargeStep !== 'confirming' && (
                <button className="pw-modal-close" onClick={closeRecharge}>✕</button>
              )}

              {/* ── STEP: SELECT AMOUNT ── */}
              {rechargeStep === 'select' && (
                <div className="pw-modal-inner">
                  <div className="pw-modal-head">
                    <div className="pw-modal-head-icon"><CreditCard size={22} /></div>
                    <div>
                      <h2>Recargar saldo operativo</h2>
                      <p>Elige cuánto quieres agregar · Pago seguro vía Stripe</p>
                    </div>
                  </div>

                  <p className="pw-amount-label">Montos rápidos (COP)</p>
                  <div className="pw-preset-grid">
                    {PRESET_AMOUNTS.map(v => (
                      <button
                        key={v}
                        className={`pw-preset-btn ${selectedAmount === v ? 'selected' : ''}`}
                        onClick={() => { setSelectedAmount(v); setCustomAmount(''); }}
                      >
                        {formatCOP(v)}
                        {selectedAmount === v && <CheckCircle2 size={14} className="preset-check" />}
                      </button>
                    ))}
                  </div>

                  <div className="pw-divider"><span>o ingresa un valor</span></div>

                  <div className="pw-custom-input-wrap">
                    <span className="pw-input-prefix">$</span>
                    <input
                      type="number"
                      className="pw-custom-input"
                      placeholder="Ej: 75000"
                      value={customAmount}
                      min="10000"
                      onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                    />
                    <span className="pw-input-suffix">COP</span>
                  </div>

                  {(selectedAmount || Number(customAmount) > 0) && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="pw-amount-summary">
                      <span>Monto a recargar</span>
                      <strong>{formatCOP(selectedAmount ?? Number(customAmount))}</strong>
                    </motion.div>
                  )}

                  <button
                    className={`pw-proceed-btn ${loadingIntent ? 'loading' : ''}`}
                    disabled={(!selectedAmount && !Number(customAmount)) || loadingIntent}
                    onClick={handleProceedToCheckout}
                  >
                    {loadingIntent ? (
                      <><Loader2 size={16} className="spin" /> Preparando pago...</>
                    ) : (
                      <><Lock size={15} /> Continuar al pago</>
                    )}
                  </button>

                  <p className="pw-modal-footer-note">
                    <ShieldCheck size={12} />
                    Pago procesado por <strong>Stripe</strong>. No almacenamos datos de tarjeta.
                  </p>
                </div>
              )}

              {/* ── STEP: STRIPE CHECKOUT ── */}
              {rechargeStep === 'checkout' && stripeClientSecret && (
                <div className="pw-modal-inner">
                  <div className="pw-modal-head">
                    <div className="pw-modal-head-icon stripe-blue"><Lock size={20} /></div>
                    <div>
                      <h2>Pago seguro</h2>
                      <p className="checkout-amount-preview">{formatCOP(selectedAmount ?? 0)} COP</p>
                    </div>
                  </div>
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret: stripeClientSecret,
                      appearance: { theme: 'stripe', variables: { colorPrimary: '#6366f1', borderRadius: '10px' } },
                    }}
                  >
                    <StripeCardForm
                      clientSecret={stripeClientSecret}
                      onSuccess={handleStripeSuccess}
                      onError={() => setRechargeStep('error')}
                      onBack={() => setRechargeStep('select')}
                      isConfirming={rechargeStep === ('confirming' as any)}
                    />
                  </Elements>
                </div>
              )}

              {/* ── STEP: CONFIRMING ── */}
              {rechargeStep === 'confirming' && (
                <div className="pw-modal-inner pw-status-screen">
                  <div className="pw-status-icon confirming-anim"><Loader2 size={48} className="spin" /></div>
                  <h2>Confirmando recarga...</h2>
                  <p>Verificando con Stripe y acreditando tu saldo operativo.</p>
                  <div className="pw-confirming-steps">
                    {['Verificando con Stripe', 'Validando seguridad', 'Acreditando saldo'].map((s, i) => (
                      <div key={i} className="pw-conf-step"><Loader2 size={12} className="spin" /><span>{s}</span></div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── STEP: SUCCESS ── */}
              {rechargeStep === 'success' && (
                <div className="pw-modal-inner pw-status-screen">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    className="pw-status-icon success-icon"
                  >
                    <CheckCircle2 size={60} />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h2>¡Saldo recargado!</h2>
                    <p>{formatCOP(selectedAmount ?? 0)} <strong>agregados</strong> a tu balance operativo.</p>
                    <p className="success-sub">Ya puedes seguir recibiendo reservas en JUSTME.</p>
                  </motion.div>
                  <div className="pw-success-balance">
                    <span>Nuevo saldo</span>
                    <strong>{formatCOP(balance ?? 0)}</strong>
                  </div>
                </div>
              )}

              {/* ── STEP: ERROR ── */}
              {rechargeStep === 'error' && (
                <div className="pw-modal-inner pw-status-screen">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="pw-status-icon error-icon">
                    <XCircle size={56} />
                  </motion.div>
                  <h2>Algo salió mal</h2>
                  <p>No se pudo completar el pago. Verifica tu tarjeta e intenta de nuevo.</p>
                  <button className="pw-retry-btn" onClick={() => setRechargeStep('select')}>
                    <RefreshCw size={15} /> Intentar de nuevo
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ALL TRANSACTIONS MODAL                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAllTx && (
          <div className="pw-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAllTx(false)}>
            <motion.div
              className="pw-modal pw-modal-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
            >
              <button className="pw-modal-close" onClick={() => setShowAllTx(false)}>✕</button>
              <div className="pw-modal-inner">
                <div className="pw-modal-head">
                  <div className="pw-modal-head-icon"><History size={20} /></div>
                  <div>
                    <h2>Historial completo</h2>
                    <p>{transactions.length} movimientos</p>
                  </div>
                </div>
                <div className="pw-audit-table-wrap pw-all-tx-list">
                  <table className="pw-audit-table">
                    <thead>
                      <tr>
                        <th className="pw-th-date">Fecha</th>
                        <th className="pw-th-desc">Descripción</th>
                        <th className="pw-th-price text-right">Precio servicio</th>
                        <th className="pw-th-amount text-right">Comisión / Monto</th>
                        <th className="pw-th-balance text-right">Saldo tras mov.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => {
                        const credit = isCredit(tx.type);
                        const commission = tx.type === 'COMMISSION';
                        return (
                          <tr key={tx.id} className={`pw-audit-row ${credit ? 'row-credit' : commission ? 'row-commission' : ''}`}>
                            <td className="pw-audit-date" data-label="Fecha">
                              {new Date(tx.createdAt).toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </td>
                            <td className="pw-audit-desc" data-label="Descripción">
                              <div className="pw-audit-desc-inner">
                                <div className={`pw-audit-dot ${credit ? 'dot-green' : commission ? 'dot-purple' : 'dot-gray'}`} />
                                <div>
                                  <span className="pw-audit-type">{txTypeLabel(tx.type)}</span>
                                  {tx.relatedBookingId && <span className="pw-audit-meta">Reserva #{tx.relatedBookingId}</span>}
                                </div>
                              </div>
                            </td>
                            <td className="pw-audit-service text-right" data-label="Precio servicio">
                              {tx.serviceAmount ? formatCOP(tx.serviceAmount) : '—'}
                            </td>
                            <td className={`pw-audit-amount text-right ${credit ? 'amount-credit' : 'amount-debit'}`} data-label="Monto">
                              {credit ? '+' : ''}{formatCOP(tx.amount)}
                              {commission && tx.commissionPercentage && (
                                <span className="pw-audit-pct">({(Number(tx.commissionPercentage) * 100).toFixed(0)}%)</span>
                              )}
                            </td>
                            <td className="pw-audit-balance text-right" data-label="Saldo">
                              {tx.balanceAfter !== null && tx.balanceAfter !== undefined ? formatCOP(tx.balanceAfter) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}