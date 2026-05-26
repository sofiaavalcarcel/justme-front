import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Trash2, Loader as LoaderIcon } from 'lucide-react';
import { Card, Button, Badge, Modal } from '../../components/ui';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { professionalsService } from '../../services/professionalsService';
import { useTranslation } from 'react-i18next';
import './ProSchedule.css';

export default function ProSchedule() {
  const { t } = useTranslation();
  const englishDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayKeys: Record<string, string> = {
    Monday: 'monday',
    Tuesday: 'tuesday',
    Wednesday: 'wednesday',
    Thursday: 'thursday',
    Friday: 'friday',
    Saturday: 'saturday',
    Sunday: 'sunday'
  };

  const { notify } = useNotification();
  const { professionalId } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [showExModal, setShowExModal] = useState(false);
  const [exData, setExData] = useState({ date: '', isFullDay: true, startTime: '09:00', endTime: '18:00', reason: '' });

  const [schedule, setSchedule] = useState<any>({
    activeDays: { Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true, Saturday: true, Sunday: false },
    dayTimes: {
      Monday: { start: '09:00', end: '18:00' },
      Tuesday: { start: '09:00', end: '18:00' },
      Wednesday: { start: '09:00', end: '18:00' },
      Thursday: { start: '09:00', end: '18:00' },
      Friday: { start: '09:00', end: '18:00' },
      Saturday: { start: '09:00', end: '18:00' },
      Sunday: { start: '09:00', end: '18:00' },
    },
    breaks: [{ name: t('proSchedule.lunchBreak'), start: '13:00', end: '14:00' }],
    maxAppointments: 8,
    bufferTime: 15,
    advanceNotice: 2,
  });

  // Load schedule and exceptions from backend
  useEffect(() => {
    if (!professionalId) { setLoading(false); return; }
    
    const loadData = async () => {
      try {
        const proData = await professionalsService.getProfessionalById(professionalId);
        if (proData) {
          // Initialize with clean defaults
          const loadedSchedule: any = {
            activeDays: {},
            dayTimes: {},
            breaks: [],
            maxAppointments: proData.maxAppointments !== undefined ? Number(proData.maxAppointments) : 8,
            bufferTime: proData.bufferTime !== undefined ? Number(proData.bufferTime) : 15,
            advanceNotice: proData.advanceNotice !== undefined ? Number(proData.advanceNotice) : 2,
          };

          // Fill defaults for each day
          englishDays.forEach(day => {
            loadedSchedule.activeDays[day] = false;
            loadedSchedule.dayTimes[day] = { start: '09:00', end: '18:00' };
          });

          if (proData.schedules && proData.schedules.length > 0) {
            proData.schedules.forEach((s: any) => {
              if (s.dayOfWeek) {
                loadedSchedule.activeDays[s.dayOfWeek] = s.isActive;
                loadedSchedule.dayTimes[s.dayOfWeek] = {
                  start: s.startTime?.substring(0, 5) || '09:00',
                  end: s.endTime?.substring(0, 5) || '18:00'
                };
              }
            });

            // Map breaks from the first day that has them (frontend uses global breaks)
            const firstWithBreaks = proData.schedules.find((s: any) => s.breaks && s.breaks.length > 0);
            if (firstWithBreaks) {
              loadedSchedule.breaks = firstWithBreaks.breaks.map((b: any) => ({
                name: b.title || t('proSchedule.lunchBreak'),
                start: b.startTime?.substring(0, 5),
                end: b.endTime?.substring(0, 5)
              }));
            }
          }
          
          setSchedule(loadedSchedule);
        }
        
        const exListData = await professionalsService.getExceptions(professionalId);
        setExceptions(Array.isArray(exListData) ? exListData : []);
      } catch (err) {
        console.warn('Error loading schedule data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [professionalId]);

  const toggleDay = (engDay: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      activeDays: { ...prev.activeDays, [engDay]: !prev.activeDays[engDay] }
    }));
  };

  const updateDayTime = (engDay: string, field: 'start' | 'end', value: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      dayTimes: { ...prev.dayTimes, [engDay]: { ...prev.dayTimes[engDay], [field]: value } }
    }));
  };

  const updateBreak = (idx: number, field: 'start' | 'end', value: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      breaks: prev.breaks.map((b: any, i: number) => i === idx ? { ...b, [field]: value } : b)
    }));
  };

  const removeBreak = (idx: number) => {
    setSchedule((prev: any) => ({ ...prev, breaks: prev.breaks.filter((_: any, i: number) => i !== idx) }));
  };

  const addBreak = () => {
    setSchedule((prev: any) => ({
      ...prev,
      breaks: [...prev.breaks, { name: t('proSchedule.newBreak'), start: '15:00', end: '15:30' }]
    }));
  };

  const handleSave = async () => {
    if (!professionalId) return;
    setSaving(true);
    try {
      await professionalsService.updateProfile(professionalId, { schedule } as any);
      notify('success', t('proSchedule.success'), t('proSchedule.successMsg'));
    } catch (err: any) {
      notify('error', t('proSchedule.error'), err?.response?.data?.message || t('proSchedule.errorMsg'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddException = async () => {
    if (!professionalId || !exData.date) return;
    try {
      const newEx = await professionalsService.addException(professionalId, exData);
      setExceptions([...exceptions, newEx]);
      setShowExModal(false);
      setExData({ date: '', isFullDay: true, startTime: '09:00', endTime: '18:00', reason: '' });
      notify('success', t('proSchedule.exSuccess', 'Excepción guardada'), t('proSchedule.exSuccessMsg', 'El horario ha sido bloqueado correctamente.'));
    } catch (err: any) {
      notify('error', t('proSchedule.exError', 'Error'), err?.response?.data?.message || 'No se pudo guardar la excepción.');
    }
  };

  const handleDeleteException = async (id: number) => {
    try {
      await professionalsService.deleteException(id);
      setExceptions(exceptions.filter(ex => ex.id !== id));
      notify('success', t('proSchedule.exDeleted', 'Excepción eliminada'));
    } catch (err: any) {
      notify('error', t('proSchedule.exDeleteError', 'Error'), 'No se pudo eliminar la excepción.');
    }
  };

  if (loading) {
    return (
      <div className="pro-schedule" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LoaderIcon size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
      </div>
    );
  }

  return (
    <div className="pro-schedule">
      <div className="ps-header">
        <h1>{t('proSchedule.title')}</h1>
        <p>{t('proSchedule.subtitle')}</p>
      </div>

      <div className="ps-content">
        <div className="ps-left">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card variant="default" padding="lg">
              <h2 className="ps-card-title"><Calendar size={18} /> {t('proSchedule.workingDays.title')}</h2>
              <div className="ps-days-list">
                {englishDays.map((engDay) => {
                  const isActive = schedule.activeDays[engDay];
                  const dayLabel = t(`proSchedule.workingDays.${dayKeys[engDay]}`);
                  return (
                    <div key={engDay} className={`ps-day-row ${!isActive ? 'ps-day-off' : ''}`}>
                      <label className="ps-toggle">
                        <input type="checkbox" checked={isActive} onChange={() => toggleDay(engDay)} />
                        <span className="ps-slider"></span>
                      </label>
                      <span className="ps-day-name">{dayLabel}</span>
                      {isActive ? (
                        <div className="ps-time-inputs">
                          <input type="time" value={schedule.dayTimes[engDay]?.start || '09:00'} onChange={e => updateDayTime(engDay, 'start', e.target.value)} />
                          <span>{t('proSchedule.to')}</span>
                          <input type="time" value={schedule.dayTimes[engDay]?.end || '18:00'} onChange={e => updateDayTime(engDay, 'end', e.target.value)} />
                        </div>
                      ) : (
                        <span className="ps-closed-lbl">{t('proSchedule.off')}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card variant="default" padding="lg" className="mt-4">
              <div className="ps-card-header">
                <h2 className="ps-card-title"><Clock size={18} /> {t('proSchedule.breaks')}</h2>
                <Button size="sm" variant="secondary" onClick={addBreak}>{t('proSchedule.addBreak')}</Button>
              </div>
              <div className="ps-breaks-list">
                {schedule.breaks.map((brk: any, idx: number) => (
                  <div key={idx} className="ps-break-row">
                    <span className="ps-break-name">{brk.name}</span>
                    <div className="ps-time-inputs">
                      <input type="time" value={brk.start} onChange={e => updateBreak(idx, 'start', e.target.value)} />
                      <span>{t('proSchedule.to')}</span>
                      <input type="time" value={brk.end} onChange={e => updateBreak(idx, 'end', e.target.value)} />
                    </div>
                    <button className="ps-btn-delete" onClick={() => removeBreak(idx)}><Trash2 size={16} /></button>
                  </div>
                ))}
                {schedule.breaks.length === 0 && (
                  <p className="ps-empty-text">{t('proSchedule.noBreaks')}</p>
                )}
              </div>
            </Card>

            <Card variant="default" padding="lg" className="mt-4">
              <div className="ps-card-header">
                <h2 className="ps-card-title"><Calendar size={18} /> {t('proSchedule.exceptions.title', 'Días Especiales y Bloqueos')}</h2>
                <Button size="sm" variant="secondary" onClick={() => setShowExModal(true)}>{t('proSchedule.addException', 'Añadir Bloqueo')}</Button>
              </div>
              <div className="ps-exceptions-list">
                {exceptions.map((ex: any) => (
                  <div key={ex.id} className="ps-exception-row">
                    <div className="ps-ex-info">
                      <p className="ps-ex-date">{new Date(ex.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                      <p className="ps-ex-reason">{ex.reason || (ex.isFullDay ? 'Día Completo' : `${ex.startTime} - ${ex.endTime}`)}</p>
                    </div>
                    <button className="ps-btn-delete" onClick={() => handleDeleteException(ex.id)}><Trash2 size={16} /></button>
                  </div>
                ))}
                {exceptions.length === 0 && (
                  <p className="ps-empty-text">No hay bloqueos programados.</p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="ps-right">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card variant="default" padding="lg" className="ps-settings-card">
              <h2 className="ps-card-title">{t('proSchedule.preferences')}</h2>

              <div className="ps-form-group">
                <label>{t('proSchedule.maxAppts')}</label>
                <input type="number" value={schedule.maxAppointments} min={1} max={20} onChange={e => setSchedule((prev: any) => ({ ...prev, maxAppointments: parseInt(e.target.value) || 8 }))} />
                <p className="ps-help-text">{t('proSchedule.stopMsg')}</p>
              </div>

              <div className="ps-form-group">
                <label>{t('proSchedule.buffer')}</label>
                <select value={String(schedule.bufferTime)} onChange={e => setSchedule((prev: any) => ({ ...prev, bufferTime: parseInt(e.target.value) }))}>
                  <option value="0">{t('proSchedule.noBuffer')}</option>
                  <option value="10">10 {t('proSchedule.minutes')}</option>
                  <option value="15">15 {t('proSchedule.minutes')}</option>
                  <option value="30">30 {t('proSchedule.minutes')}</option>
                </select>
              </div>

              <div className="ps-form-group">
                <label>{t('proSchedule.advance')}</label>
                <select value={String(schedule.advanceNotice)} onChange={e => setSchedule((prev: any) => ({ ...prev, advanceNotice: parseInt(e.target.value) }))}>
                  <option value="1">1 {t('proSchedule.hours')}</option>
                  <option value="2">2 {t('proSchedule.hours')}</option>
                  <option value="3">3 {t('proSchedule.hours')}</option>
                  <option value="6">6 {t('proSchedule.hours')}</option>
                  <option value="12">12 {t('proSchedule.hours')}</option>
                  <option value="24">24 {t('proSchedule.hours')}</option>
                  <option value="48">48 {t('proSchedule.hours')}</option>
                </select>
                <p className="ps-help-text">{t('proSchedule.advanceHelp')}</p>
              </div>
            </Card>

            <Card variant="glass" padding="md" className="ps-info-card">
              <h3><Badge variant="primary" size="sm">{t('proSchedule.autoBooking')}</Badge></h3>
              <p>{t('proSchedule.autoBookingMsg')}</p>
            </Card>

            <Button className="ps-save-btn" onClick={handleSave} loading={saving}>
              {t('proSchedule.saveBtn')}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Exceptions Modal */}
      <Modal 
        isOpen={showExModal} 
        onClose={() => setShowExModal(false)} 
        title={t('proSchedule.addException', 'Añadir Bloqueo')}
        size="md"
      >
        <div className="ps-form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label>Fecha *</label>
          <input type="date" value={exData.date} min={new Date().toISOString().split('T')[0]} onChange={e => setExData({ ...exData, date: e.target.value })} />
        </div>

        <div style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="isFullDay" checked={exData.isFullDay} onChange={e => setExData({ ...exData, isFullDay: e.target.checked })} />
          <label htmlFor="isFullDay" style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Bloquear todo el día</label>
        </div>

        {!exData.isFullDay && (
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Desde</label>
              <input type="time" style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-200)' }} value={exData.startTime} onChange={e => setExData({ ...exData, startTime: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Hasta</label>
              <input type="time" style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-200)' }} value={exData.endTime} onChange={e => setExData({ ...exData, endTime: e.target.value })} />
            </div>
          </div>
        )}

        <div className="ps-form-group" style={{ marginBottom: 'var(--space-6)' }}>
          <label>Motivo (opcional)</label>
          <input type="text" placeholder="Ej: Vacaciones, Cita médica..." value={exData.reason} onChange={e => setExData({ ...exData, reason: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setShowExModal(false)}>Cancelar</Button>
          <Button onClick={handleAddException} disabled={!exData.date}>Añadir Bloqueo</Button>
        </div>
      </Modal>
    </div>
  );
}
