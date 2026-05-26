import { motion } from 'framer-motion';
import { Users, Star, Award, ChevronRight, Activity, CalendarDays, Loader } from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useProfessionalStats } from '../../hooks/useProfessionalStats';
import './ProAnalytics.css';

export default function ProAnalytics() {
  const { t } = useTranslation();
  const { professionalId } = useAuth();
  
  const { stats, loading } = useProfessionalStats(professionalId);
  
  const formatCOP = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(num || 0).replace('COP', '$');
  };

  if (loading) {
    return (
      <div className="pro-analytics" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
      </div>
    );
  }

  // Fallbacks if data is missing
  const s = stats || ({} as any);
  const barHeights = s.weeklyBookingsByDay || [0, 0, 0, 0, 0, 0, 0];
  
  // Calculate relative height for bars (max height = 100%)
  const maxBar = Math.max(...barHeights, 1);
  const relativeHeights = barHeights.map((h: number) => (h / maxBar) * 100);
  const daysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const metrics = [
    { label: t('proAnalytics.metrics.bookings'), value: s.totalBookings || 0, icon: <CalendarDays size={18} />, color: 'var(--primary-500)' },
    { label: t('proAnalytics.metrics.completion'), value: `${s.completionRate || 0}%`, icon: <Activity size={18} />, color: 'var(--success-500)' },
    { label: t('proAnalytics.metrics.clients'), value: s.totalClients || 0, icon: <Users size={18} />, color: 'var(--accent-500)' },
    { label: t('proAnalytics.metrics.rating'), value: Number(s.averageRating || s.rating || 0).toFixed(1), icon: <Star size={18} />, color: '#fbbf24' },
  ];

  return (
    <div className="pro-analytics">
      <div className="pa-header">
        <h1>{t('proAnalytics.title')}</h1>
        <p>{t('proAnalytics.subtitle')}</p>
      </div>

      {/* Incentive Program Card */}
      {s.incentive ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="gradient" padding="lg" className="pa-incentive-card">
            <div className="pa-inc-top">
              <div>
                <Badge variant="primary" size="sm">{t('proAnalytics.milestone')}</Badge>
                <h2>{s.incentive.title}</h2>
                <p dangerouslySetInnerHTML={{ __html: s.incentive.description }} />
              </div>
              <Award size={48} className="pa-inc-icon" />
            </div>
            
            <div className="pa-inc-progress">
              <div className="pa-prog-text">
                <span>{t('proAnalytics.completed', { count: s.incentive.currentServices || 0 })}</span>
                <span>{t('proAnalytics.toGo', { count: Math.max(0, s.incentive.targetServices - (s.incentive.currentServices || 0)) })}</span>
              </div>
              <div className="pa-prog-track">
                <motion.div 
                  className="pa-prog-fill" 
                  initial={{ width: 0 }} 
                  animate={{ width: `${Math.min(100, ((s.incentive.currentServices || 0) / s.incentive.targetServices) * 100)}%` }} 
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.8, y: 0 }}>
          <Card variant="gradient" padding="lg" className="pa-incentive-card">
            <div className="pa-inc-top">
              <div>
                <Badge variant="primary" size="sm">{t('proAnalytics.milestone')}</Badge>
                <h2>{t('proAnalytics.superPro')}</h2>
                <p dangerouslySetInnerHTML={{ __html: t('proAnalytics.unlockMsg') }} />
              </div>
              <Award size={48} className="pa-inc-icon" />
            </div>
            <div className="pa-inc-progress">
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--neutral-600)' }}>No hay programas activos de recompensas por el momento.</p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Key Metrics */}
      <div className="pa-metrics-grid">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i }}>
            <Card variant="default" padding="md" className="pa-metric-card">
              <div className="pa-metric-icon" style={{ color: m.color, background: `${m.color}15` }}>{m.icon}</div>
              <div className="pa-metric-val">{m.value}</div>
              <div className="pa-metric-bottom">
                <span className="pa-metric-lbl">{m.label}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="pa-bottom-grid">
        {/* Weekly Chart */}
        <Card variant="default" padding="lg" className="pa-chart-card">
          <div className="pa-card-header">
            <div>
              <h3>{t('proAnalytics.thisWeek')}</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', marginTop: '2px' }}>
                Ingresos este mes: {formatCOP(s.monthlyEarnings || s.totalRevenue || 0)} <span style={{ color: (s.monthlyTrend || 0) >= 0 ? 'var(--success-500)' : 'var(--error-500)' }}>({(s.monthlyTrend || 0) > 0 ? '+' : ''}{s.monthlyTrend || 0}%)</span>
              </p>
            </div>
            <Button size="sm" variant="ghost">{t('proAnalytics.viewDetails')} <ChevronRight size={14} /></Button>
          </div>
          <div className="pa-chart-area">
            <div className="pa-bars">
              {relativeHeights.map((h: number, i: number) => (
                <div key={i} className="pa-bar-col">
                  <motion.div 
                    className="pa-bar-fill" 
                    initial={{ height: 0 }} 
                    animate={{ height: `${h}%` }} 
                    transition={{ duration: 0.5, delay: 0.2 + (i * 0.05) }} 
                  />
                  <span className="pa-bar-lbl">{daysLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Top Services */}
        <Card variant="default" padding="lg">
          <h3>{t('proAnalytics.topServices')}</h3>
          <div className="pa-services-list">
            {!s.topServices || s.topServices.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-400)', textAlign: 'center', padding: '2rem 0' }}>
                No hay servicios suficientes para mostrar.
              </p>
            ) : (
              s.topServices.map((svc: any, i: number) => (
                <div key={svc.name || i} className="pa-svc-row">
                  <div className="pa-svc-rank">{i + 1}</div>
                  <div className="pa-svc-info">
                    <span className="pa-svc-name">{svc.name}</span>
                    <span className="pa-svc-bookings">{t('proAnalytics.svcBookings', { count: svc.count || svc.bookings || 0 })}</span>
                  </div>
                  <div className="pa-svc-rev">{formatCOP(svc.revenue || 0)}</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
