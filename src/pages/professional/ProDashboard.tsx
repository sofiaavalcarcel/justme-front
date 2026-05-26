import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Star, TrendingUp, Clock, AlertCircle, MapPin, Scissors, Check, X } from 'lucide-react';
import { Card, Avatar, Badge, Button, Tabs } from '../../components/ui';
import { VerificationBanner } from '../../components/ui/VerificationBanner';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppointments, type Appointment } from '../../hooks/useAppointments';
import { useProfessionalStats } from '../../hooks/useProfessionalStats';
import './ProDashboard.css';

export default function ProDashboard() {
  const { t, i18n } = useTranslation();
  const { switchRole, verificationStatus, professionalId } = useAuth();
  const navigate = useNavigate();
  const [apptTab, setApptTab] = useState('upcoming');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  
  const formatCOP = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(num || 0).replace('COP', '$');
  };

  // Custom Hooks for Data Management
  const { appointments, updatingId, updateStatus } = useAppointments(professionalId);
  const { stats, loading: statsLoading, refetch } = useProfessionalStats(professionalId);

  // Derived Data
  const { upcoming, past, today } = useMemo(() => {
    const todayStr = new Date().toDateString();
    return {
      upcoming: appointments.filter(a => a.status === 'pending'),
      past: appointments.filter(a => a.status !== 'pending'),
      today: appointments.filter(a => {
        const d = new Date(a.date);
        return d.toDateString() === todayStr;
      })
    };
  }, [appointments]);

  const apptList = apptTab === 'upcoming' ? upcoming : past;
  
  // Pagination Logic
  const totalPages = Math.ceil(apptList.length / itemsPerPage);
  const paginatedAppts = apptList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [apptTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const walletBalance = stats?.walletBalance || 0;

  const dashStats = [
    { 
      label: t('proDash.stats.todayBookings'), 
      value: String(today.length), 
      icon: <Calendar size={20} />, 
      color: 'var(--primary-500)', 
      bg: 'var(--primary-50)' 
    },
    { 
      label: t('proDash.stats.weeklyEarnings'), 
      value: formatCOP(stats?.weeklyEarnings || 0), 
      icon: <DollarSign size={20} />, 
      color: 'var(--success-500)', 
      bg: 'var(--success-50)' 
    },
    { 
      label: t('proDash.stats.rating'), 
      value: String(stats?.averageRating?.toFixed(1) || '5.0'), 
      icon: <Star size={20} />, 
      color: '#fbbf24', 
      bg: '#fbbf2415' 
    },
    { 
      label: t('proDash.walletBalance', 'Saldo Disponible'), 
      value: formatCOP(walletBalance), 
      icon: <DollarSign size={20} />, 
      color: 'var(--success-500)', 
      bg: 'var(--success-50)' 
    },
  ];

  const statusColors: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'default'> = {
    pending: 'warning', 
    confirmed: 'success', 
    completed: 'default', 
    cancelled: 'error',
  };


  return (
    <div className="pro-dash">
      <VerificationBanner status={verificationStatus} />

      <div className="pro-dash-header">
        <div>
          <h1>{t('proDash.title')}</h1>
          <p className="dash-date">{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => { switchRole('user'); navigate('/user'); }}>
          {t('proDash.switchBtn')}
        </Button>
      </div>

      {walletBalance < 5 && !statsLoading && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="dash-alert">
          <AlertCircle size={20} />
          <div>
            <strong>{t('proDash.lowBalance')}</strong>
            <p>{t('proDash.balanceMsg', { balance: walletBalance.toFixed(2) })}</p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="dash-stats">
        {dashStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card variant="default" padding="md" className="stat-card">
              <div className="stat-icon" style={{ color: s.color, background: s.bg }}>{s.icon}</div>
              <div className="stat-content">
                <span className="stat-value">{s.value}</span>
                <span className="stat-lbl">{s.label}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Earnings Overview */}
      <Card variant="gradient" padding="lg" className="earnings-overview-card">
        <div className="earnings-top">
          <div>
            <p className="earnings-label">{t('proDash.earningsOverview', 'Ganancias de este mes')}</p>
            <h2 className="earnings-amount">{formatCOP(stats?.monthlyEarnings || 0)}</h2>
          </div>
          <div className="earnings-trend">
            <TrendingUp size={16} /> {stats?.monthlyTrend || 0}%
          </div>
        </div>
        
        {statsLoading ? (
          <div className="earnings-skeleton" style={{ height: '150px', display: 'flex', alignItems: 'flex-end', gap: '8px', opacity: 0.5 }}>
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', height: `${Math.max(20, Math.random() * 100)}%`, borderRadius: '4px' }} />
            ))}
          </div>
        ) : (!stats?.weeklyEarningsByDay || !Array.isArray(stats.weeklyEarningsByDay) || stats.weeklyEarningsByDay.length === 0 || Math.max(...stats.weeklyEarningsByDay) === 0) ? (
          <div style={{ height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
            {t('proDash.noData', 'No hay datos de ingresos disponibles para esta semana.')}
          </div>
        ) : (
          <>
            <div className="earnings-bar-container">
              {(() => {
                const earnings = Array.isArray(stats.weeklyEarningsByDay) ? stats.weeklyEarningsByDay : [0,0,0,0,0,0,0];
                const maxVal = Math.max(...earnings, 1);
                return earnings.map((h: number, i: number) => {
                  const relativeHeight = (h / maxVal) * 100;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)', opacity: h > 0 ? 1 : 0 }}>{formatCOP(h)}</span>
                      <motion.div 
                         className="earnings-bar" 
                         style={{ width: '100%' }}
                         initial={{ height: 0 }} 
                         animate={{ height: `${relativeHeight}%` }} 
                         transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }} 
                      />
                    </div>
                  );
                });
              })()}
            </div>
            <div className="earnings-days">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
            </div>
          </>
        )}
      </Card>

      {/* Appointments Section */}
      <section className="pro-all-appts">
        <div className="pro-all-appts-header">
          <h2>{t('proDash.allAppointments')}</h2>
          <span className="pro-appt-count">{appointments.length} {t('proDash.totalLabel')}</span>
        </div>
        <Tabs
          tabs={[
            { id: 'upcoming', label: `${t('proDash.upcomingAppts')} (${upcoming.length})` },
            { id: 'past', label: `${t('proDash.pastAppts')} (${past.length})` },
          ]}
          onChange={setApptTab}
        />
        <div className="pro-appts-list">
          {paginatedAppts.length > 0 ? (
            paginatedAppts.map((appt: Appointment, i: number) => (
              <motion.div key={appt.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card variant="default" padding="md" className="pro-appt-row">
                  <div className="pro-appt-client">
                    <Avatar src={appt.clientAvatar} name={appt.clientName} size="sm" />
                    <div className="pro-appt-client-info">
                      <span className="pro-appt-client-name">{appt.clientName}</span>
                      <span className="pro-appt-svc"><Scissors size={12} /> {appt.serviceName}</span>
                    </div>
                  </div>
                  <div className="pro-appt-datetime">
                    <span className="pro-appt-date">
                      <Calendar size={13} /> {(() => {
                        const [y, m, d] = appt.date.split('-').map(Number);
                        return new Date(y, m - 1, d).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' });
                      })()}
                    </span>
                    <span className="pro-appt-time"><Clock size={13} /> {appt.startTime}</span>
                  </div>
                  <div className="pro-appt-loc">
                    <MapPin size={13} />
                    <span>{appt.locationType === 'home' ? t('proDash.homeService') : t('proDash.atStudio')}</span>
                  </div>
                  <div className="pro-appt-status-price">
                    <Badge variant={statusColors[appt.status] || 'primary'} size="sm">
                      {String(t(`appointments.status.${appt.status}`, appt.status))}
                    </Badge>
                    {appt.price > 0 && <span className="pro-appt-price">{formatCOP(appt.price)}</span>}
                  </div>

                  {appt.status === 'pending' && (
                    <div className="pro-appt-actions" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', marginTop: 'var(--space-2)', borderTop: '1px solid var(--neutral-100)', paddingTop: 'var(--space-4)' }}>
                      <button 
                        onClick={() => updateStatus(appt.id, 'confirmed')}
                        disabled={updatingId === appt.id}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(90deg, #f04438 0%, #f79009 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '100px',
                          fontWeight: '700',
                          fontSize: 'var(--text-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(240, 68, 56, 0.2)',
                          opacity: updatingId === appt.id ? 0.7 : 1
                        }}
                      >
                        <Check size={16} /> Confirmar
                      </button>
                      
                      <button 
                        onClick={() => updateStatus(appt.id, 'cancelled')}
                        disabled={updatingId === appt.id}
                        style={{
                          flex: 1,
                          background: 'none',
                          border: 'none',
                          color: '#f04438',
                          fontWeight: '600',
                          fontSize: 'var(--text-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={16} /> Cancelar
                      </button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="pro-appts-empty">
              <Calendar size={36} style={{ opacity: 0.3 }} />
              <p>{apptTab === 'upcoming' ? t('proDash.noAppts') : t('proDash.noPastAppts')}</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pro-pagination">
              <button 
                disabled={currentPage === 1} 
                onClick={() => {
                  setCurrentPage(p => p - 1);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="pagination-btn"
              >
                Anterior
              </button>
              <div className="pagination-pages">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i} 
                    className={`pagination-dot ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPage(i + 1);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                  />
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => {
                  setCurrentPage(p => p + 1);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="pagination-btn"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Reviews (Placeholder or from Stats) */}
      <div className="dash-grid">
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <h2>{t('proDash.recentReviews')}</h2>
            <Button size="sm" variant="ghost" onClick={() => navigate('/professional/reviews')}>{t('userHome.seeAll')}</Button>
          </div>
          <div className="dash-list">
            {!stats?.averageRating ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-400)' }}>
                <Star size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
                <p style={{ margin: 0, fontWeight: 600 }}>{t('sharedPages.pro.noRev')}</p>
              </div>
            ) : (
              <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--neutral-500)' }}>
                Visualiza tus reseñas en la sección dedicada.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
