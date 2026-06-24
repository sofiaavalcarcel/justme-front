import { useState, useRef, type ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  MapPin, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Calendar, 
  Save, 
  Loader, 
  Navigation,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, Avatar, Button, Input } from '../../components/ui';
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

  const [formData, setFormData] = useState({
    name: user?.name || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    city: user?.city || '',
    bio: user?.bio || '',
    birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showBecomeProModal, setShowBecomeProModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        city: user.city || '',
        bio: user.bio || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
      });
    }
  }, [user]);

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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await userService.updateProfile(String(user.id), formData);
      if (user) {
        setUser({ ...user, ...formData });
      }
      setIsDirty(false);
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
      const formDataImage = new FormData();
      formDataImage.append('image', file);

      const response = await userService.updateProfileImage(String(user.id), formDataImage);

      if (user) {
        setUser({ ...user, avatar: response.data?.avatar || response.data?.profileImage || URL.createObjectURL(file) });
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

  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const registrationDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '---';

  return (
    <div className="user-profile-v2">
      {/* Dynamic Header with Stats */}
      <motion.div 
        className="profile-hero-card"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="gradient" padding="lg" className="hero-content">
          <div className="hero-layout">
            <div className="avatar-section">
              <div className="avatar-ring">
                <Avatar src={user?.avatar} name={user?.name || 'User'} size="xl" />
                <button
                  className="avatar-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  title="Cambiar foto de perfil"
                >
                  {uploadingImage ? <Loader size={16} className="animate-spin" /> : <Camera size={16} />}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            
            <div className="user-info-brief">
              <h1>{user?.name} {user?.lastName}</h1>
              <p className="user-membership">
                <Globe size={14} /> {user?.city || 'Planeta Tierra'} • Miembro desde {registrationDate}
              </p>
              
              <div className="hero-stats">
                <div className="stat-pill">
                  <span className="pill-val">{completedBookings}</span>
                  <span className="pill-label">{t('userProfile.bookings')}</span>
                </div>
                <div className="stat-pill clickable" onClick={() => navigate('/user/favorites')}>
                  <span className="pill-val">{favoritesCount}</span>
                  <span className="pill-label">{t('userProfile.favorites')}</span>
                </div>
                <div className="stat-pill">
                  <span className="pill-val">{completedBookings}</span>
                  <span className="pill-label">{t('userProfile.reviews')}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="profile-grid">
        {/* Left Column: Form */}
        <div className="profile-main-content">
          <Card variant="glass" padding="lg" className="form-container">
            <div className="section-header">
              <UserIcon size={20} />
              <h2>Información Personal</h2>
            </div>
            
            <div className="inputs-grid">
              <Input
                label="Nombre"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                icon={<UserIcon size={18} />}
              />
              <Input
                label="Apellido"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                icon={<UserIcon size={18} />}
              />
              <Input
                label="Email"
                name="email"
                value={user?.email || ''}
                disabled
                icon={<Mail size={18} />}
                className="input-disabled"
              />
              <Input
                label="Teléfono"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                icon={<Phone size={18} />}
              />
              <Input
                label="Ciudad"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                icon={<MapPin size={18} />}
              />
              <Input
                label="Fecha de Nacimiento"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleInputChange}
                icon={<Calendar size={18} />}
              />
            </div>

            <div className="section-header mt-8">
              <FileText size={20} />
              <h2>Acerca de mí</h2>
            </div>
            <div className="textarea-group">
              <textarea
                name="bio"
                placeholder="Cuéntanos un poco sobre ti..."
                value={formData.bio}
                onChange={handleInputChange}
                className="custom-textarea"
              />
            </div>

            <AnimatePresence>
              {isDirty && (
                <motion.div 
                  className="sticky-actions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <Button 
                    fullWidth 
                    size="lg" 
                    onClick={handleSaveProfile} 
                    loading={saving} 
                    icon={<Save size={20} />}
                  >
                    Guardar Cambios
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Right Column: Extras & Actions */}
        <div className="profile-side-content">
          {/* Become Professional CTA */}
          {user?.role === 'user' && verificationStatus === 'none' && (
            <Card variant="gradient" padding="md" className="pro-cta-card">
              <h3>¿Quieres ofrecer tus servicios?</h3>
              <p>Únete a nuestra comunidad de profesionales y empieza a ganar dinero.</p>
              <Button 
                variant="secondary" 
                fullWidth 
                onClick={() => setShowBecomeProModal(true)}
              >
                Ser Profesional
              </Button>
            </Card>
          )}

          {verificationStatus === 'pending' && (
            <Card padding="md" className="status-card pending">
              <AlertCircle size={20} />
              <span>Tu solicitud de perfil profesional está siendo revisada.</span>
            </Card>
          )}

          {verificationStatus === 'approved' && (
            <Card padding="md" className="status-card verified">
              <CheckCircle2 size={20} />
              <span>Eres un profesional verificado.</span>
            </Card>
          )}

          {/* Location Action */}
          <Card variant="outlined" padding="md" className="location-action-card">
            <div className="card-top">
              <MapPin size={20} />
              <h4>Ubicación GPS</h4>
            </div>
            <p>Actualiza tu ubicación para encontrar profesionales más cerca de ti.</p>
            <Button 
              variant="outline" 
              fullWidth 
              size="sm" 
              icon={<Navigation size={14} />} 
              onClick={handleDetectLocation} 
              loading={detectingLocation}
            >
              Detectar mi ubicación
            </Button>
          </Card>

          {/* Danger Zone */}
          <Card variant="glass" padding="md" className="danger-zone">
            <h4>Cuenta</h4>
            <Button 
              variant="ghost" 
              fullWidth 
              className="logout-btn"
              onClick={() => { logout(); setTimeout(() => openLoginModal(), 100); navigate('/'); }}
            >
              Cerrar Sesión
            </Button>
          </Card>
        </div>
      </div>

      <BecomeProfessionalModal
        isOpen={showBecomeProModal}
        onClose={() => setShowBecomeProModal(false)}
        onSuccess={refreshVerificationStatus}
      />
    </div>
  );
}
