import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Home, Building, Check, ArrowLeft, ArrowRight, Loader } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { professionalsService } from '../../services/professionalsService';
import { availabilityService, type DayAvailability } from '../../services/availabilityService';
import { bookingService } from '../../services/bookingService';
import { paymentsService } from '../../services/paymentsService';
import { useNotification } from '../../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import './Booking.css';

export default function Booking() {
  const { t } = useTranslation();
  const bookingSteps = [t('booking.steps.service'), t('booking.steps.time'), t('booking.steps.location'), t('booking.steps.confirm')];
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [pro, setPro] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [proLoading, setProLoading] = useState(true);

  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [locationType, setLocationType] = useState<'professional' | 'home'>('professional');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Availability slots
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Fetch professional data
  useEffect(() => {
    if (!id) return;
    const fetchPro = async () => {
      setProLoading(true);
      try {
        const [proData, svcData] = await Promise.all([
          professionalsService.getProfessionalById(id),
          professionalsService.getServices(id),
        ]);
        setPro(proData);
        const svcList = Array.isArray(svcData) ? svcData : (svcData?.data || []);
        setServices(svcList);
      } catch (err) {
        console.error('Failed to load professional for booking', err);
        notify('error', t('booking.errorTitle'), t('booking.errorLoadData'));
      } finally {
        setProLoading(false);
      }
    };
    fetchPro();
  }, [id]);

  // Fetch availability when date or service changes
  useEffect(() => {
    if (!id || !selectedDate) return;
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const serviceId = services.find(s => s.name === selectedService)?.id;
        const data = await availabilityService.getAvailability(id, selectedDate, serviceId);
        setAvailability(data);
      } catch {
        setAvailability([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [id, selectedDate, selectedService, services]);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return { label: d.toLocaleDateString('en', { weekday: 'short' }), date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }), value: d.toISOString().split('T')[0] };
  });

  const selectedSvc = services.find(s => s.name === selectedService);

  // Get time slots for the selected date
  const getTimeSlots = () => {
    const dayAvail = availability.find(a => a.date === selectedDate);
    if (dayAvail && dayAvail.slots.length > 0) {
      return dayAvail.slots;
    }
    // Fallback: generate default time slots
    const defaultTimes = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];
    return defaultTimes.map(t => ({ time: t, available: true }));
  };

  const timeSlots = getTimeSlots();

  const handleConfirm = async () => {
    if (!pro) return;
    setLoading(true);
    try {
      const booking = await bookingService.createBooking({
        professionalId: parseInt(pro.id),
        professionalServiceId: selectedSvc?.id ? parseInt(selectedSvc.id) : 1,
        date: selectedDate,
        startTime: selectedTime,
        locationType: locationType,
        price: selectedSvc?.price || pro.price || 0,
      } as any);

      // Try payment if available
      try {
        const payment = await paymentsService.createPayment({
          amount: selectedSvc?.price || pro.price || 0,
          metadata: { bookingId: booking.id },
        });
        if (payment.init_point || payment.url) {
          notify('success', t('booking.successAlert'), t('booking.successMsgBase'));
          setTimeout(() => {
            window.location.href = payment.init_point || payment.url;
          }, 1500);
          return;
        }
      } catch {
        // Payment service might not be configured yet, still confirm booking
      }

      setConfirmed(true);
      notify('success', t('booking.successAlert'), t('booking.successMsg', { name: pro.name || pro.user?.name }));
    } catch (err: any) {
      notify('error', t('booking.errorTitle'), err?.response?.data?.message || t('booking.errorCreate'));
    } finally {
      setLoading(false);
    }
  };

  if (proLoading) {
    return (
      <div className="booking-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
      </div>
    );
  }

  if (!pro) {
    return (
      <div className="booking-page" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <p style={{ color: 'var(--neutral-400)' }}>{t('booking.notFound')}</p>
        <Button variant="ghost" onClick={() => navigate(-1)}>{t('booking.goBack')}</Button>
      </div>
    );
  }

  const proName = pro.name || pro.user?.name || 'Professional';
  const proAvatar = pro.avatar || pro.photoUrl || pro.user?.avatar;
  const proAddress = pro.location?.address || t('booking.unspecifiedLoc');

  if (confirmed) {
    return (
      <div className="booking-page">
        <motion.div className="booking-success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
          <motion.div className="success-check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}>
            <Check size={48} />
          </motion.div>
          <h2>{t('booking.successAlert')}</h2>
          <p>{t('booking.scheduled', { name: proName })}</p>
          <Card variant="glass" padding="md" className="booking-summary-card">
            <div className="summary-row"><Calendar size={16} /> <span>{selectedDate}</span></div>
            <div className="summary-row"><Clock size={16} /> <span>{selectedTime}</span></div>
            <div className="summary-row"><MapPin size={16} /> <span>{locationType === 'home' ? t('booking.homeService') : proAddress}</span></div>
          </Card>
          <div className="success-actions">
            <Button onClick={() => navigate('/user/appointments')}>{t('booking.viewAppts')}</Button>
            <Button variant="ghost" onClick={() => navigate('/user')}>{t('booking.goHome')}</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-header">
        <button className="back-btn" onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1>{t('booking.bookWith', { name: proName })}</h1>
      </div>

      {/* Progress */}
      <div className="booking-progress">
        {bookingSteps.map((s, i) => (
          <div key={s} className={`bp-step ${i <= step ? 'bp-active' : ''} ${i < step ? 'bp-done' : ''}`}>
            <div className="bp-dot">{i < step ? <Check size={12} /> : i + 1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Service */}
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="booking-step">
            <h2>{t('booking.chooseService')}</h2>
            <div className="service-options">
              {services.map(svc => {
                const svcName = svc.description?.includes(' - ') ? svc.description.split(' - ')[0] : (svc.service?.name || svc.name || 'Servicio Personalizado');
                return (
                  <Card key={svc.id || svcName} variant={selectedService === svcName ? 'glass' : 'outlined'} hover padding="md"
                    className={`svc-option ${selectedService === svcName ? 'svc-selected' : ''}`}
                    onClick={() => setSelectedService(svcName)}>
                    <div className="svc-option-info">
                      <h3>{svcName}</h3>
                      <span className="svc-dur"><Clock size={13} /> {svc.duration || 30} {t('booking.min')}</span>
                    </div>
                    <span className="svc-price">${svc.price || 0}</span>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 2: Date & Time */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="booking-step">
            <h2>{t('booking.selectDate')}</h2>
            <div className="date-grid">
              {dates.map(d => (
                <button key={d.value} className={`date-chip ${selectedDate === d.value ? 'date-active' : ''}`}
                  onClick={() => setSelectedDate(d.value)}>
                  <span className="date-day">{d.label}</span>
                  <span className="date-num">{d.date}</span>
                </button>
              ))}
            </div>
            <h2>{t('booking.selectTime')}</h2>
            {slotsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                <Loader size={24} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
              </div>
            ) : (
              <div className="time-grid">
                {timeSlots.map((slot: any) => {
                  const time = typeof slot === 'string' ? slot : slot.time;
                  const available = typeof slot === 'string' ? true : slot.available;
                  return (
                    <button
                      key={time}
                      className={`time-chip ${selectedTime === time ? 'time-active' : ''} ${!available ? 'time-disabled' : ''}`}
                      onClick={() => available && setSelectedTime(time)}
                      disabled={!available}
                      title={!available ? t('booking.notAvailable') : ''}
                    >
                      {time}
                      {!available && <span style={{ fontSize: '0.65rem', display: 'block', opacity: 0.6 }}>{t('booking.notAvailable')}</span>}
                    </button>
                  );
                })}
              </div>
            )}
            {timeSlots.length === 0 && !slotsLoading && selectedDate && (
              <p style={{ color: 'var(--neutral-400)', textAlign: 'center', fontSize: 'var(--text-sm)', marginTop: 'var(--space-3)' }}>
                {t('booking.noSlotsMsg')}
              </p>
            )}
          </motion.div>
        )}

        {/* Step 3: Location */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="booking-step">
            <h2>{t('booking.serviceLoc')}</h2>
            <div className="location-options">
              <Card variant={locationType === 'professional' ? 'glass' : 'outlined'} hover padding="md"
                className={`loc-option ${locationType === 'professional' ? 'loc-selected' : ''}`}
                onClick={() => setLocationType('professional')}>
                <Building size={24} />
                <div>
                  <h3>{t('booking.visitPro')}</h3>
                  <p>{proAddress}</p>
                </div>
              </Card>
              <Card variant={locationType === 'home' ? 'glass' : 'outlined'} hover padding="md"
                className={`loc-option ${locationType === 'home' ? 'loc-selected' : ''}`}
                onClick={() => setLocationType('home')}>
                <Home size={24} />
                <div>
                  <h3>{t('booking.homeService')}</h3>
                  <p>{t('booking.homeDesc')}</p>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="booking-step">
            <h2>{t('booking.confirmTitle')}</h2>
            <Card variant="glass" padding="lg" className="confirm-card">
              <div className="confirm-pro">
                {proAvatar && <img src={proAvatar} alt={proName} className="confirm-avatar" />}
                <div><h3>{proName}</h3><p>{selectedService}</p></div>
              </div>
              <div className="confirm-details">
                <div className="confirm-row"><Calendar size={16} /> <span>{new Date(selectedDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>
                <div className="confirm-row"><Clock size={16} /> <span>{selectedTime}</span></div>
                <div className="confirm-row"><MapPin size={16} /> <span>{locationType === 'home' ? t('booking.homeService') : proAddress}</span></div>
              </div>
              <div className="confirm-price-row">
                <span>{t('booking.estPrice')}</span>
                <span className="confirm-total">${selectedSvc?.price || pro.price || 0}</span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="booking-actions">
        {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)} icon={<ArrowLeft size={18} />}>{t('booking.btnBack')}</Button>}
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} iconRight={<ArrowRight size={18} />}
            disabled={(step === 0 && !selectedService) || (step === 1 && (!selectedDate || !selectedTime))}>
            {t('booking.btnContinue')}
          </Button>
        ) : (
          <Button onClick={handleConfirm} loading={loading} variant="accent" size="lg">
            {t('booking.btnConfirm')}
          </Button>
        )}
      </div>
    </div>
  );
}
