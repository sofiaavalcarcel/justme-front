import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Briefcase, CreditCard, TrendingUp, DollarSign, Activity,
  BarChart3, ShieldCheck, Loader, UserPlus, Calendar, Search,
  ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpRight, ArrowDownLeft,
  Tag,
} from 'lucide-react';
import { Card, Badge, Avatar, Button, Modal } from '../../components/ui';
import { useAdminStats } from '../../hooks/useAdminStats';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const {
    stats, analytics, activities, transactions, revenueChart, loading, error,
    activityMeta, transactionMeta, fetchActivities, fetchTransactions
  } = useAdminStats();

  const [txPage, setTxPage] = useState(1);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const [activityFilters, setActivityFilters] = useState({ type: '', startDate: '', endDate: '' });
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // ─── Category Requests state ─────────────────────────────────────────────────
  const [catRequests, setCatRequests] = useState<any[]>([]);
  const [, setCatLoading] = useState(false);
  const [,] = useState<number | null>(null);

  const fetchCatRequests = async () => {
    setCatLoading(true);
    try {
      const res = await apiClient.get('/admin/category-requests', { params: { status: 'pending' } });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCatRequests(list);
    } catch { /* silencioso */ }
    finally { setCatLoading(false); }
  };

  // ─── Professional Applications state ─────────────────────────────────────────
  const [proAppCount, setProAppCount] = useState(0);

  const fetchProAppCount = async () => {
    try {
      const res = await apiClient.get('/admin/professional-applications', { params: { status: 'pending' } });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setProAppCount(list.length);
    } catch { /* silencioso */ }
  };

  useEffect(() => { fetchCatRequests(); fetchProAppCount(); }, []);

  const growthStr = (v: number | undefined) =>
    v === undefined || v === null ? null : v >= 0 ? `+${v}%` : `${v}%`;

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

  const kpis = stats ? [
    { label: t('adminDash.totalUsers'), value: stats.totalUsers?.toLocaleString('es-CO') ?? '0', icon: <Users size={20} />, color: 'var(--primary-500)', bg: 'var(--primary-50)', change: growthStr(analytics?.monthlyGrowth) },
    { label: t('adminDash.professionals'), value: stats.totalProfessionals?.toLocaleString('es-CO') ?? '0', icon: <Briefcase size={20} />, color: 'var(--accent-500)', bg: 'var(--accent-100)', change: null },
    { label: t('adminDash.totalBookings'), value: stats.totalBookings?.toLocaleString('es-CO') ?? '0', icon: <Activity size={20} />, color: 'var(--success-500)', bg: 'var(--success-50)', change: growthStr(analytics?.bookingRate) },
    { label: t('adminDash.commissions'), value: `$${fmt(stats.commissionsCollected ?? 0)}`, icon: <CreditCard size={20} />, color: 'var(--success-500)', bg: 'var(--success-50)', change: null },
    { label: t('adminDash.activeServices'), value: stats.activeServices?.toLocaleString('es-CO') ?? '—', icon: <BarChart3 size={20} />, color: '#06b6d4', bg: '#06b6d415', change: null },
  ] : [];

  const handleTxPageChange = (newPage: number) => {
    setTxPage(newPage);
    fetchTransactions(newPage, 10);
  };

  const handleOpenModal = () => {
    setShowActivityModal(true);
    fetchActivities(1, 10, activityFilters);
  };

  const handleApplyFilters = () => {
    setModalPage(1);
    fetchActivities(1, 10, activityFilters);
  };

  if (error) {
    return (
      <div className="admin-dash" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: 12 }}>
        <ShieldCheck size={32} style={{ color: 'var(--error-500)', opacity: 0.6 }} />
        <p style={{ color: 'var(--error-500)', fontWeight: 500 }}>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dash" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <Loader size={32} className="spin" style={{ color: 'var(--primary-500)' }} />
      </div>
    );
  }

  return (
    <div className="admin-dash">
      <div className="admin-dash-header">
        <div>
          <h1>{t('adminDash.title')}</h1>
          <p className="admin-subtitle">{t('adminDash.subtitle')}</p>
        </div>
        <Badge variant="primary" size="md"><ShieldCheck size={14} /> Admin</Badge>
      </div>

      {/* Pending Professional Applications Alert */}
      {proAppCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: 12, color: 'var(--primary-700)'
          }}>
            <ShieldCheck size={20} style={{ color: 'var(--primary-500)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Solicitudes de Profesional pendientes</p>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
                Tienes {proAppCount} solicitud{proAppCount === 1 ? '' : 'es'} de usuarios que quieren convertirse en profesionales.
              </p>
            </div>
            <a href="/admin/professional-applications" style={{
              textDecoration: 'none', padding: '6px 12px', background: 'var(--primary-500)',
              color: '#fff', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap'
            }}>
              Revisar
            </a>
          </div>
        </motion.div>
      )}

      {/* Pending Category Requests Alert */}
      {catRequests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            background: 'var(--warning-50, #fefce8)', border: '1px solid var(--warning-200, #fef08a)',
            borderRadius: 12, color: 'var(--warning-800, #854d0e)'
          }}>
            <Tag size={20} style={{ color: 'var(--warning-500, #eab308)' }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>Solicitudes de categorías pendientes</p>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
                Tienes {catRequests.length} solicitud{catRequests.length === 1 ? '' : 'es'} de categorías esperando tu revisión.
              </p>
            </div>
            <a href="/admin/services" style={{
              textDecoration: 'none', padding: '6px 12px', background: 'var(--warning-500, #eab308)',
              color: '#fff', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600
            }}>
              Revisar
            </a>
          </div>
        </motion.div>
      )}

      {/* KPIs */}
      <div className="admin-kpis">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card variant="default" padding="md" className="admin-kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon" style={{ color: kpi.color, background: kpi.bg }}>{kpi.icon}</div>
                {kpi.change !== null && (
                  <span className="kpi-change" style={{ color: kpi.change && kpi.change.startsWith('+') ? 'var(--success-500)' : 'var(--neutral-400)' }}>
                    <TrendingUp size={13} /> {kpi.change}
                  </span>
                )}
              </div>
              <span className="kpi-value">{kpi.value}</span>
              <span className="kpi-label">{kpi.label}</span>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card variant="default" padding="lg" className="admin-chart-card">
        <div className="chart-header">
          <div>
            <h2>{t('adminDash.revenueSummary')}</h2>
            <p className="chart-subtitle">Últimos 12 meses · Comisiones cobradas</p>
          </div>
          <div className="chart-legend">
            <div className="legend-item"><span className="dot" style={{ backgroundColor: 'var(--success-500)' }} /> Comisiones</div>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-bars">
            {(() => {
              const maxRev = Math.max(...revenueChart.map(m => m.revenue), 1);
              return revenueChart.map((m, i) => {
                const h = Math.max((m.revenue / maxRev) * 100, m.revenue > 0 ? 5 : 1);
                const isHovered = hoveredBar === i;

                return (
                  <div key={i} className="chart-bar-group"
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}>
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="chart-tooltip"
                        >
                          <p className="tooltip-val">${m.revenue.toLocaleString()}</p>
                          <p className="tooltip-sub">{m.bookings} {t('sharedPages.pro.booking')}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.div className="chart-bar-wrapper">
                      <motion.div className="chart-bar"
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%`, backgroundColor: isHovered ? 'var(--success-600)' : 'var(--success-500)' }}
                        style={{ opacity: m.revenue === 0 ? 0.2 : 1 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 200 }} />
                    </motion.div>
                    <span className={`chart-label ${isHovered ? 'active' : ''}`}>{m.label}</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </Card>

      <div className="admin-grid">
        {/* Recent Activity */}
        <section>
          <div className="section-header">
            <h2>{t('adminDash.recentActivity')}</h2>
            <Button size="sm" variant="ghost" icon={<SlidersHorizontal size={14} />} onClick={handleOpenModal}>
              {t('adminDash.viewMore')}
            </Button>
          </div>
          <div className="admin-table">
            {activities.length === 0 ? (
              <div className="empty-msg">
                <Activity size={32} opacity={0.3} />
                {t('adminDash.noActivity')}
              </div>
            ) : activities.slice(0, 5).map((activity: any) => (
              <motion.div key={activity.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="admin-row">
                <div className={`activity-icon-wrapper ${activity.type ?? 'booking'}`}>
                  {activity.type === 'registration' ? <UserPlus size={18} /> :
                    activity.type === 'revenue' ? <DollarSign size={18} /> :
                      <Calendar size={18} />}
                </div>
                <div className="admin-row-info">
                  <p className="admin-row-name">
                    {activity.userName ?? activity.title}
                    <span className="row-time">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                  <p className="admin-row-detail">{activity.description}</p>
                </div>
                <Avatar src={activity.userAvatar} name={activity.userName || activity.title} size="xs" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <div className="section-header">
            <h2>{t('adminDash.recentTx')}</h2>
            <div className="pagination-small">
              <Button size="sm" variant="ghost" icon={<ChevronLeft size={16} />} disabled={txPage <= 1} onClick={() => handleTxPageChange(txPage - 1)} />
              <span className="page-indicator">{txPage} / {transactionMeta?.totalPages || 1}</span>
              <Button size="sm" variant="ghost" icon={<ChevronRight size={16} />} disabled={txPage >= (transactionMeta?.totalPages || 1)} onClick={() => handleTxPageChange(txPage + 1)} />
            </div>
          </div>
          <div className="admin-table">
            {transactions.length === 0 ? (
              <div className="empty-msg">
                <CreditCard size={32} opacity={0.3} />
                {t('adminDash.noTx')}
              </div>
            ) : transactions.map((t: any) => {
              const tType = (t.type || '').toUpperCase();
              const isPositive = tType === 'COMMISSION' || tType === 'TOP_UP' || tType === 'BONUS' || tType === 'PAYMENT';
              return (
                <motion.div key={t.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="admin-row">
                  <div className={`admin-transaction-icon ${t.type.toLowerCase()}`}>
                    {isPositive ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className="admin-row-info">
                    <p className="admin-row-name">{t.description ?? t('adminDash.transaction')}</p>
                    <p className="admin-row-detail">{new Date(t.createdAt ?? t.date).toLocaleDateString()} • <span style={{ textTransform: 'capitalize' }}>{t.type.toLowerCase().replace('_', ' ')}</span></p>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className={`admin-amount ${isPositive ? 'positive' : 'negative'}`}>
                      {isPositive ? '+' : '-'}${Math.abs(parseFloat(t.amount)).toLocaleString()}
                    </span>
                    <Badge variant={t.status === 'completed' ? 'success' : 'warning'} size="sm">{t.status}</Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>



      {/* Activities Full Modal */}
      <Modal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} title={t('adminDash.activitiesModalTitle')}>
        <div className="activity-modal-content">
          <div className="modal-filters">
            <div className="filter-group">
              <label>{t('adminDash.filterType')}</label>
              <select value={activityFilters.type} onChange={e => setActivityFilters({ ...activityFilters, type: e.target.value })}>
                <option value="">{t('adminDash.filterAll')}</option>
                <option value="registration">{t('adminDash.filterRegistrations')}</option>
                <option value="booking">{t('adminDash.filterBookings')}</option>
              </select>
            </div>
            <div className="filter-group">
              <label>{t('adminDash.startDate')}</label>
              <input type="date" value={activityFilters.startDate} onChange={e => setActivityFilters({ ...activityFilters, startDate: e.target.value })} />
            </div>
            <div className="filter-group">
              <label>{t('adminDash.endDate')}</label>
              <input type="date" value={activityFilters.endDate} onChange={e => setActivityFilters({ ...activityFilters, endDate: e.target.value })} />
            </div>
            <Button size="sm" onClick={handleApplyFilters} icon={<Search size={14} />} style={{ marginTop: 'auto' }}>Filtrar</Button>
          </div>

          <div className="modal-list">
            {activities.length === 0 ? (
              <div className="empty-msg">
                <Activity size={32} opacity={0.3} />
                {t('adminDash.noResults')}
              </div>
            ) : activities.map((activity: any) => (
              <div key={activity.id} className="modal-row">
                <div className={`activity-icon-wrapper small ${activity.type ?? 'booking'}`}>
                  {activity.type === 'registration' ? <UserPlus size={14} /> :
                    activity.type === 'revenue' ? <DollarSign size={14} /> :
                      <Calendar size={14} />}
                </div>
                <div className="modal-row-info">
                  <p className="modal-row-title">{activity.description}</p>
                  <p className="modal-row-time">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
                <Avatar src={activity.userAvatar} name={activity.userName || activity.title} size="xs" />
              </div>
            ))}
          </div>

          <div className="modal-pagination">
            <Button size="sm" variant="ghost" disabled={modalPage <= 1} onClick={() => { setModalPage(modalPage - 1); fetchActivities(modalPage - 1, 10, activityFilters); }}>Anterior</Button>
            <span>{modalPage} / {activityMeta?.totalPages || 1}</span>
            <Button size="sm" variant="ghost" disabled={modalPage >= (activityMeta?.totalPages || 1)} onClick={() => { setModalPage(modalPage + 1); fetchActivities(modalPage + 1, 10, activityFilters); }}>Siguiente</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

