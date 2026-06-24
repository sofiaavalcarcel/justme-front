import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, Search, Calendar, Clock, MapPin, Scissors,
  CheckCircle, Check, XCircle, Info, CreditCard, Wallet,
  User, Phone, Mail, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppointments, type Appointment } from '../../hooks/useAppointments';
import { Card, Badge, Button, Avatar, Modal } from '../../components/ui';
import './ProAppointments.css';

export default function ProAppointments() {
  const { professionalId } = useAuth();
  const { t } = useTranslation();
  const {
    appointments,
    loading,
    updatingId,
    updateStatus,
    refetch
  } = useAppointments(professionalId);

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const filteredAppointments = appointments.filter(app => {
    const isUpcoming = ['pending', 'confirmed'].includes(app.status);
    const matchesTab = activeTab === 'upcoming' ? isUpcoming : !isUpcoming;
    const matchesSearch = app.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime || '00:00'}`).getTime();
    const dateB = new Date(`${b.date}T${b.startTime || '00:00'}`).getTime();
    return activeTab === 'upcoming' ? dateA - dateB : dateB - dateA;
  });

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">{t('appointments.status.pending', 'Pendiente')}</Badge>;
      case 'confirmed': return <Badge variant="success">{t('appointments.status.confirmed', 'Confirmada')}</Badge>;
      case 'completed': return <Badge variant="primary">{t('appointments.status.completed', 'Finalizada')}</Badge>;
      case 'cancelled': return <Badge variant="error">{t('appointments.status.cancelled', 'Cancelada')}</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPaymentIcon = (method?: string) => {
    if (!method) return <CreditCard size={14} />;
    if (method.toLowerCase().includes('wallet')) return <Wallet size={14} />;
    return <CreditCard size={14} />;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T12:00:00');
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    } catch { return dateStr; }
  };

  return (
    <div className="pro-appointments-page">
      <div className="pa-header">
        <div>
          <h1>{t('proDash.appointments', 'Citas y Reservas')}</h1>
          <p>{t('proDash.appointmentsSubtitle', 'Gestiona tus servicios y clientes')}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw size={16} className={loading ? 'spin-icon' : ''} />}
          onClick={() => refetch()}
        >
          {t('common.refresh', 'Actualizar')}
        </Button>
      </div>

      <div className="pa-controls">
        <div className="pa-tabs">
          <button
            className={`pa-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            {t('appointments.upcoming', 'Próximas')}
            <span className="pa-tab-count">
              {appointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length}
            </span>
          </button>
          <button
            className={`pa-tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            {t('appointments.past', 'Historial')}
          </button>
        </div>

        <div className="pa-search">
          <Search size={18} />
          <input
            type="text"
            placeholder={t('common.search', 'Buscar...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="pa-content">
        {loading && appointments.length === 0 ? (
          <div className="pa-loading">
            <RefreshCw size={40} className="spin-icon" />
            <p>{t('common.loading', 'Cargando citas...')}</p>
          </div>
        ) : sortedAppointments.length === 0 ? (
          <div className="pa-empty">
            <Calendar size={60} />
            <h3>{activeTab === 'upcoming' ? t('proDash.noUpcomingBookings', 'No hay citas próximas') : t('proDash.noPastBookings', 'No hay historial de citas')}</h3>
            <p>{t('proDash.emptyAppointmentsDesc', 'Tus nuevas reservas aparecerán aquí automáticamente.')}</p>
          </div>
        ) : (
          <div className="pa-list">
            <AnimatePresence mode="popLayout">
              {sortedAppointments.map((app) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`pa-item-card status-${app.status}`}>
                    <div className="pa-item-main">
                      <div className="pa-item-left">
                        <Avatar src={app.clientAvatar} name={app.clientName} size="lg" />
                        <div className="pa-client-info">
                          <h4>{app.clientName}</h4>
                          <div className="pa-svc-badge">
                            <Scissors size={12} />
                            <span>{app.serviceName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pa-item-mid">
                        <div className="pa-detail">
                          <Calendar size={14} />
                          <span>{formatDate(app.date)}</span>
                        </div>
                        <div className="pa-detail">
                          <Clock size={14} />
                          <span>{app.startTime}</span>
                        </div>
                        <div className="pa-detail payment-info">
                          {getPaymentIcon(app.paymentMethod)}
                          <span>{app.paymentMethod || 'Credit Card'}</span>
                          <Badge variant={app.paymentStatus === 'completed' ? 'success' : 'warning'} size="sm">
                            {app.paymentStatus}
                          </Badge>
                        </div>
                      </div>

                      <div className="pa-item-right">
                        <div className="pa-price">
                          ${new Intl.NumberFormat('es-CO').format(app.price)}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {getStatusBadge(app.status)}
                          <button className="pa-detail-btn" onClick={() => setSelectedAppt(app)}>
                            <Info size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {activeTab === 'upcoming' && (
                      <div className="pa-item-actions">
                        {app.status === 'pending' && (
                          <Button
                            variant="accent"
                            size="sm"
                            icon={<CheckCircle size={16} />}
                            loading={updatingId === app.id}
                            onClick={() => updateStatus(app.id, 'confirmed')}
                          >
                            {t('common.confirm', 'Confirmar')}
                          </Button>
                        )}
                        {app.status === 'confirmed' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<Check size={16} />}
                            loading={updatingId === app.id}
                            onClick={() => updateStatus(app.id, 'completed')}
                          >
                            {t('common.complete', 'Finalizar')}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="btn-cancel"
                          icon={<XCircle size={16} />}
                          loading={updatingId === app.id}
                          onClick={() => {
                            if (window.confirm(t('appointments.cancelConfirm', '¿Estás seguro de que deseas cancelar esta cita?'))) {
                              updateStatus(app.id, 'cancelled');
                            }
                          }}
                        >
                          {t('common.cancel', 'Cancelar')}
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Modales
        selectedAppt={selectedAppt}
        onClose={() => setSelectedAppt(null)}
        formatDate={formatDate}
        t={t}
      />
    </div>
  );
}

function Modales({ selectedAppt, onClose, formatDate, t }: any) {
  if (!selectedAppt) return null;

  return (
    <Modal
      isOpen={!!selectedAppt}
      onClose={onClose}
      title={t('booking.detailTitle', 'Detalle de la Cita')}
      size="lg"
    >
      <div className="appt-detail-modal">
        <div className="adm-section">
          <div className="adm-header">
            <Avatar src={selectedAppt.clientAvatar} name={selectedAppt.clientName} size="xl" />
            <div className="adm-client-meta">
              <h3>{selectedAppt.clientName}</h3>
              <p className="adm-badge">{selectedAppt.status.toUpperCase()}</p>
            </div>
          </div>
          <div className="adm-contact-grid">
            {selectedAppt.clientPhone && (
              <div className="adm-contact-item">
                <Phone size={16} />
                <span>{selectedAppt.clientPhone}</span>
              </div>
            )}
            {selectedAppt.clientEmail && (
              <div className="adm-contact-item">
                <Mail size={16} />
                <span>{selectedAppt.clientEmail}</span>
              </div>
            )}
          </div>
          {selectedAppt.clientBio && (
            <div className="adm-bio">
              <User size={16} />
              <p>{selectedAppt.clientBio}</p>
            </div>
          )}
        </div>

        <div className="adm-divider" />

        <div className="adm-section">
          <div className="adm-svc-info">
            <div className="adm-svc-icon"><Scissors size={20} /></div>
            <div>
              <h4>{selectedAppt.serviceName}</h4>
              {selectedAppt.serviceDescription && <p>{selectedAppt.serviceDescription}</p>}
            </div>
          </div>
          <div className="adm-details-grid">
            <div className="adm-detail-box">
              <Calendar size={16} />
              <div>
                <label>{t('common.date', 'Fecha')}</label>
                <p>{formatDate(selectedAppt.date)}</p>
              </div>
            </div>
            <div className="adm-detail-box">
              <Clock size={16} />
              <div>
                <label>{t('common.time', 'Hora')}</label>
                <p>{selectedAppt.startTime}</p>
              </div>
            </div>
            <div className="adm-detail-box">
              <MapPin size={16} />
              <div>
                <label>{t('common.location', 'Ubicación')}</label>
                <p>{selectedAppt.locationAddress || (selectedAppt.locationType === 'home' ? 'Home Service' : 'At Studio')}</p>
              </div>
            </div>
            <div className="adm-detail-box">
              <CreditCard size={16} />
              <div>
                <label>{t('common.payment', 'Pago')}</label>
                <p>{selectedAppt.paymentMethod} • ${new Intl.NumberFormat('es-CO').format(selectedAppt.price)}</p>
              </div>
            </div>
          </div>
        </div>

        {selectedAppt.raw?.notes && (
          <div className="adm-notes">
            <FileText size={16} />
            <div>
              <label>{t('common.notes', 'Notas del Cliente')}</label>
              <p>{selectedAppt.raw.notes}</p>
            </div>
          </div>
        )}

        <div className="adm-footer">
          <Button variant="outline" fullWidth onClick={onClose}>
            {t('common.close', 'Cerrar')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
