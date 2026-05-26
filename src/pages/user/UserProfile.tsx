import { useState, useRef, type ChangeEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Heart, CreditCard, Star, Edit3, Save, X, Loader, Navigation } from 'lucide-react';
import { Card, Avatar, Button, Badge } from '../../components/ui';
import { BecomeProfessionalModal } from '../../components/ui/BecomeProfessionalModal';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../hooks/useBookings';
import { userService } from '../../services/userService';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import './UserProfile.css';

export default function UserProfile() {
  const { user, logout, verificationStatus, refreshVerificationStatus, setUser, openLoginModal } = useAuth();
  const { bookings } = useBookings();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { t } = useTranslation();
  
  const formatCOP = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(num || 0).replace('COP', '$');
  };

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Favorites & payments from API
  const [favorites, setFavorites] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showBecomeProModal, setShowBecomeProModal] = useState(false);

  // Geolocation
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [favs, pays] = await Promise.all([
          userService.getFavorites().catch(() => []),
          userService.getPaymentHistory().catch(() => []),
        ]);
        setFavorites(Array.isArray(favs) ? favs : []);
        setPayments(Array.isArray(pays) ? pays : []);
      } catch {
        setFavorites([]);
        setPayments([]);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await userService.updateProfile(String(user.id), {
        name: editName,
        phone: editPhone,
      });
      // Update local user state
      if (user) {
        setUser({ ...user, name: editName, phone: editPhone });
      }
      setEditing(false);
      notify('success', t('userProfile.successProfile'), t('userProfile.successProfileDesc'));
    } catch (err: any) {
      notify('error', t('userProfile.errorTitle'), err?.response?.data?.message || t('userProfile.errorUpdate'));
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await userService.updateProfileImage(String(user.id), formData);
      
      if (user) {
        setUser({ ...user, avatar: response.data?.profileImage || response.data?.avatar || URL.createObjectURL(file) });
      }
      notify('success', t('userProfile.successProfile'), 'Foto de perfil actualizada correctamente');
    } catch (err: any) {
      notify('error', t('userProfile.errorTitle'), err?.response?.data?.message || 'Error al subir la imagen');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add Address State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressText, setNewAddressText] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  const handleDetectLocation = () => {
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await userService.updateProfile(String(user?.id), {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          if (user) {
            setUser({ ...user, latitude: position.coords.latitude, longitude: position.coords.longitude });
          }
          notify('success', t('userProfile.successLoc'), t('userProfile.successLocDesc'));
        } catch {
          notify('error', t('userProfile.errorTitle'), t('userProfile.errorLoc'));
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        notify('error', t('userProfile.errorTitle'), t('userProfile.errorLocDetect'));
        setDetectingLocation(false);
      }
    );
  };

  const handleAddAddress = async () => {
    if (!newAddressLabel.trim() || !newAddressText.trim()) {
      notify('error', t('userProfile.errorTitle'), 'Por favor completa todos los campos de la dirección');
      return;
    }
    setSavingAddress(true);
    try {
      const currentAddresses = user?.addresses || [];
      const updatedAddresses = [
        ...currentAddresses,
        { id: Date.now().toString(), label: newAddressLabel, address: newAddressText }
      ];
      await userService.updateProfile(String(user?.id), { addresses: updatedAddresses });
      if (user) {
        setUser({ ...user, addresses: updatedAddresses });
      }
      setNewAddressLabel('');
      setNewAddressText('');
      setIsAddingAddress(false);
      notify('success', 'Éxito', 'Dirección agregada correctamente');
    } catch {
      notify('error', t('userProfile.errorTitle'), 'Error al guardar la dirección');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (idToDelete: string) => {
    try {
      const updatedAddresses = (user?.addresses || []).filter((a: any) => a.id !== idToDelete);
      await userService.updateProfile(String(user?.id), { addresses: updatedAddresses });
      if (user) {
        setUser({ ...user, addresses: updatedAddresses });
      }
      notify('success', 'Éxito', 'Dirección eliminada');
    } catch {
      notify('error', t('userProfile.errorTitle'), 'Error al eliminar la dirección');
    }
  };

  return (
    <div className="user-profile-page">
      {/* Profile Header */}
      <motion.div className="profile-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="profile-avatar-wrap">
          <Avatar src={user?.avatar} name={user?.name || 'User'} size="xl" />
          <button 
            className="avatar-edit" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
          >
            {uploadingImage ? <Loader size={14} className="animate-spin" /> : <Camera size={14} />}
          </button>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            style={{ display: 'none' }}
          />
        </div>

        {editing ? (
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Name"
              style={{ width: '100%', padding: '8px 12px', marginBottom: '8px', borderRadius: '8px', border: '1px solid var(--neutral-200)', background: 'var(--neutral-0)', color: 'var(--neutral-900)' }}
            />
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="Phone"
              style={{ width: '100%', padding: '8px 12px', marginBottom: '8px', borderRadius: '8px', border: '1px solid var(--neutral-200)', background: 'var(--neutral-0)', color: 'var(--neutral-900)' }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Button size="sm" onClick={handleSaveProfile} loading={saving} icon={<Save size={14} />}>{t('userProfile.save')}</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} icon={<X size={14} />}>{t('userProfile.cancel')}</Button>
            </div>
          </div>
        ) : (
          <>
            <h1>{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-phone">{user?.phone}</p>
            <Button variant="secondary" size="sm" icon={<Edit3 size={14} />} onClick={() => {
              setEditName(user?.name || '');
              setEditPhone(user?.phone || '');
              setEditing(true);
            }}>{t('userProfile.edit')}</Button>
          </>
        )}
      </motion.div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="stat-item"><span className="stat-val">{bookings.filter(b => b.status === 'completed').length}</span><span className="stat-label">{t('userProfile.bookings')}</span></div>
        <div className="stat-item"><span className="stat-val">{favorites.length}</span><span className="stat-label">{t('userProfile.favorites')}</span></div>
        <div className="stat-item"><span className="stat-val">{bookings.filter(b => b.status === 'completed').length}</span><span className="stat-label">{t('userProfile.reviews')}</span></div>
      </div>

      {/* Become Professional CTA */}
      {user?.role === 'user' && verificationStatus === 'none' && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Card variant="gradient" padding="md" className="become-pro-cta">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--neutral-0)' }}>{t('userProfile.becomePro')}</h3>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.8)' }}>{t('userProfile.becomeProDesc')}</p>
              </div>
              <Button size="sm" variant="primary" onClick={() => setShowBecomeProModal(true)}>
                {t('userProfile.getStarted')}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {verificationStatus === 'pending' && (
        <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: '#b45309' }}>
            {t('userProfile.pendingRev')}
          </p>
        </div>
      )}

      {/* Location */}
      <section className="profile-section">
        <h2><MapPin size={18} /> {t('userProfile.location')}</h2>
        <Button size="sm" variant="secondary" icon={<Navigation size={14} />} onClick={handleDetectLocation} loading={detectingLocation}>
          {detectingLocation ? t('userProfile.detecting') : t('userProfile.detectBtn')}
        </Button>
      </section>

      {/* Addresses */}
      <section className="profile-section">
        <h2><MapPin size={18} /> {t('userProfile.savedAddr')}</h2>
        {user && user.addresses && user.addresses.length > 0 ? (
          user.addresses.map((addr: any) => (
            <Card key={addr.id} variant="default" padding="sm" className="addr-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Badge variant="primary" size="sm">{addr.label || addr.title || 'Address'}</Badge>
                  <p style={{ marginTop: '4px' }}>{addr.address}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteAddress(addr.id)} style={{ color: 'var(--danger-500)', padding: '4px' }}>
                  <X size={16} />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <p style={{ color: 'var(--neutral-400)', fontSize: 'var(--text-sm)' }}>{t('userProfile.noAddr')}</p>
        )}
        
        {isAddingAddress ? (
          <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--neutral-200)', borderRadius: '8px' }}>
            <input
              type="text"
              placeholder="Alias (ej. Casa, Trabajo)"
              value={newAddressLabel}
              onChange={(e) => setNewAddressLabel(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', marginBottom: '8px', borderRadius: '8px', border: '1px solid var(--neutral-200)' }}
            />
            <input
              type="text"
              placeholder="Dirección completa"
              value={newAddressText}
              onChange={(e) => setNewAddressText(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', marginBottom: '8px', borderRadius: '8px', border: '1px solid var(--neutral-200)' }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Button size="sm" onClick={handleAddAddress} loading={savingAddress}>{t('userProfile.save')}</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAddingAddress(false)}>{t('userProfile.cancel')}</Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setIsAddingAddress(true)} style={{ marginTop: '8px' }}>
            + {t('userProfile.addAddr')}
          </Button>
        )}
      </section>

      {/* Favorites */}
      <section className="profile-section">
        <h2><Heart size={18} /> {t('userProfile.favPros')}</h2>
        {dataLoading ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <Loader size={24} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
          </div>
        ) : favorites.length === 0 ? (
          <p style={{ color: 'var(--neutral-400)', fontSize: 'var(--text-sm)' }}>{t('userProfile.noFavs')}</p>
        ) : (
          <div className="favorites-list">
            {favorites.map((pro: any) => (
              <Card key={pro.id} variant="default" padding="sm" hover className="fav-card">
                <Avatar src={pro.avatar || pro.user?.avatar} name={pro.name || pro.user?.name || 'Professional'} size="sm" />
                <div className="fav-info"><p className="fav-name">{pro.name || pro.user?.name}</p><p className="fav-svc">{pro.services?.[0]?.name || pro.services?.[0] || ''}</p></div>
                <div className="fav-rating"><Star size={13} fill="#fbbf24" color="#fbbf24" /> {pro.rating || 0}</div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Payment History */}
      <section className="profile-section">
        <h2><CreditCard size={18} /> {t('userProfile.payHistory')}</h2>
        {dataLoading ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <Loader size={24} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
          </div>
        ) : payments.length === 0 ? (
          <p style={{ color: 'var(--neutral-400)', fontSize: 'var(--text-sm)' }}>{t('userProfile.noPayments')}</p>
        ) : (
          payments.slice(0, 5).map((p: any) => (
            <Card key={p.id} variant="default" padding="sm" className="payment-row">
              <div className="pay-info"><p className="pay-desc">{p.description || p.type}</p><p className="pay-date">{p.date || new Date(p.createdAt).toLocaleDateString()}</p></div>
              <span className="pay-amount">-{formatCOP(p.amount || 0)}</span>
            </Card>
          ))
        )}
      </section>

      {/* Account Actions */}
      <section className="profile-section" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Button variant="danger" onClick={() => { logout(); setTimeout(() => openLoginModal(), 100); navigate('/'); }}>{t('userProfile.logout')}</Button>
      </section>

      {/* Become Professional Modal */}
      <BecomeProfessionalModal
        isOpen={showBecomeProModal}
        onClose={() => setShowBecomeProModal(false)}
        onSuccess={refreshVerificationStatus}
      />
    </div>
  );
}
