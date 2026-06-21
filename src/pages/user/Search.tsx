
import React, { useState, useMemo, useEffect, } from 'react';
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
  const [activePicker, setActivePicker] = useState<'date' | 'time'>('date');
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [servicePage, setServicePage] = useState(0);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');

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
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedBookingTime, setSelectedBookingTime] = useState(''); // time chosen in booking panel

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

  const [revealedCount, setRevealedCount] = useState(0);
  const [visibleMapPros, setVisibleMapPros] = useState<any[]>([]);
  const [scanDone, setScanDone] = useState(false);
  const scanTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // When backend pros load while in results phase, start staggered reveal
  useEffect(() => {
    if (phase !== 'results') return;
    if (revealedCount > 0) return; // already started
    const allPros = [...backendPros].sort((a, b) => a.distance - b.distance);
    if (allPros.length === 0) return;
    allPros.forEach((pro, i) => {
      setTimeout(() => {
        setRevealedCount(i + 1);
        setVisibleMapPros(prev => [...prev, pro]);
      }, i * 2000 + 500);
    });
  }, [backendPros, phase]);

  const canSearch = selectedService && selectedDate && selectedTime;

  const handleSearch = async () => {
    setRevealedCount(0);
    setVisibleMapPros([]);
    setScanDone(false);
    // Go directly to results layout — radar will show on the map while scanning
    setPhase('results');
    setPanelExpanded(true);

    // Start 10s scan timer — after this, show "no more professionals" toast
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    scanTimerRef.current = setTimeout(() => setScanDone(true), 10000);

    await fetchPros({
      service: selectedService,
      date: selectedDate,
      time: convertTo24h(selectedTime)
    });
  };

  const convertTo24h = (time12h: string): string => {
    if (!time12h) return '';
    // Already 24h format (HH:MM) — no AM/PM modifier
    if (!time12h.includes('AM') && !time12h.includes('PM')) return time12h;
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
    setAvailableSlots([]);
    setSelectedBookingTime(selectedTime ? convertTo24h(selectedTime) : '');
    const pro = favorites.find(p => String(p.id) === id) || nearby.find(p => String(p.id) === id);

    setPhase('booking');
    setPanelExpanded(true);

    try {
      // Find the selected service duration, default to 60 if not found
      const matchSvc = pro?.professionalServices?.find((ps: any) =>
        ps.service?.name === selectedService || ps.service?.category === selectedService
      );
      const duration = matchSvc?.duration || 60;

      setSlotsLoading(true);
      const slotsData = await scheduleService.getAvailableSlots(Number(id), selectedDate, duration);
      // Slots can be an array of strings or objects with { time, available }
      const parsedSlots: string[] = Array.isArray(slotsData)
        ? slotsData
          .filter((s: any) => (typeof s === 'string') || s.available !== false)
          .map((s: any) => typeof s === 'string' ? s : s.time)
        : [];
      setAvailableSlots(parsedSlots);
      // If the pre-selected time is valid keep it selected
      if (selectedTime && parsedSlots.length > 0) {
        const t24 = convertTo24h(selectedTime);
        setSelectedBookingTime(parsedSlots.includes(t24) ? t24 : (parsedSlots[0] ?? ''));
      } else if (parsedSlots.length > 0) {
        setSelectedBookingTime(parsedSlots[0] ?? '');
      }
    } catch (e) {
      console.error('Failed to fetch slots', e);
      // Fallback: keep the pre-selected time
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedPro) return;
    const timeToBook = selectedBookingTime || convertTo24h(selectedTime);
    if (!timeToBook) {
      notify('error', t('search.errorAlert'), 'Por favor selecciona un horario.');
      return;
    }
    setBookingLoading(true);
    try {
      // Resolve the correct professional service id
      const matchSvc = selectedPro.professionalServices?.find((ps: any) =>
        ps.service?.name === selectedService ||
        ps.name === selectedService ||
        ps.service?.category === selectedService
      );
      if (!matchSvc) {
        notify('error', t('search.errorAlert'), 'No se encontró el servicio seleccionado. Por favor intenta de nuevo.');
        setBookingLoading(false);
        return;
      }

      const booking = await bookingService.createBooking({
        professionalId: selectedPro.id,
        professionalServiceId: matchSvc.id,
        date: selectedDate,
        startTime: timeToBook,
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

    } catch (e: any) {
      setBookingLoading(false);
      notify('error', t('search.errorAlert'), e?.response?.data?.message || t('search.errorMsg'));
    }
  };

  const handleReset = () => {
    setPhase('choose');
    setSelectedService('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedProId(null);
    setPanelExpanded(true);
    setRevealedCount(0);
    setVisibleMapPros([]);
    setScanDone(false);
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
  };

  const allProsCount = favorites.length + nearby.length;
  // Show radar while loading OR while revealing pros OR for minimum 10s
  const isScanning = phase === 'results' && !scanDone && (loadingPros || revealedCount < allProsCount || allProsCount === 0);


  // Map professionals for MapView
  const mapPros = (phase === 'results' || phase === 'profile')
    ? (phase === 'profile' ? filtered : visibleMapPros).map((p: any) => ({ ...p, location: p.location }))
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
          loading={geo.loading}
          variant="fullscreen"
          selectedId={selectedProId}
          zoom={mapZoom}
          center={mapCenter}
        />
        {/* Radar overlay — only while scanning, no icon, waves from user dot */}
        {isScanning && (
          <div className="uber-scanning-overlay">
            <div className="uber-scan-radar">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="uber-scan-ring uber-scan-ring-animated"
                  style={{ animationDelay: `${i * 1}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scan Done Toast */}
      <AnimatePresence>
        {scanDone && (
          <motion.div
            className="uber-scan-done-toast glass-strong"
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
          >
            No se encontraron más profesionales
          </motion.div>
        )}
      </AnimatePresence>


      {/* Floating Panels */}
      <AnimatePresence mode="wait">
        {/* ─── PHASE: Choose Service ─── */}
        {phase === 'choose' && (
          <motion.div
            key="choose"
            className="search-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="search-modal-content glass-strong"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="search-modal-header">
                <SearchIcon size={24} />
                <h2>{t('search.title')}</h2>
              </div>

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

              <div className="search-modal-grid">
                {/* Left Column: Service & Location */}
                <div className="search-modal-col search-modal-left">
                  <div className="search-modal-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                      <h3 style={{ marginBottom: 0 }}><Sparkles size={16} /> Servicio a Reservar</h3>
                      <div className="mini-search-wrapper">
                        <SearchIcon size={14} className="mini-search-icon" />
                        <input
                          type="text"
                          placeholder="Buscar..."
                          value={serviceSearchQuery}
                          onChange={(e) => {
                            setServiceSearchQuery(e.target.value);
                            setServicePage(0);
                          }}
                          className="mini-search-input"
                        />
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={servicePage + serviceSearchQuery}
                        className="uber-services-grid modal-services-grid"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {(() => {
                          const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                          const query = normalize(serviceSearchQuery);
                          const filtered = dbServices.filter(svc =>
                            normalize(svc.name).includes(query) ||
                            (svc.category && normalize(svc.category).includes(query))
                          );
                          const paginated = filtered.slice(servicePage * 9, (servicePage + 1) * 9);

                          if (paginated.length === 0) {
                            return <div className="text-sm text-neutral-500 col-span-3 text-center py-4">No se encontraron servicios</div>;
                          }

                          return paginated.map((svc) => {
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
                          });
                        })()}
                      </motion.div>
                    </AnimatePresence>

                    {/* Pagination Dots */}
                    {(() => {
                      const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                      const filtered = dbServices.filter(svc => normalize(svc.name).includes(normalize(serviceSearchQuery)) || (svc.category && normalize(svc.category).includes(normalize(serviceSearchQuery))));
                      if (filtered.length <= 9) return null;
                      return (
                        <div className="services-pagination">
                          {Array.from({ length: Math.ceil(filtered.length / 9) }).map((_, idx) => (
                            <button
                              key={idx}
                              className={`service-page-dot ${servicePage === idx ? 'active' : ''}`}
                              onClick={() => setServicePage(idx)}
                            />
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="search-modal-section mt-4">
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
                </div>

                {/* Right Column: Date & Time */}
                <div className="search-modal-col search-modal-right">
                  {/* Date Accordion */}
                  <div className="search-modal-section">
                    <h3
                      onClick={() => setActivePicker('date')}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} /> {t('search.selectDate')} {selectedDate && activePicker !== 'date' && <span className="text-primary-500 ml-2">({selectedDate})</span>}
                      </span>
                      {activePicker === 'date' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </h3>
                    <AnimatePresence>
                      {activePicker === 'date' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <DatePicker
                            selectedDate={selectedDate}
                            onSelect={(date) => {
                              setSelectedDate(date);
                              setSelectedTime('');
                              setActivePicker('time'); // Auto-switch to time
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Time Accordion */}
                  <div className="search-modal-section mt-4">
                    <h3
                      onClick={() => setActivePicker('time')}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} /> {t('search.selectTime')} {selectedTime && activePicker !== 'time' && <span className="text-primary-500 ml-2">({selectedTime})</span>}
                      </span>
                      {activePicker === 'time' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </h3>
                    <AnimatePresence>
                      {activePicker === 'time' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <ClockPicker
                            selectedDate={selectedDate}
                            selectedTime={selectedTime}
                            onSelect={(time) => {
                              setSelectedTime(time);
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Search Button Full Width */}
              <motion.button
                className="uber-search-btn search-modal-submit"
                disabled={!canSearch}
                onClick={handleSearch}
                whileHover={canSearch ? { scale: 1.02 } : {}}
                whileTap={canSearch ? { scale: 0.98 } : {}}
              >
                <SearchIcon size={20} />
                {t('search.searchBtn')}
              </motion.button>

            </motion.div>
          </motion.div>
        )}

        {/* ─── PHASE: Results ─── */}
        {phase === 'results' && (
          <motion.div
            key="results"
            className="uber-panel uber-panel-results glass-strong"
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            onAnimationComplete={() => {
              if (revealedCount > 0) return; // already started
              // Stagger reveal professionals one by one — sidebar & map
              const allPros = [...favorites, ...nearby];
              if (allPros.length === 0) {
                // Backend still loading — will re-trigger when backendPros updates
                return;
              }
              allPros.forEach((pro, i) => {
                setTimeout(() => {
                  setRevealedCount(i + 1);
                  setVisibleMapPros(prev => [...prev, pro]);
                }, i * 1000 + 300);
              });
            }}
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
                      revealedCount > i && (
                        <motion.div
                          key={pro.id}
                          className="uber-pro-card uber-pro-fav"
                          initial={{ opacity: 0, x: 60, scale: 0.92 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                          whileHover={{ scale: 1.01 }}
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
                              <button className="uber-view-pro-btn ghost" onClick={() => handleSelectPro(pro.id)}>VER PERFIL</button>
                              <button className="uber-view-pro-btn" onClick={() => handleStartBooking(pro.id)}>AGENDAR</button>
                            </div>
                          </div>
                          <div className="uber-pro-price">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(pro.price) || 0)}</div>
                        </motion.div>
                      )
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
                    revealedCount > (favorites.length + i) && (
                      <motion.div
                        key={pro.id}
                        className="uber-pro-card"
                        initial={{ opacity: 0, x: 60, scale: 0.92 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                        whileHover={{ scale: 1.01 }}
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
                            <button className="uber-view-pro-btn ghost" onClick={() => handleSelectPro(pro.id)}>VER PERFIL</button>
                            <button className="uber-view-pro-btn" onClick={() => handleStartBooking(pro.id)}>AGENDAR</button>
                          </div>
                        </div>
                        <div className="uber-pro-price">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(pro.price) || 0)}</div>
                      </motion.div>
                    )
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
                    <span className="checkout-label"><Scissors size={14} /> Servicio:</span>
                    <span className="checkout-val">{selectedService}</span>
                  </div>

                  <div className="checkout-item">
                    <span className="checkout-label"><MapPin size={14} /> Ubicación:</span>
                    <span className="checkout-val">{locationType === 'home' ? t('search.homeService') : (selectedPro.location?.address || 'Local del Profesional')}</span>
                  </div>

                  <div className="checkout-item checkout-item-full">
                    <span className="checkout-label"><Calendar size={14} /> Fecha:</span>
                    <span className="checkout-val">
                      {selectedDate && new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* ── Time Slot Picker ── */}
                  <div className="checkout-slots-section">
                    <span className="checkout-label"><Clock size={14} /> Horario:</span>
                    {slotsLoading ? (
                      <div className="checkout-slots-loading">
                        <Loader2 size={18} className="spin-icon" />
                        <span>Buscando horarios...</span>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="checkout-slots-grid">
                        {availableSlots.map(slot => (
                          <button
                            key={slot}
                            className={`checkout-slot-chip ${selectedBookingTime === slot ? 'checkout-slot-active' : ''}`}
                            onClick={() => setSelectedBookingTime(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="checkout-slots-empty">
                        <span>{selectedBookingTime || selectedTime || 'No hay horarios disponibles — usa la fecha seleccionada'}</span>
                      </div>
                    )}
                  </div>

                  <div className="checkout-total">
                    <span>Total Estimado</span>
                    <strong>${new Intl.NumberFormat('es-CO').format(bookingPrice)}</strong>
                  </div>

                  <p className="checkout-disclaimer">
                    <ShieldCheck size={12} /> No se te cobrará nada hasta confirmar tu cita.
                  </p>
                </div>

                <motion.button
                  className="uber-search-btn confirm-checkout-btn"
                  disabled={(!selectedBookingTime && !selectedTime) || bookingLoading}
                  onClick={handleConfirmBooking}
                  whileHover={selectedBookingTime || selectedTime ? { scale: 1.02 } : {}}
                  whileTap={selectedBookingTime || selectedTime ? { scale: 0.98 } : {}}
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
