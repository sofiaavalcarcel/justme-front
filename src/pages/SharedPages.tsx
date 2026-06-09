// Shared pages for secondary views across all roles
// All data fetched from backend - no mock data
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button, Avatar, Rating } from '../components/ui';
import { Modal } from '../components/ui/Modal';
import { Home, DollarSign, Plus, Scissors, Edit, Image as ImageIcon, Trash2, Star, MapPin, Clock, Loader, Eye, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { bookingService } from '../services/bookingService';
import { professionalsService } from '../services/professionalsService';
import { walletService } from '../services/walletService';
import { userService } from '../services/userService';
import { useTranslation } from 'react-i18next';
import { MapView } from '../components/map/MapView';
import { Navigation } from 'lucide-react';
import Swal from 'sweetalert2';
import { ProServiceModal } from './professional/ProServiceModal';
import { CategoryRequestModal } from './professional/CategoryRequestModal';

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
      .then((data: any) => setTransactions(Array.isArray(data) ? data : (data?.data || [])))
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
  const [services, setServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [showCategoryModal, setShowCategoryModal] = React.useState(false);
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

  const handleDelete = async (svcId: string) => {
    if (!professionalId) return;
    
    const result = await Swal.fire({
      title: t('sharedPages.pro.delConfirm', '¿Estás seguro?'),
      text: t('sharedPages.pro.deactivateMsg', 'Este servicio será desactivado y ya no será visible.'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary-600)',
      cancelButtonColor: '#d33',
      confirmButtonText: t('common.confirm', 'Sí, continuar'),
      cancelButtonText: t('common.cancel', 'Cancelar')
    });

    if (!result.isConfirmed) return;

    try {
      await professionalsService.deleteService(professionalId, svcId);
      Swal.fire({ icon: 'success', title: t('appointments.status.cancelled', 'Desactivado'), text: t('proSchedule.successMsg', 'Acción realizada con éxito'), confirmButtonColor: 'var(--primary-600)' });
      fetchServices();
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: t('sharedPages.pro.error', 'Error'), text: err?.response?.data?.message || t('proSchedule.errorMsg', 'Error al procesar la solicitud'), confirmButtonColor: 'var(--primary-600)' });
    }
  };

  const isBlocked = verificationStatus !== 'approved';

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>{t('sharedPages.pro.servicesTitle')}</h1>
        <Button size="sm" icon={<Plus size={16} />} onClick={() => setShowModal(true)} disabled={isBlocked}>{t('sharedPages.pro.addService')}</Button>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
          {services.map((s: any, i: number) => {
            const displayName = s.service?.name || s.name || 'Servicio';
            return (
              <motion.div key={s.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} style={{ height: '100%' }}>
                <Card variant="default" padding="sm" hover style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', height: '100%', border: '1px solid var(--neutral-100)', transition: 'transform 0.15s, box-shadow 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--primary-100), var(--primary-50))', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Scissors size={16} strokeWidth={2} />
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <Button size="sm" variant="ghost" icon={<Edit size={13} />} onClick={() => setShowModal(true)} disabled={isBlocked} style={{ padding: '5px', color: 'var(--neutral-500)', background: 'var(--neutral-50)' }} />
                      <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={() => handleDelete(String(s.id))} disabled={isBlocked} style={{ padding: '5px', color: 'var(--error-500)', background: 'var(--error-50)' }} />
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--neutral-900)', marginBottom: '4px' }}>{displayName}</h3>
                    {s.description && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {s.description}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--neutral-100)', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--neutral-400)', fontSize: 'var(--text-xs)', fontWeight: 500 }}>
                      <Clock size={12} /> <span>{s.duration || 30} min</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--primary-600)' }}>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(s.price) || 0)}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <ProServiceModal
        open={showModal}
        onClose={() => setShowModal(false)}
        professionalId={Number(professionalId) || 0}
        existingServices={services}
        onSaved={fetchServices}
        onRequestCategory={() => setShowCategoryModal(true)}
      />

      <CategoryRequestModal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />
    </div>
  );
}

export function ProPortfolio() {
  const { t } = useTranslation();
  const { professionalId } = useAuth();
  const { notify } = useNotification();
  const [images, setImages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');

  const fetchImages = React.useCallback(async () => {
    if (!professionalId) return;
    setLoading(true);
    try {
      const data = await professionalsService.getProfessionalById(professionalId);
      if (data && data.portfolioImages) {
        // Sort by order or just set
        setImages(data.portfolioImages);
      }
    } catch (error) {
      console.warn('Failed to fetch portfolio', error);
    } finally {
      setLoading(false);
    }
  }, [professionalId]);

  React.useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !professionalId) return;

    setUploading(true);
    try {
      await professionalsService.uploadPortfolioImages(professionalId, Array.from(files));
      notify('success', t('proSchedule.successMsg', 'Success'), t('sharedPages.pro.uploadSuccess', 'Imágenes subidas correctamente.'));
      await fetchImages();
    } catch (error: any) {
      notify('error', 'Error', error?.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (imageId: string | number) => {
    if (!professionalId || !confirm(t('sharedPages.pro.delConfirm', 'Are you sure you want to delete this?'))) return;
    try {
      await professionalsService.deletePortfolioImage(professionalId, imageId);
      notify('success', 'Eliminado', 'Imagen eliminada correctamente.');
      await fetchImages();
    } catch (error: any) {
      notify('error', 'Error', error?.response?.data?.message || 'Failed to delete image');
    }
  };

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>{t('sharedPages.pro.portTitle')}</h1>
        <div>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <Button size="sm" icon={<Plus size={16} />} onClick={handleUploadClick} disabled={uploading}>
            {uploading ? t('common.loading', 'Cargando...') : t('sharedPages.pro.uploadBtn')}
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <ImageIcon size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>{t('pro.noPortfolio', 'Aún no hay imágenes en tu portafolio.')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
          {images.map((img, i) => {
            const imgSrc = img.imageUrl.startsWith('http') ? img.imageUrl : `${baseUrl}${img.imageUrl}`;
            return (
              <motion.div key={img.id || i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                style={{ aspectRatio: '1', borderRadius: 'var(--radius-xl)', background: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-300)', position: 'relative', overflow: 'hidden' }}>
                <img src={imgSrc} alt="Portfolio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <Button size="sm" variant="ghost" icon={<Trash2 size={14} color="white" />} onClick={() => handleDelete(img.id)} style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%' }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
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
  const [selectedReview, setSelectedReview] = React.useState<any>(null);
  const { t, i18n } = useTranslation();

  React.useEffect(() => {
    if (!professionalId) return;
    professionalsService.getReviews(professionalId)
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setReviews(list);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [professionalId]);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.pro.revTitle')}</h1>
      
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <Star size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>{t('sharedPages.pro.noRev')}</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: 'var(--space-4)', 
          marginTop: 'var(--space-4)' 
        }}>
          {reviews.map((r: any, i: number) => {
            const userName = r.userName || r.user?.name || 'User';
            const serviceName = r.booking?.professionalService?.name || t('common.notAvailable', 'No disponible');
            const dateStr = new Date(r.createdAt).toLocaleDateString(i18n.language, { weekday: 'short', month: 'short', day: 'numeric' });
            
            return (
              <motion.div key={r.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} style={{ height: '100%' }}>
                <Card variant="default" padding="md" hover style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Avatar src={r.userAvatar || r.user?.avatar} name={userName} size="md" />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{userName}</h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>{serviceName}</p>
                    </div>
                    <Rating value={r.rating || 0} size="sm" />
                  </div>
                  
                  <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Calendar size={14} /> {dateStr}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={14} /> {new Date(r.createdAt).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--neutral-100)' }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)', lineHeight: 'var(--leading-relaxed)', flex: 1, marginRight: 'var(--space-4)' }}>
                      {r.comment || r.text}
                    </p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      icon={<Eye size={16} />} 
                      onClick={() => setSelectedReview(r)}
                      style={{ padding: 'var(--space-1)', minWidth: 'auto' }}
                    />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Review Detail Modal */}
      <Modal 
        isOpen={!!selectedReview} 
        onClose={() => setSelectedReview(null)} 
        title={t('sharedPages.pro.revDetail', 'Detalle de Reseña')}
      >
        {selectedReview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minWidth: '320px', padding: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <Avatar src={selectedReview.userAvatar || selectedReview.user?.avatar} name={selectedReview.userName || selectedReview.user?.name || 'User'} size="lg" />
              <div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>{selectedReview.userName || selectedReview.user?.name || 'User'}</h3>
                <Rating value={selectedReview.rating || 0} size="sm" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-3)', background: 'var(--neutral-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--neutral-600)' }}>
                <Calendar size={14} />
                <span>
                  {new Date(selectedReview.createdAt).toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--neutral-600)' }}>
                <Scissors size={14} />
                <span>
                  {selectedReview.booking?.professionalService?.name || t('common.notAvailable', 'No disponible')}
                </span>
              </div>
            </div>

            <div>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--neutral-400)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {t('sharedPages.pro.comment', 'Comentario')}
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-700)', lineHeight: 'var(--leading-relaxed)' }}>
                {selectedReview.comment || selectedReview.text}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
              <Button onClick={() => setSelectedReview(null)}>{t('common.close', 'Cerrar')}</Button>
            </div>
          </div>
        )}
      </Modal>
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
