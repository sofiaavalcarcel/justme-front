
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors, Sparkles, Star, Hand, Droplets, Heart, Waves, User,
  MapPin, Home, Building, Calendar, Clock, Search as SearchIcon,
  ArrowLeft, Check, ChevronDown, ChevronUp,
  Loader2, CheckCircle, Navigation, AlertCircle, ShieldCheck
} from 'lucide-react';
import { MapView } from '../../components/map/MapView';
import { useGeolocation } from '../../hooks';
import { calculateDistance } from '../../services/geolocation';
import { professionalsService } from '../../services/professionalsService';
import { bookingService } from '../../services/bookingService';
import { paymentsService } from '../../services/paymentsService';
import { scheduleService } from '../../services/scheduleService';
import { useNotification } from '../../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../services/api';
import { DatePicker } from '../../components/ui/DatePicker';
import { ClockPicker } from '../../components/ui/ClockPicker';
import { ProProfileDetail } from '../../components/professional/ProProfileDetail';
import './Search.css';

type Phase = 'choose' | 'searching' | 'results' | 'profile' | 'booking' | 'confirmed';

const serviceIcons: Record<string, any> = {
  'Barber': <Scissors size={22} />,
  'Hair Stylist': <Sparkles size={22} />,
  'Makeup': <Star size={22} />,
  'Nails': <Hand size={22} />,
  'Skincare': <Droplets size={22} />,
  'Massage': <Heart size={22} />,
  'Spa': <Waves size={22} />,
  'Grooming': <User size={22} />,
};

const serviceColors: Record<string, string> = {
  'Barber': '#8b45ff',
  'Barbería': '#8b45ff',
  'Hair Stylist': '#ff3366',
  'Peluquería': '#ff3366',
  'Makeup': '#f59e0b',
  'Eventos': '#f59e0b',
  'Nails': '#ec4899',
  'Skincare': '#10b981',
  'Massage': '#6366f1',
  'Bienestar': '#6366f1',
  'Spa': '#06b6d4',
  'Grooming': '#8b5cf6',
};



export default function SearchPage() {
  const navigate = useNavigate();
  const geo = useGeolocation();
  const { notify } = useNotification();
  const { t } = useTranslation();

  // Flow state
  const [phase, setPhase] = useState<Phase>('choose');

  // Service selection
  const [selectedService, setSelectedService] = useState('');
  const [locationType, setLocationType] = useState<'home' | 'professional'>('professional');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [dbServices, setDbServices] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/services/categories')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        // Si no hay datos en la DB, mostramos los hardcoded como fallback para no dejar la pantalla vacía
        setDbServices(list.length > 0 ? list.filter((s: any) => s.isActive !== false) : Object.keys(serviceIcons).map(name => ({ id: name, name, category: name })));
      })
      .catch(() => {
        // Fallback en caso de error
        setDbServices(Object.keys(serviceIcons).map(name => ({ id: name, name, category: name })));
      });
  }, []);

  // Results
  const [selectedProId, setSelectedProId] = useState<string | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(true);

  // Booking
  // Booking
  const [bookingLoading, setBookingLoading] = useState(false);

  const [backendPros, setBackendPros] = useState<any[]>([]);
  const [loadingPros, setLoadingPros] = useState(false);
  const [selectedProDetails, setSelectedProDetails] = useState<any>(null);

  // Fetch initial nearby professionals on load
  useEffect(() => {
    if (geo.latitude && geo.longitude && phase === 'choose') {
      fetchPros();
    }
  }, [geo.latitude, geo.longitude]);

  const fetchPros = async (searchParams?: any) => {
    if (!geo.latitude || !geo.longitude) return;
    
    setLoadingPros(true);
    try {
      const params = {
        latitude: geo.latitude,
        longitude: geo.longitude,
        radius: 50,
        ...searchParams
      };
      
      const data = await professionalsService.getNearbyProfessionals(params);
      const mapped = data.map((p: any) => {
        const lat = Number(p.latitude);
        const lng = Number(p.longitude);
        const services = p.professionalServices?.map((ps: any) => ps.service?.category) || [];
        const serviceNames = p.professionalServices?.map((ps: any) => ps.name || ps.service?.name) || [];
        
        return {
          ...p,
          name: p.user?.name || t('search.professional'),
          avatar: p.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user?.name || 'P')}&background=random`,
          location: { lat, lng, address: p.address },
          services: [...new Set([...services, ...serviceNames])],
          price: p.professionalServices?.[0]?.price || 0,
          distance: calculateDistance(geo.latitude!, geo.longitude!, lat, lng),
        };
      });
      setBackendPros(mapped);
    } catch (e) {
      console.warn('Failed to fetch nearby pros', e);
    } finally {
      setLoadingPros(false);
    }
  };

  // Simplified filtered useMemo (mostly for favorites/nearby separation and sorting)
  // Availability is now handled by the backend during fetchPros
  const filtered = useMemo(() => {
    return backendPros
      .sort((a: any, b: any) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.distance - b.distance;
      });
  }, [backendPros]);

  const favorites = filtered.filter(p => p.isFavorite);
  const nearby = filtered.filter(p => !p.isFavorite);
  const selectedPro = backendPros.find(p => p.id === selectedProId);

  const selectedSvcData = useMemo(() => {
    if (!selectedPro || !selectedService) return null;
    return selectedPro.professionalServices?.find((ps: any) => 
      ps.service?.name === selectedService || ps.name === selectedService || ps.service?.category === selectedService
    );
  }, [selectedPro, selectedService]);

  const bookingPrice = selectedSvcData?.price || selectedPro?.price || 0;

  const canSearch = selectedService && selectedDate && selectedTime;

  const handleSearch = async () => {
    setPhase('searching');
    
    // Fetch specifically filtered results from backend
    await fetchPros({
      service: selectedService,
      date: selectedDate,
      time: convertTo24h(selectedTime)
    });

    setPhase('results');
    setPanelExpanded(true);
  };

  const convertTo24h = (time12h: string) => {
    if (!time12h) return undefined;
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (modifier === 'PM' && hours !== '12') hours = String(parseInt(hours, 10) + 12);
    if (modifier === 'AM' && hours === '12') hours = '00';
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const handleSelectPro = async (id: string) => {
    setSelectedProId(id);
    setPhase('profile');
    
    // Fetch detailed real professional data
    try {
      const details = await professionalsService.getProfessionalById(String(id));
      setSelectedProDetails({
        ...details,
        name: details.user?.name || t('search.professional'),
        avatar: details.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(details.user?.name || 'P')}&background=random`,
        distance: backendPros.find(p => p.id === Number(id))?.distance || 0
      });
    } catch (e) {
      console.error('Failed to fetch pro details', e);
    }
  };
  const handleStartBooking = async (id: string) => {
    setSelectedProId(id);
    const pro = favorites.find(p => String(p.id) === id) || nearby.find(p => String(p.id) === id);
    
    setPhase('booking');
    setPanelExpanded(true);
    
    try {
      // Find the selected service duration, default to 60 if not found
      const matchSvc = pro?.professionalServices?.find((ps: any) => 
        ps.service?.name === selectedService || ps.service?.category === selectedService
      );
      const duration = matchSvc?.duration || 60;
      
      await scheduleService.getAvailableSlots(Number(id), selectedDate, duration);
    } catch (e) {
      console.error('Failed to fetch slots', e);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedPro) return;
    setBookingLoading(true);
    try {
      const matchSvc = selectedPro.professionalServices?.find((ps: any) => 
        ps.service?.name === selectedService || ps.service?.category === selectedService
      );
      const professionalServiceId = matchSvc ? matchSvc.id : (selectedPro.professionalServices?.[0]?.id || 1);

      const booking = await bookingService.createBooking({
        professionalId: selectedPro.id,
        professionalServiceId: professionalServiceId,
        date: selectedDate,
        startTime: selectedTime,
        locationType: locationType === 'home' ? 'home' : 'professional',
        location: locationType === 'home' ? 'A domicilio' : (selectedPro.location?.address || 'Local del Profesional'),
        latitude: geo.latitude || selectedPro.location?.lat,
        longitude: geo.longitude || selectedPro.location?.lng
      });
      
      // Try payment redirect
      try {
        const payment = await paymentsService.createPayment({
          amount: bookingPrice,
          metadata: { bookingId: booking.id }
        });
        if (payment?.init_point) {
          notify('success', t('search.successAlert'), t('search.successMsg'));
          setTimeout(() => {
            window.location.href = payment.init_point;
          }, 1500);
          return;
        }
      } catch {
        // Payment service not configured — that's OK, show confirmation on map
      }

      // Stay on the map — show confirmed overlay
      setBookingLoading(false);
      setPhase('confirmed');
      notify('success', t('search.successAlert'), t('search.bookingSuccessDesc'));
      
    } catch (e) {
      setBookingLoading(false);
      notify('error', t('search.errorAlert'), t('search.errorMsg'));
    }
  };

  const handleReset = () => {
    setPhase('choose');
    setSelectedService('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedProId(null);
    setPanelExpanded(true);
  };

  // Map professionals for MapView
  const mapPros = (phase === 'results' || phase === 'profile')
    ? filtered.map(p => ({ ...p, location: p.location }))
    : [];

  const mapCenter = selectedPro
    ? { lat: selectedPro.location.lat, lng: selectedPro.location.lng }
    : null;

  const mapZoom = phase === 'profile' ? 16 : undefined;

  return (
    <div className="uber-search">
      {/* Fullscreen Map */}
      <div className="uber-map-area">
        <MapView
          professionals={mapPros}
          userLocation={geo.latitude && geo.longitude ? { lat: geo.latitude, lng: geo.longitude } : null}
          onProfessionalClick={handleSelectPro}
          loading={geo.loading || loadingPros}
          variant="fullscreen"
          selectedId={selectedProId}
          zoom={mapZoom}
          center={mapCenter}
        />
      </div>

      {/* Floating Panels */}
      <AnimatePresence mode="wait">
        {/* ─── PHASE: Choose Service ─── */}
        {phase === 'choose' && (
          <motion.div
            key="choose"
            className="uber-panel uber-panel-choose glass-strong"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="uber-panel-handle" onClick={() => setPanelExpanded(!panelExpanded)}>
              <div className="uber-handle-bar" />
            </div>

            <div className="uber-panel-header">
              <SearchIcon size={20} />
              <h2>{t('search.title')}</h2>
            </div>

            {panelExpanded && (
              <motion.div
                key="choose"
                className="uber-panel-body"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Location Status Notice */}
                {(geo.error || (geo.latitude === 5.8268 && geo.longitude === -73.0331)) && (
                  <div className="uber-loc-notice">
                    <AlertCircle size={14} />
                    <span>{t('search.usingDefaultLocation')}</span>
                    <button 
                      className="uber-loc-retry"
                      onClick={() => window.location.reload()}
                    >
                      {t('common.retry')}
                    </button>
                  </div>
                )}

                {/* Service Categories */}
                <div className="uber-services-grid">
                  {dbServices.map((svc) => {
                    const name = svc.name;
                    const category = svc.category || name;
                    const icon = serviceIcons[category] || serviceIcons[name] || <Sparkles size={22} />;
                    const color = serviceColors[category] || serviceColors[name] || '#8b5cf6';
                    
                    return (
                      <motion.button
                        key={svc.id}
                        className={`uber-svc-btn ${selectedService === name ? 'uber-svc-active' : ''}`}
                        onClick={() => setSelectedService(name)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="uber-svc-icon" style={{ color: color, background: `${color}15` }}>
                          {icon}
                        </span>
                        <span className="uber-svc-label">{name}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Location Type */}
                <div className="uber-section">
                  <h3><MapPin size={16} /> {t('search.serviceLocation')}</h3>
                  <div className="uber-loc-toggle">
                    <button
                      className={`uber-loc-btn ${locationType === 'professional' ? 'uber-loc-active' : ''}`}
                      onClick={() => setLocationType('professional')}
                    >
                      <Building size={18} />
                      <span>{t('search.visitPro')}</span>
                    </button>
                    <button
                      className={`uber-loc-btn ${locationType === 'home' ? 'uber-loc-active' : ''}`}
                      onClick={() => setLocationType('home')}
                    >
                      <Home size={18} />
                      <span>{t('search.homeService')}</span>
                    </button>
                  </div>
                </div>

                {/* Date and Time Row */}
                <div className="uber-pickers-row">
                  <div className="uber-picker-col">
                    <h3><Calendar size={14} /> {t('search.selectDate')}</h3>
                    <DatePicker 
                      selectedDate={selectedDate} 
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setSelectedTime(''); 
                      }} 
                    />
                  </div>
                  
                  <div className="uber-picker-col">
                    <h3><Clock size={14} /> {t('search.selectTime')}</h3>
                    <ClockPicker 
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      onSelect={setSelectedTime}
                    />
                  </div>
                </div>

                {/* Search Button */}
                <motion.button
                  className="uber-search-btn"
                  disabled={!canSearch}
                  onClick={handleSearch}
                  whileHover={canSearch ? { scale: 1.02 } : {}}
                  whileTap={canSearch ? { scale: 0.98 } : {}}
                >
                  <SearchIcon size={20} />
                  {t('search.searchBtn')}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── PHASE: Searching ─── */}
        {phase === 'searching' && (
          <motion.div
            key="searching"
            className="uber-panel uber-panel-searching glass-strong"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
          >
            <div className="uber-searching-content">
              <div className="uber-radar">
                <div className="uber-radar-ring uber-radar-1" />
                <div className="uber-radar-ring uber-radar-2" />
                <div className="uber-radar-ring uber-radar-3" />
                <div className="uber-radar-dot" />
              </div>
              <div className="uber-searching-text">
                <h2>{t('search.searchingTitle')}</h2>
                <p>{t('search.searchingDesc')}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── PHASE: Results ─── */}
        {phase === 'results' && (
          <motion.div
            key="results"
            className="uber-panel uber-panel-results glass-strong"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="uber-panel-handle" onClick={() => setPanelExpanded(!panelExpanded)}>
              <div className="uber-handle-bar" />
            </div>

            <div className="uber-results-header">
              <button className="uber-back-btn" onClick={handleReset}>
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2>{filtered.length} {t('search.found')}</h2>
                <p>{selectedService} • {selectedDate && new Date(selectedDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })} • {selectedTime}</p>
              </div>
              <button className="uber-expand-btn" onClick={() => setPanelExpanded(!panelExpanded)}>
                {panelExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
            </div>

            {panelExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="uber-results-body"
              >
                {/* Favorites */}
                {favorites.length > 0 && (
                  <div className="uber-results-section">
                    <h3 className="uber-section-title">
                      <Heart size={14} fill="#fbbf24" color="#fbbf24" />
                      {t('search.favPros')}
                    </h3>
                    {favorites.map((pro, i) => (
                      <motion.div
                        key={pro.id}
                        className="uber-pro-card uber-pro-fav"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 1.0 }}
                      >
                        <img src={pro.avatar} alt={pro.name} className="uber-pro-avatar" />
                        <div className="uber-pro-info">
                          <h4>{pro.name} {pro.verified && <CheckCircle size={13} className="uber-verified" />}</h4>
                          <div className="uber-pro-meta">
                            <span><Star size={12} fill="#fbbf24" color="#fbbf24" /> {pro.rating}</span>
                            <span><MapPin size={12} /> {pro.distance.toFixed(1)} km</span>
                            <span className="uber-pro-avail">{pro.availability}</span>
                          </div>
                          <div className="uber-card-actions">
                            <button 
                              className="uber-view-pro-btn ghost"
                              onClick={() => handleSelectPro(pro.id)}
                            >
                              VER PERFIL
                            </button>
                            <button 
                              className="uber-view-pro-btn"
                              onClick={() => handleStartBooking(pro.id)}
                            >
                              AGENDAR
                            </button>
                          </div>
                        </div>
                        <div className="uber-pro-price">${pro.price}</div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Nearby */}
                <div className="uber-results-section">
                  <h3 className="uber-section-title">
                    <MapPin size={14} />
                    {t('search.nearbyPros')}
                  </h3>
                  {nearby.map((pro, i) => (
                    <motion.div
                      key={pro.id}
                      className="uber-pro-card"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (favorites.length + i) * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 1.0 }}
                    >
                      <img src={pro.avatar} alt={pro.name} className="uber-pro-avatar" />
                      <div className="uber-pro-info">
                        <h4>{pro.name} {pro.verified && <CheckCircle size={13} className="uber-verified" />}</h4>
                        <div className="uber-pro-meta">
                          <span><Star size={12} fill="#fbbf24" color="#fbbf24" /> {pro.rating}</span>
                          <span><MapPin size={12} /> {pro.distance.toFixed(1)} km</span>
                          <span className="uber-pro-avail">{pro.availability}</span>
                        </div>
                        <div className="uber-pro-tags">
                          {pro.services?.slice(0, 2).map((s: string) => <span key={s}>{s}</span>)}
                        </div>
                        <div className="uber-card-actions">
                          <button 
                            className="uber-view-pro-btn ghost"
                            onClick={() => handleSelectPro(pro.id)}
                          >
                            VER PERFIL
                          </button>
                          <button 
                            className="uber-view-pro-btn"
                            onClick={() => handleStartBooking(pro.id)}
                          >
                            AGENDAR
                          </button>
                        </div>
                      </div>
                      <div className="uber-pro-price">${pro.price}</div>
                    </motion.div>
                  ))}

                  {nearby.length === 0 && favorites.length === 0 && (
                    <div className="uber-no-results">
                      <SearchIcon size={40} />
                      <h3>{t('search.noPros')}</h3>
                      <p>{t('search.noProsDesc')}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── PHASE: Professional Profile ─── */}
        {phase === 'profile' && selectedProDetails && (
          <ProProfileDetail 
            professional={selectedProDetails}
            onBack={() => { setPhase('results'); setSelectedProId(null); }}
          />
        )}

        {phase === 'booking' && selectedPro && (
          <motion.div
            key="slot-selection"
            className="uber-panel uber-panel-profile glass-strong"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="uber-panel-handle" onClick={() => setPanelExpanded(!panelExpanded)}>
              <div className="uber-handle-bar" />
            </div>

            {/* Profile Header */}
            <div className="uber-profile-header">
              <button className="uber-back-btn" onClick={() => { setPhase('results'); setSelectedProId(null); }}>
                <ArrowLeft size={18} />
              </button>
              <img src={selectedPro.avatar} alt={selectedPro.name} className="uber-profile-avatar" />
              <div className="uber-profile-info">
                <h2>
                  {selectedPro.name}
                  {selectedPro.isFavorite && <Heart size={14} fill="#fbbf24" color="#fbbf24" />}
                  {selectedPro.verified && <CheckCircle size={14} className="uber-verified" />}
                </h2>
                <div className="uber-profile-stats">
                  <span><Star size={13} fill="#fbbf24" color="#fbbf24" /> {selectedPro.rating}</span>
                  <span><MapPin size={13} /> {selectedPro.distance?.toFixed(1)} km</span>
                  <span>{selectedPro.completedServices || 0} {t('search.services')}</span>
                </div>
              </div>
            </div>

            {panelExpanded && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="uber-profile-body">
                <div className="uber-checkout-summary">
                   <h3 className="checkout-title">Resumen de tu Reserva</h3>
                   
                   <div className="checkout-item">
                     <span className="checkout-label"><Scissors size={14}/> Servicio:</span>
                     <span className="checkout-val">{selectedService}</span>
                   </div>
                   
                   <div className="checkout-item">
                     <span className="checkout-label"><MapPin size={14}/> Ubicación:</span>
                     <span className="checkout-val">{locationType === 'home' ? t('search.homeService') : (selectedPro.location?.address || 'Local del Profesional')}</span>
                   </div>

                   <div className="checkout-item highlight-time">
                     <span className="checkout-label"><Calendar size={14}/> Fecha y Hora:</span>
                     <span className="checkout-val text-right block">
                       {selectedDate && new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                       <br/>
                       <strong>{selectedTime || 'A coordinar'}</strong>
                     </span>
                   </div>

                   <div className="checkout-total">
                     <span>Total Estimado</span>
                     <strong>${new Intl.NumberFormat('es-CO').format(bookingPrice)}</strong>
                   </div>
                   
                   <p className="checkout-disclaimer">
                     <ShieldCheck size={12}/> No se te cobrará nada hasta confirmar tu cita.
                   </p>
                </div>

                <motion.button 
                  className="uber-search-btn confirm-checkout-btn" 
                  disabled={!selectedTime || bookingLoading}
                  onClick={handleConfirmBooking}
                  whileHover={selectedTime ? { scale: 1.02 } : {}}
                  whileTap={selectedTime ? { scale: 0.98 } : {}}
                >
                  {bookingLoading ? <Loader2 className="spin-icon" size={24} /> : 'Confirmar Reserva'}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── PHASE: Confirmed ─── */}
        {phase === 'confirmed' && selectedPro && (
          <motion.div
            key="confirmed"
            className="uber-panel uber-panel-confirmed glass-strong"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <motion.div
              className="uber-confirm-check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
            >
              <Check size={40} />
            </motion.div>
            <h2>{t('search.bookingSuccess')}</h2>
            <p>{t('search.bookingSuccessDesc')}</p>

            <div className="uber-confirm-details">
              <div className="uber-confirm-pro">
                <img src={selectedPro.avatar} alt={selectedPro.name} />
                <div>
                  <strong>{selectedPro.name}</strong>
                  <span>{selectedService}</span>
                </div>
              </div>
              <div className="uber-confirm-rows">
                <div><Calendar size={14} /> <span>{selectedDate && new Date(selectedDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>
                <div><Clock size={14} /> <span>{selectedTime}</span></div>
                <div><MapPin size={14} /> <span>{locationType === 'home' ? t('search.homeService') : selectedPro.location.address}</span></div>
              </div>
              <div className="uber-confirm-price">
                <span>{t('search.total')}</span>
                <strong>${new Intl.NumberFormat('es-CO').format(bookingPrice)}</strong>
              </div>
            </div>

            <div className="uber-confirm-actions">
              <motion.button className="uber-confirm-main-btn" onClick={handleReset} whileTap={{ scale: 0.97 }}>
                {t('search.bookAnother')}
              </motion.button>
              <motion.button className="uber-confirm-ghost-btn" onClick={() => navigate('/user/appointments')} whileTap={{ scale: 0.97 }}>
                {t('search.viewAppts')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location indicator */}
      {phase !== 'confirmed' && (
        <div className="uber-location-pill glass-strong">
          <Navigation size={14} />
          <span>{geo.error ? t('search.locationError') : t('search.defaultLoc')}</span>
        </div>
      )}
    </div>
  );
}
