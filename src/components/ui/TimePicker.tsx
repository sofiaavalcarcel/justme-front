import React, { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import './TimePicker.css';

interface TimePickerProps {
  selectedDate: string;
  selectedTime: string;
  onSelect: (time: string) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({ selectedDate, selectedTime, onSelect }) => {
  

  const isToday = useMemo(() => {
    if (!selectedDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return selectedDate === today;
  }, [selectedDate]);

  const currentTime = useMemo(() => {
    const now = new Date();
    return {
      hour: now.getHours(),
      minute: now.getMinutes()
    };
  }, []);

  const slots = useMemo(() => {
    const times = [];
    for (let h = 8; h <= 20; h++) { // 8 AM to 8 PM
      for (let m = 0; m < 60; m += 30) { // Every 30 mins
        const hour12 = h > 12 ? h - 12 : h;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const label = `${hour12}:${m === 0 ? '00' : '30'} ${ampm}`;
        
        const isPast = isToday && (h < currentTime.hour || (h === currentTime.hour && m < currentTime.minute));
        
        times.push({ label, hour: h, minute: m, isPast });
      }
    }
    return times;
  }, [isToday, currentTime]);

  return (
    <div className="custom-timepicker">
      <div className="timepicker-grid">
        {slots.map((slot) => (
          <button
            key={slot.label}
            className={`time-slot-btn ${selectedTime === slot.label ? 'selected' : ''} ${slot.isPast ? 'past' : ''}`}
            disabled={slot.isPast}
            onClick={() => onSelect(slot.label)}
            title={slot.isPast ? "Esta hora ya pasó" : ""}
          >
            {slot.label}
          </button>
        ))}
      </div>
      
      {isToday && (
        <div className="time-validation-notice">
          <AlertCircle size={14} />
          <span>Solo puedes seleccionar horas futuras para hoy.</span>
        </div>
      )}
    </div>
  );
};
