import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Star, Clock, AlertCircle, Scissors, Wallet, ChevronRight } from 'lucide-react';
import { Card, Avatar, Button } from '../../components/ui';
import { VerificationBanner } from '../../components/ui/VerificationBanner';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppointments } from '../../hooks/useAppointments';
import { useProfessionalStats } from '../../hooks/useProfessionalStats';
import './ProDashboard.css';

// ── Donut Chart (pure SVG, no library) ────────────────────────────────────────
interface DonutSlice { value: number; color: string; label: string; }

function DonutChart({ slices, total }: { slices: DonutSlice[]; total: number }) {
  const r = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const segments = slices.map((s) => {
    const pct = total > 0 ? s.value / total : 0;
    const dash = pct * circumference;
    const offset = circumference - cumulative * circumference;
    cumulative += pct;
    return { ...s, dash, offset };
  });

  return (
    <svg viewBox="0 0 160 160" className="donut-svg">
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--neutral-100)" strokeWidth="22" />
      {total === 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--neutral-200)" strokeWidth="22" />
      ) : (
        segments.filter(seg => seg.value > 0).map((seg, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="22"
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={seg.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray 0.6s ease' }}
          />
        ))
      )}
      {/* Center text */}
      <text x={cx} y={cy - 6} textAnchor="middle" className="donut-center-num">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="donut-center-lbl">citas</text>
    </svg>
  );
}

// ── Gender detection ───────────────────────────────────────────────────────────
function getGreeting(name: string): string {
  const firstName = name.trim().split(' ')[0];
  const isFeminine = /a$/i.test(firstName);
  return isFeminine ? 'Bienvenida' : 'Bienvenido';
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ProDashboard() {
  const { t } = useTranslation();
  const { user, switchRole, verificationStatus, professionalId } = useAuth();
  const navigate = useNavigate();

  const { appointments, refetch } = useAppointments(professionalId);
  const { stats, loading: statsLoading, refetch: refetchStats } = useProfessionalStats(professionalId);

  // Derived Data
  const { upcoming } = useMemo(() => {
    return {
      upcoming: appointments.filter(a => a.status === 'pending'),
    };
  }, [appointments]);

  // Appointment status breakdown for donut chart
  const statusBreakdown = useMemo(() => {
    return {
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
    };
  }, [appointments]);

  const donutSlices: DonutSlice[] = [
    { value: statusBreakdown.pending,   color: 'var(--warning-400)',  label: 'En espera' },
    { value: statusBreakdown.confirmed, color: 'var(--primary-500)',  label: 'Confirmadas' },
    { value: statusBreakdown.completed, color: 'var(--success-500)',  label: 'Completadas' },
    { value: statusBreakdown.cancelled, color: 'var(--neutral-400)',  label: 'Canceladas' },
  ];

  useEffect(() => {
    const interval = setInterval(() => { 
      refetch();
      refetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch, refetchStats]);

  const walletBalance = stats?.walletBalance || 0;
  const userName = user ? `${user.name || ''} ${user.lastName || ''}`.trim() : '';
  const greeting = userName ? getGreeting(userName) : 'Bienvenido';
  const profilePhoto = user?.avatar || user?.photoUrl || undefined;

  // Recent Activity items
  const nextAppt = upcoming[0] || null;
  const lastReview = stats?.recentReviews?.[0] || null;
  const topService = stats?.topServices?.[0] || null;

  const formatCOP = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(num || 0).replace('COP', '$');
  };

  return (
    <div className="pro-dash">
      <VerificationBanner status={verificationStatus} />

      {/* Low Balance Alert */}
      {walletBalance < 5 && !statsLoading && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="dash-alert">
          <AlertCircle size={20} />
          <div>
            <strong>{t('proDash.lowBalance')}</strong>
            <p>{t('proDash.balanceMsg', { balance: walletBalance.toFixed(2) })}</p>
          </div>
        </motion.div>
      )}

      {/* ── 2-column layout ── */}
      <div className="pro-dash-grid">

        {/* ── LEFT COLUMN ── */}
        <div className="pro-dash-left">

          {/* Welcome Banner */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="welcome-banner">
            <div className="welcome-text">
              <h1 className="welcome-heading">{greeting}, {userName || 'Profesional'}!</h1>
              <p className="welcome-sub">{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <div className="welcome-actions">
                <button className="welcome-btn welcome-btn-primary" onClick={() => navigate('/professional/appointments')}>
                  <Calendar size={16} /> Ver citas
                </button>
                <button className="welcome-btn welcome-btn-secondary" onClick={() => navigate('/professional/wallet')}>
                  <Wallet size={16} /> Billetera
                </button>
              </div>
            </div>
            <div className="welcome-profile-col">
              <div className="welcome-avatar-wrap">
                <Avatar src={profilePhoto} name={userName} size="xl" className="welcome-avatar" />
              </div>
              <div className="welcome-rating">
                <div className="welcome-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={i < Math.round(stats?.averageRating || 5) ? '#fff' : 'none'} stroke="#fff" />
                  ))}
                </div>
                <span className="welcome-rating-val">{stats?.averageRating?.toFixed(1) || '5.0'}</span>
              </div>
            </div>
          </motion.div>

          {/* Donut Chart — Appointment Breakdown */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card variant="default" padding="lg" className="donut-card">
              <div className="donut-header">
                <h2>Estado de citas</h2>
                <span className="pro-appt-count">{appointments.length} total</span>
              </div>
              <div className="donut-body">
                <DonutChart slices={donutSlices} total={appointments.length} />
                <div className="donut-legend">
                  {donutSlices.map((s) => (
                    <div key={s.label} className="donut-legend-row">
                      <span className="donut-dot" style={{ background: s.color }} />
                      <span className="donut-legend-label">{s.label}</span>
                      <div className="donut-legend-bar-wrap">
                        <div
                          className="donut-legend-bar"
                          style={{
                            background: s.color,
                            width: appointments.length > 0 ? `${(s.value / appointments.length) * 100}%` : '0%',
                          }}
                        />
                      </div>
                      <span className="donut-legend-count">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN — My Activity ── */}
        <aside className="pro-dash-right">
          <div className="activity-feed">
            <div className="activity-feed-header">
              <h2>Mi actividad</h2>
            </div>

            {/* Next Appointment */}
            <div className="activity-section">
              <div className="activity-section-title">
                <span>Próxima cita</span>
                <button className="activity-view-all" onClick={() => navigate('/professional/appointments')}>Ver todas <ChevronRight size={14} /></button>
              </div>
              {nextAppt ? (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="activity-card">
                  <div className="activity-card-date">
                    <span className="activity-date-day">{new Date(nextAppt.date + 'T00:00:00').getDate()}</span>
                    <span className="activity-date-month">{new Date(nextAppt.date + 'T00:00:00').toLocaleDateString('es-CO', { month: 'short' })}</span>
                  </div>
                  <div className="activity-card-info">
                    <span className="activity-card-title">{nextAppt.serviceName}</span>
                    <span className="activity-card-sub"><Clock size={12} /> {nextAppt.startTime} · {nextAppt.clientName}</span>
                  </div>
                </motion.div>
              ) : (
                <div className="activity-empty"><Calendar size={20} /><span>Sin citas próximas</span></div>
              )}
            </div>

            {/* Recent Review */}
            <div className="activity-section">
              <div className="activity-section-title">
                <span>Última reseña</span>
                <button className="activity-view-all" onClick={() => navigate('/professional/reviews')}>Ver todas <ChevronRight size={14} /></button>
              </div>
              {lastReview ? (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="activity-card">
                  <Avatar src={lastReview.clientAvatar} name={lastReview.clientName || lastReview.userName || 'Cliente'} size="sm" />
                  <div className="activity-card-info">
                    <span className="activity-card-title">{lastReview.clientName || lastReview.userName || 'Cliente'}</span>
                    <div className="activity-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} fill={i < (lastReview.rating || 5) ? '#fbbf24' : 'none'} stroke={i < (lastReview.rating || 5) ? '#fbbf24' : 'var(--neutral-300)'} />
                      ))}
                    </div>
                    {lastReview.comment && <span className="activity-card-sub" style={{ fontStyle: 'italic' }}>"{lastReview.comment.slice(0, 60)}{lastReview.comment.length > 60 ? '…' : ''}"</span>}
                  </div>
                </motion.div>
              ) : (
                <div className="activity-empty"><Star size={20} /><span>Sin reseñas aún</span></div>
              )}
            </div>

            {/* Top Service */}
            <div className="activity-section">
              <div className="activity-section-title">
                <span>Servicio destacado</span>
              </div>
              {topService ? (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="activity-card">
                  <div className="activity-service-icon"><Scissors size={18} /></div>
                  <div className="activity-card-info">
                    <span className="activity-card-title">{topService.name}</span>
                    <span className="activity-card-sub">{topService.count} reservas · {formatCOP(topService.revenue)}</span>
                  </div>
                </motion.div>
              ) : (
                <div className="activity-empty"><Scissors size={20} /><span>Sin servicios aún</span></div>
              )}
            </div>

            {/* Quick stats recap */}
            <div className="activity-section">
              <div className="activity-section-title"><span>Resumen</span></div>
              <div className="activity-recap">
                <div className="recap-item">
                  <span className="recap-num">{stats?.completedBookings || 0}</span>
                  <span className="recap-lbl">Completadas</span>
                </div>
                <div className="recap-item">
                  <span className="recap-num">{stats?.totalClients || 0}</span>
                  <span className="recap-lbl">Clientes</span>
                </div>
                <div className="recap-item">
                  <span className="recap-num" style={{ color: '#fbbf24' }}>{stats?.averageRating?.toFixed(1) || '—'}</span>
                  <span className="recap-lbl">Rating</span>
                </div>
              </div>
            </div>

            {/* Switch role button */}
            <Button size="sm" variant="secondary" className="switch-role-btn" onClick={() => { switchRole('user'); navigate('/user'); }}>
              {t('proDash.switchBtn')}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
