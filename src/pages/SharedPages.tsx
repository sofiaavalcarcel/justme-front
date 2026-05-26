// Shared pages for secondary views across all roles
// All data fetched from backend - no mock data
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button, Avatar, Rating } from '../components/ui';
import { Modal } from '../components/ui/Modal';
import { Home, DollarSign, Plus, Scissors, Edit, Image as ImageIcon, Trash2, Star, MapPin, Clock, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { bookingService } from '../services/bookingService';
import { professionalsService } from '../services/professionalsService';
import { walletService } from '../services/walletService';
import { userService } from '../services/userService';
import { useTranslation } from 'react-i18next';
import { MapView } from '../components/map/MapView';
import { Navigation } from 'lucide-react';

const pageStyle: React.CSSProperties = { padding: 'var(--space-4)', maxWidth: '960px', margin: '0 auto' };
const headerStyle: React.CSSProperties = { fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-5)' };
const listStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' };
const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-3)' };
const flexStyle: React.CSSProperties = { flex: 1 };
const subStyle: React.CSSProperties = { fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' };
const loadingCenter: React.CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' };

/* ============== PROFESSIONAL PAGES ============== */

export function ProBookingRequests() {
  const { professionalId } = useAuth();
  const [requests, setRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { t, i18n } = useTranslation();

  React.useEffect(() => {
    if (!professionalId) { setLoading(false); return; }
    bookingService.getProfessionalBookings(professionalId)
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data || []);
        setRequests(list.filter((b: any) => b.status === 'pending' || b.status === 'confirmed'));
      })
      .catch(e => { console.warn("Failed to fetch bookings", e); setRequests([]); })
      .finally(() => setLoading(false));
  }, [professionalId]);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.pro.bookingReqTitle')}</h1>
      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <Clock size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>{t('sharedPages.pro.noPendingBookings')}</p>
        </div>
      ) : (
        <div style={listStyle}>
          {requests.map((b: any, i: number) => {
            const clientName = b.client?.name || b.user?.name || 'Client';
            const svcName = b.service?.name || b.serviceName || b.service || 'Service';
            const bDate = new Date(b.scheduledAt || b.date || Date.now());
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card variant="default" padding="md">
                  <div style={rowStyle}>
                    <Avatar src={b.client?.avatar || b.professionalAvatar} name={clientName} size="md" />
                    <div style={flexStyle}>
                      <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{clientName}</p>
                      <p style={subStyle}>{svcName} • {bDate.toLocaleDateString(i18n.language)} at {b.time || bDate.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}</p>
                      <p style={subStyle}>{b.locationType === 'home' ? <><Home size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {t('sharedPages.pro.homeService')}</> : <><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {t('sharedPages.pro.atStudio')}</>} • ${b.price || 0}</p>
                    </div>
                    <Badge variant={b.status === 'confirmed' ? 'success' : 'warning'}>{b.status}</Badge>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ProCalendar() {
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { t } = useTranslation();

  React.useEffect(() => {
    bookingService.getProfessionalBookings()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data || []);
        setBookings(list);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 10 }, (_, i) => `${9 + i}:00`);

  const bookedSlots = useMemo(() => {
    return hours.map(h => {
      const hourNum = parseInt(h);
      return bookings.some((b: any) => {
        const bDate = new Date(b.scheduledAt || b.date || Date.now());
        return bDate.getHours() === hourNum && (b.status === 'confirmed' || b.status === 'pending');
      });
    });
  }, [bookings]);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.pro.calTitle')}</h1>
      <Card variant="default" padding="md">
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', overflowX: 'auto' }}>
          {days.map((d, i) => {
            const date = new Date();
            date.setDate(date.getDate() - date.getDay() + 1 + i);
            return (
              <div key={d} style={{ flex: 1, textAlign: 'center', minWidth: 80 }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' }}>{d}</p>
                <p style={{ fontWeight: 700 }}>{date.getDate()}</p>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-1)' }}>
          {hours.map((h, idx) => (
            <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--neutral-100)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', width: 50 }}>{h}</span>
              <div style={{ flex: 1, height: 36, background: bookedSlots[idx] ? 'var(--primary-50)' : 'transparent', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', paddingLeft: 'var(--space-2)' }}>
                {bookedSlots[idx] && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-600)', fontWeight: 600 }}>{t('sharedPages.pro.booking')}</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function ProEarnings() {
  const { professionalId } = useAuth();
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!professionalId) { setLoading(false); return; }
    walletService.getTransactions(professionalId)
      .then(data => setTransactions(Array.isArray(data) ? data : (data?.data || [])))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [professionalId]);

  const payments = transactions.filter(t => t.type === 'payment');
  const totalEarned = payments.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.pro.earnTitle')}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        {[{ label: t('sharedPages.pro.totalEarned'), val: `$${totalEarned.toFixed(2)}` }, { label: t('sharedPages.pro.transactions'), val: String(transactions.length) }].map(s => (
          <Card key={s.label} variant="default" padding="md">
            <p style={subStyle}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{s.val}</p>
          </Card>
        ))}
      </div>
      <h2 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>{t('sharedPages.pro.recentEarnings')}</h2>
      {payments.length === 0 ? (
        <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: '2rem' }}>{t('sharedPages.pro.noEarnings')}</p>
      ) : (
        <div style={listStyle}>
          {payments.map((t: any) => (
            <Card key={t.id} variant="default" padding="sm">
              <div style={rowStyle}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--success-50)', color: 'var(--success-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <DollarSign size={16} />
                </div>
                <div style={flexStyle}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{t.description || t.type}</p>
                  <p style={subStyle}>{t.date || new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--success-500)' }}>+${parseFloat(t.amount || 0).toFixed(2)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProServices() {
  const { professionalId, verificationStatus } = useAuth();
  const { notify } = useNotification();
  const [services, setServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingService, setEditingService] = React.useState<any>(null);
  const [formData, setFormData] = React.useState({ name: '', description: '', price: '', duration: '' });
  const [saving, setSaving] = React.useState(false);
  const { t } = useTranslation();

  const fetchServices = async () => {
    if (!professionalId) return;
    setLoading(true);
    try {
      const data = await professionalsService.getServices(professionalId);
      setServices(Array.isArray(data) ? data : (data?.data || []));
    } catch { setServices([]); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { fetchServices(); }, [professionalId]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', price: '', duration: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (svc: any) => {
    setEditingService(svc);
    setFormData({ name: svc.name || '', description: svc.description || '', price: String(svc.price || ''), duration: String(svc.duration || '') });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!professionalId || !formData.name || !formData.price || !formData.duration) {
      notify('error', 'Error', 'Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
      };
      if (editingService) {
        await professionalsService.updateService(professionalId, String(editingService.id), payload);
        notify('success', t('sharedPages.pro.updateSvc'), t('proSchedule.successMsg'));
      } else {
        await professionalsService.addService(professionalId, payload);
        notify('success', t('sharedPages.pro.createSvc'), t('proSchedule.successMsg'));
      }
      setShowModal(false);
      fetchServices();
    } catch (err: any) {
      notify('error', t('sharedPages.pro.error'), err?.response?.data?.message || t('proSchedule.errorMsg'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (svcId: string) => {
    if (!professionalId || !confirm(t('sharedPages.pro.delConfirm'))) return;
    try {
      await professionalsService.deleteService(professionalId, svcId);
      notify('success', t('appointments.status.cancelled'), t('sharedPages.pro.delConfirm'));
      fetchServices();
    } catch (err: any) {
      notify('error', t('sharedPages.pro.error'), err?.response?.data?.message || t('proSchedule.errorMsg'));
    }
  };

  const isBlocked = verificationStatus !== 'approved';

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>{t('sharedPages.pro.servicesTitle')}</h1>
        <Button size="sm" icon={<Plus size={16} />} onClick={handleOpenCreate} disabled={isBlocked}>{t('sharedPages.pro.addService')}</Button>
      </div>

      {isBlocked && (
        <div style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', color: '#b45309', fontSize: 'var(--text-sm)' }}>
          {t('sharedPages.pro.blockedNotice')}
        </div>
      )}

      {services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <Scissors size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>{t('sharedPages.pro.noServices')}</p>
        </div>
      ) : (
        <div style={listStyle}>
          {services.map((s: any, i: number) => (
            <motion.div key={s.id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card variant="default" padding="md">
                <div style={rowStyle}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--primary-50)', color: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scissors size={18} />
                  </div>
                  <div style={flexStyle}>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{s.name}</p>
                    {s.description && <p style={{ ...subStyle, marginTop: 2 }}>{s.description}</p>}
                    <p style={subStyle}><Clock size={12} style={{ display: 'inline' }} /> {s.duration || 30} {t('sharedPages.pro.min')}</p>
                  </div>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--primary-600)' }}>${s.price || 0}</span>
                  <Button size="sm" variant="ghost" icon={<Edit size={14} />} onClick={() => handleOpenEdit(s)} disabled={isBlocked} />
                  <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} onClick={() => handleDelete(String(s.id))} disabled={isBlocked} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingService ? t('sharedPages.pro.editSvc') : t('sharedPages.pro.createSvc')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', minWidth: '320px', padding: 'var(--space-2)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.pro.nameLabel')}</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Basic Haircut" style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.pro.descLabel')}</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} placeholder="" style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none', fontFamily: 'var(--font-body)', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.pro.priceLabel')}</label>
              <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="25" style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.pro.durLabel')}</label>
              <input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="30" style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>{t('sharedPages.pro.cancel')}</Button>
            <Button onClick={handleSave} loading={saving}>{editingService ? t('sharedPages.pro.updateSvc') : t('sharedPages.pro.createSvc')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function ProPortfolio() {
  const { t } = useTranslation();
  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>{t('sharedPages.pro.portTitle')}</h1>
        <Button size="sm" icon={<Plus size={16} />}>{t('sharedPages.pro.uploadBtn')}</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
        {Array.from({ length: 9 }, (_, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            style={{ aspectRatio: '1', borderRadius: 'var(--radius-xl)', background: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-300)', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
            <ImageIcon size={28} />
            <div style={{ position: 'absolute', top: 8, right: 8 }}>
              <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ProProfileEditor() {
  const { user, professionalId } = useAuth();
  const { notify } = useNotification();
  const { t } = useTranslation();
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    bio: '', address: '', serviceRadius: 5, experience: '', specialties: '',
    latitude: 0, longitude: 0
  });

  React.useEffect(() => {
    if (professionalId) {
      professionalsService.getProfessionalById(professionalId).then(data => {
        if (data) {
          setFormData(prev => ({
            ...prev,
            bio: data.bio || data.description || prev.bio,
            address: data.location?.address || prev.address,
            serviceRadius: Number(data.serviceRadius) || prev.serviceRadius,
            experience: data.experience || prev.experience,
            specialties: data.specialties || prev.specialties,
            latitude: Number(data.latitude) || 0,
            longitude: Number(data.longitude) || 0,
          }));
        }
      }).catch(console.warn);
    }
  }, [professionalId]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      notify('error', 'Error', 'Geolocation is not supported by your browser');
      return;
    }

    notify('info', t('common.loading'), 'Detecting your current coordinates...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        notify('success', 'Location Detected', 'Coordinates updated successfully.');
      },
      (error) => {
        notify('error', 'Error', `Failed to detect location: ${error.message}`);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleSave = async () => {
    if (!professionalId) return;
    setSaving(true);
    try {
      const cleanData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        address: formData.address,
        serviceRadius: formData.serviceRadius,
        experience: formData.experience,
        specialties: formData.specialties,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };
      await professionalsService.updateProfile(professionalId, cleanData);
      notify('success', 'Profile saved', 'Your professional profile has been updated.');
    } catch (e) {
      notify('error', 'Error', 'Failed to save profile');
    } finally { setSaving(false); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none', background: 'var(--neutral-0)', color: 'var(--neutral-900)' };
  const labelStyle: React.CSSProperties = { fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', marginBottom: 4, display: 'block' };

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.pro.profParams')}</h1>
      <Card variant="default" padding="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div><label style={labelStyle}>{t('sharedPages.pro.fullName')}</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>{t('sharedPages.pro.bio')}</label><textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={3} style={{ ...inputStyle, fontFamily: 'var(--font-body)', resize: 'vertical' }} /></div>
          <div><label style={labelStyle}>{t('sharedPages.pro.experience')}</label><input type="text" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} placeholder="" style={inputStyle} /></div>
          <div><label style={labelStyle}>{t('sharedPages.pro.specialties')}</label><input type="text" value={formData.specialties} onChange={e => setFormData({ ...formData, specialties: e.target.value })} placeholder="" style={inputStyle} /></div>
          <div><label style={labelStyle}>{t('sharedPages.pro.phone')}</label><input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>{t('sharedPages.pro.email')}</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>{t('sharedPages.pro.address')}</label><input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={inputStyle} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label style={labelStyle}>{t('sharedPages.pro.lat')}</label><input type="number" step="0.0000001" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })} style={inputStyle} /></div>
            <div><label style={labelStyle}>{t('sharedPages.pro.lng')}</label><input type="number" step="0.0000001" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })} style={inputStyle} /></div>
          </div>
          <Button variant="secondary" icon={<Navigation size={14} />} onClick={handleDetectLocation}>{t('sharedPages.pro.detectLoc')}</Button>
          
          <div style={{ height: '350px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1.5px solid var(--neutral-200)', position: 'relative', marginTop: 'var(--space-2)' }}>
             <MapView 
               professionals={[]}
               userLocation={null}
               isPicker={true}
               center={{ lat: formData.latitude, lng: formData.longitude }}
               onPickerChange={handleMapClick}
               zoom={15}
             />
             <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: ' var(--radius-lg)', fontSize: '11px', fontWeight: '800', border: '1px solid var(--neutral-200)', color: 'var(--primary-600)', backdropFilter: 'blur(4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {t('sharedPages.pro.mapHint')}
             </div>
          </div>

          <Button onClick={handleSave} loading={saving} size="lg" style={{ marginTop: 'var(--space-2)' }}>{t('sharedPages.pro.saveChanges')}</Button>
        </div>
      </Card>
    </div>
  );
}

export function ProReviews() {
  const { professionalId } = useAuth();
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({ avg: 0, count: 0 });
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!professionalId) return;
    professionalsService.getReviews(professionalId)
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setReviews(list);
        if (list.length > 0) {
          const avg = list.reduce((s: number, r: any) => s + (r.rating || 0), 0) / list.length;
          setStats({ avg, count: list.length });
        }
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [professionalId]);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.pro.revTitle')}</h1>
      <Card variant="glass" padding="md">
        <div style={{ marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-6)', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 800 }}>{stats.avg.toFixed(1)}</p>
            <Rating value={stats.avg} size="md" />
            <p style={subStyle}>{t('sharedPages.pro.basedOn', { count: stats.count })}</p>
          </div>
        </div>
      </Card>
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <Star size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>{t('sharedPages.pro.noRev')}</p>
        </div>
      ) : (
        <div style={{ ...listStyle, marginTop: 'var(--space-4)' }}>
          {reviews.map((r: any, i: number) => (
            <motion.div key={r.id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card variant="default" padding="md">
                <div style={{ ...rowStyle, marginBottom: 'var(--space-2)' }}>
                  <Avatar src={r.userAvatar || r.user?.avatar} name={r.userName || r.user?.name || 'User'} size="sm" />
                  <div style={flexStyle}>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{r.userName || r.user?.name || 'User'}</p>
                    <p style={subStyle}>{r.date || new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Rating value={r.rating || 0} size="sm" />
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)', lineHeight: 'var(--leading-relaxed)' }}>{r.comment || r.text}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============== ADMIN PAGES ============== */

import { AdminUsersTable } from '../features/admin-users';
import { AdminProfessionalsTable } from '../features/admin-professionals';
import { AdminServicesTable } from '../features/admin-services';
import { AdminTransactionsTable } from '../features/admin-transactions';
import { AdminAnalyticsDashboard } from '../features/admin-analytics';
import { AdminSettingsForm } from '../features/admin-settings';
import { AdminProfileView } from '../features/admin-profile';
import { AdminBookingsPage } from '../features/admin-bookings';
import { AdminAiPage } from '../features/admin-ai';

export function AdminUsers() {
  return <AdminUsersTable />;
}

export function AdminProfessionals() {
  return <AdminProfessionalsTable />;
}

export function AdminServices() {
  return <AdminServicesTable />;
}

export function AdminTransactions() {
  return <AdminTransactionsTable />;
}

export function AdminAnalytics() {
  return <AdminAnalyticsDashboard />;
}

export function AdminBookings() {
  return <AdminBookingsPage />;
}

export function AdminAi() {
  return <AdminAiPage />;
}

export function AdminSettings() {
  return <AdminSettingsForm />;
}

// User favorites
export function UserFavorites() {
  const [favorites, setFavorites] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { t } = useTranslation();

  React.useEffect(() => {
    userService.getFavorites()
      .then(data => setFavorites(Array.isArray(data) ? data : []))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.user.favTitle')}</h1>
      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <Star size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>{t('sharedPages.user.noFavs')}</p>
        </div>
      ) : (
        <div style={listStyle}>
          {favorites.map((pro: any, i: number) => (
            <motion.div key={pro.id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card variant="default" padding="md" hover>
                <div style={rowStyle}>
                  <Avatar src={pro.avatar || pro.user?.avatar} name={pro.name || pro.user?.name || 'Professional'} size="md" />
                  <div style={flexStyle}>
                    <p style={{ fontWeight: 600 }}>{pro.name || pro.user?.name || 'Professional'}</p>
                    <p style={subStyle}>{(pro.services || []).map((s: any) => typeof s === 'string' ? s : s.name).join(', ') || t('sharedPages.user.noSvcList')}</p>
                    <Rating value={pro.rating || 0} size="sm" showValue count={pro.reviewCount || 0} />
                  </div>
                  <Button size="sm" variant="accent">{t('sharedPages.user.bookBtn')}</Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export function UserPayments() {
  const [payments, setPayments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { t } = useTranslation();

  React.useEffect(() => {
    userService.getPaymentHistory()
      .then(data => setPayments(Array.isArray(data) ? data : []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.user.payTitle')}</h1>
      {payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <DollarSign size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>{t('sharedPages.user.noPays')}</p>
        </div>
      ) : (
        <div style={listStyle}>
          {payments.map((t: any) => (
            <Card key={t.id} variant="default" padding="sm">
              <div style={rowStyle}>
                <div style={flexStyle}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{t.description || t.type}</p>
                  <p style={subStyle}>{t.date || new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <span style={{ fontWeight: 700 }}>-${parseFloat(t.amount || 0).toFixed(2)}</span>
                <Badge variant={t.status === 'completed' ? 'success' : 'warning'} size="sm">{t.status || 'completed'}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminProfile() {
  return <AdminProfileView />;
}
