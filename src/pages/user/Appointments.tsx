import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Loader, X, AlertTriangle } from 'lucide-react';
import { Tabs, Card, Avatar, Badge, Button } from '../../components/ui';
import { DatePicker } from '../../components/ui/DatePicker';
import { ClockPicker } from '../../components/ui/ClockPicker';
import { useBookings } from '../../hooks/useBookings';
import { bookingService } from '../../services/bookingService';
import { useNotification } from '../../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import './Appointments.css';

export default function Appointments() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('upcoming');
  const { bookings, loading, refetch } = useBookings();
  const { notify } = useNotification();

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Reschedule modal state
  const [rescheduleTarget, setRescheduleTarget] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Pagination Logic
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

  const upcoming = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  const past = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
  const fullList = activeTab === 'upcoming' ? upcoming : past;
  
  const totalPages = Math.ceil(fullList.length / itemsPerPage);
  const paginatedList = fullList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusColors: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'default'> = {
    pending: 'warning', confirmed: 'success', completed: 'default', cancelled: 'error',
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await bookingService.updateBookingStatus(cancelTarget.id, 'cancelled');
      notify('success', t('appointments.cancelledTitle'), t('appointments.cancelledMsg'));
      setCancelTarget(null);
      refetch();
    } catch (err: any) {
      notify('error', t('appointments.errorTitle'), err?.response?.data?.message || t('appointments.errorCancel'));
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) return;
    setRescheduleLoading(true);
    try {
      // Convert 12h to 24h for backend
      const time24 = convertTo24h(rescheduleTime);
      await bookingService.rescheduleBooking(rescheduleTarget.id, {
        date: rescheduleDate,
        startTime: time24,
      });
      notify('success', t('appointments.rescheduledTitle'), t('appointments.rescheduledMsg'));
      setRescheduleTarget(null);
      setRescheduleDate('');
      setRescheduleTime('');
      refetch();
    } catch (err: any) {
      notify('error', t('appointments.errorTitle'), err?.response?.data?.message || t('appointments.errorReschedule'));
    } finally {
      setRescheduleLoading(false);
    }
  };

  const convertTo24h = (time12h: string) => {
    if (!time12h) return '00:00';
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (modifier === 'PM' && hours !== '12') hours = String(parseInt(hours, 10) + 12);
    if (modifier === 'AM' && hours === '12') hours = '00';
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="appointments-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
      </div>
    );
  }

  return (
    <div className="appointments-page">
      <h1>{t('appointments.title')}</h1>
      <Tabs 
        tabs={[{ id: 'upcoming', label: `${t('appointments.upcoming')} (${upcoming.length})` }, { id: 'past', label: `${t('appointments.past')} (${past.length})` }]} 
        onChange={(tab) => { setActiveTab(tab); setCurrentPage(1); }} 
      />

      <div className="appointments-list">
        {paginatedList.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} style={{ color: 'var(--neutral-300)', marginBottom: '16px' }} />
            <p>{t('appointments.emptyState', { status: activeTab === 'upcoming' ? t('appointments.upcoming').toLowerCase() : t('appointments.past').toLowerCase() })}</p>
          </div>
        ) : (paginatedList.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card variant="default" padding="md" hover className="appointment-card">
              <div className="appt-top">
                <Avatar src={b.professionalAvatar} name={b.professionalName} size="md" />
                <div className="appt-info">
                  <h3>{b.professionalName}</h3>
                  <p className="appt-service">{b.service}</p>
                </div>
                <Badge variant={statusColors[b.status] || 'primary'} size="md">{t(`appointments.status.${b.status}`)}</Badge>
              </div>
              <div className="appt-details">
                {b.date && <span><Calendar size={14} /> {new Date(b.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>}
                <span><Clock size={14} /> {b.time}</span>
                <span><MapPin size={14} /> {b.locationType === 'home' ? t('appointments.home') : t('appointments.professional')}</span>
              </div>
              <div className="appt-bottom">
                <span className="appt-price">{formatCOP(b.price)}</span>
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <div className="appt-actions">
                    <Button size="sm" variant="ghost" onClick={() => {
                      setRescheduleTarget(b);
                      setRescheduleDate(b.date?.split('T')[0] || '');
                      setRescheduleTime('');
                    }}>{t('appointments.reschedule')}</Button>
                    <Button size="sm" variant="danger" onClick={() => setCancelTarget(b)}>{t('appointments.cancel')}</Button>
                  </div>
                )}
                {b.status === 'completed' && <Button size="sm" variant="secondary">{t('appointments.leaveReview')}</Button>}
              </div>
            </Card>
          </motion.div>
        )))}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pro-pagination" style={{ marginTop: 'var(--space-6)' }}>
            <button 
              disabled={currentPage === 1} 
              onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="pagination-btn"
            >
              Anterior
            </button>
            <div className="pagination-pages">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i} 
                  className={`pagination-dot ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="pagination-btn"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* ───── Cancel Confirmation Modal ───── */}
      <AnimatePresence>
        {cancelTarget && (
          <motion.div className="appt-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !cancelLoading && setCancelTarget(null)}>
            <motion.div
              className="appt-modal"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="appt-modal-close" onClick={() => setCancelTarget(null)} disabled={cancelLoading}><X size={20} /></button>
              <div className="appt-modal-icon cancel-icon">
                <AlertTriangle size={32} />
              </div>
              <h2>{t('appointments.cancelConfirmTitle')}</h2>
              <p className="appt-modal-desc">{t('appointments.cancelConfirmMsg', { service: cancelTarget.service, professional: cancelTarget.professionalName })}</p>
              
              <Card variant="glass" padding="md" className="appt-modal-summary">
                <div className="modal-summary-row"><Calendar size={14} /> <span>{cancelTarget.date && new Date(cancelTarget.date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>
                <div className="modal-summary-row"><Clock size={14} /> <span>{cancelTarget.time}</span></div>
              </Card>

              <div className="appt-modal-actions">
                <Button variant="ghost" onClick={() => setCancelTarget(null)} disabled={cancelLoading}>{t('appointments.keepAppt')}</Button>
                <Button variant="danger" onClick={handleCancel} loading={cancelLoading}>{t('appointments.confirmCancel')}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── Reschedule Modal ───── */}
      <AnimatePresence>
        {rescheduleTarget && (
          <motion.div className="appt-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !rescheduleLoading && setRescheduleTarget(null)}>
            <motion.div
              className="appt-modal appt-modal-lg"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="appt-modal-close" onClick={() => setRescheduleTarget(null)} disabled={rescheduleLoading}><X size={20} /></button>
              <div className="appt-modal-icon reschedule-icon">
                <Calendar size={32} />
              </div>
              <h2>{t('appointments.rescheduleTitle')}</h2>
              <p className="appt-modal-desc">{t('appointments.rescheduleMsg', { service: rescheduleTarget.service })}</p>

              <div className="reschedule-pickers">
                <div className="reschedule-picker-section">
                  <h4><Calendar size={14} /> {t('appointments.newDate')}</h4>
                  <DatePicker selectedDate={rescheduleDate} onSelect={setRescheduleDate} />
                </div>
                <div className="reschedule-picker-section">
                  <h4><Clock size={14} /> {t('appointments.newTime')}</h4>
                  <ClockPicker selectedDate={rescheduleDate} selectedTime={rescheduleTime} onSelect={setRescheduleTime} />
                </div>
              </div>

              <div className="appt-modal-actions">
                <Button variant="ghost" onClick={() => setRescheduleTarget(null)} disabled={rescheduleLoading}>{t('appointments.cancelBtn')}</Button>
                <Button onClick={handleReschedule} loading={rescheduleLoading} disabled={!rescheduleDate || !rescheduleTime}>{t('appointments.confirmReschedule')}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
