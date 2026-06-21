import { useState, useRef, type ChangeEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Edit3, Save, X, Loader, Navigation } from 'lucide-react';
import { Card, Avatar, Button } from '../../components/ui';
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

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Favorites count from API
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showBecomeProModal, setShowBecomeProModal] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favs = await userService.getFavorites();
        setFavoritesCount(Array.isArray(favs) ? favs.length : 0);
      } catch {
        setFavoritesCount(0);
      }
    };
    fetchFavorites();
  }, []);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await userService.updateProfile(String(user.id), {
        name: editName,
        phone: editPhone,
      });
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
        <div className="stat-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/favorites')}><span className="stat-val">{favoritesCount}</span><span className="stat-label">{t('userProfile.favorites')}</span></div>
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
