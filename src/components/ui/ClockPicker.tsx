import React, { useState, useMemo, useEffect, useRef } from 'react';
import './ClockPicker.css';

interface ClockPickerProps {
  selectedDate: string;
  selectedTime: string;
  onSelect: (time: string) => void;
}

export const ClockPicker: React.FC<ClockPickerProps> = ({ selectedDate, selectedTime, onSelect }) => {
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('PM');
  const [activeHour, setActiveHour] = useState<number | null>(null);
  const [activeMinute, setActiveMinute] = useState<number | null>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  // Parse existing selectedTime to set initial state
  useEffect(() => {
    if (selectedTime) {
      if (selectedTime.includes('AM')) setAmpm('AM');
      if (selectedTime.includes('PM')) setAmpm('PM');
      const parts = selectedTime.split(':');
      const h = parseInt(parts[0], 10);
      if (!isNaN(h)) setActiveHour(h);
      const mPart = parts[1]?.split(' ')[0];
      const m = parseInt(mPart, 10);
      if (!isNaN(m)) setActiveMinute(m);
    }
  }, [selectedTime]);

  const isToday = useMemo(() => {
    if (!selectedDate) return false;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return selectedDate === today;
  }, [selectedDate]);

  const now = useMemo(() => new Date(), []);
  const currentHour = now.getHours();

  const isPastHour = (hour: number) => {
    if (!isToday) return false;
    let hour24 = hour;
    if (ampm === 'PM' && hour !== 12) hour24 += 12;
    if (ampm === 'AM' && hour === 12) hour24 = 0;
    return hour24 < currentHour;
  };

  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutes = [0, 15, 30, 45];

  const handleSelect = (hour: number, minute: number, period: 'AM' | 'PM') => {
    const minStr = minute.toString().padStart(2, '0');
    const timeString = `${hour}:${minStr} ${period}`;
    onSelect(timeString);
  };

  const selectHour = (h: number) => {
    if (isPastHour(h)) return;
    setActiveHour(h);
    const min = activeMinute ?? 0;
    handleSelect(h, min, ampm);
  };

  const selectMinute = (m: number) => {
    setActiveMinute(m);
    if (activeHour) {
      handleSelect(activeHour, m, ampm);
    }
  };

  const toggleAmPm = (val: 'AM' | 'PM') => {
    setAmpm(val);
    if (activeHour != null) {
      const min = activeMinute ?? 0;
      handleSelect(activeHour, min, val);
    }
  };

  // Auto-scroll to active hour/minute
  useEffect(() => {
    if (activeHour && hourRef.current) {
      const btn = hourRef.current.querySelector(`[data-hour="${activeHour}"]`);
      btn?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeHour]);

  useEffect(() => {
    if (activeMinute != null && minuteRef.current) {
      const btn = minuteRef.current.querySelector(`[data-minute="${activeMinute}"]`);
      btn?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeMinute]);

  const displayTime = activeHour
    ? `${activeHour}:${(activeMinute ?? 0).toString().padStart(2, '0')} ${ampm}`
    : '--:--';

  return (
    <div className="tp-container">
      {/* Digital Display */}
      <div className="tp-display">
        <span className="tp-display-time">{displayTime}</span>
      </div>

      {/* Scroll Columns */}
      <div className="tp-columns">
        {/* Hours */}
        <div className="tp-column" ref={hourRef}>
          <div className="tp-column-label">HR</div>
          <div className="tp-scroll">
            {hours.map(h => {
              const disabled = isPastHour(h);
              const active = activeHour === h;
              return (
                <button
                  key={h}
                  data-hour={h}
                  className={`tp-item ${active ? 'tp-item-active' : ''} ${disabled ? 'tp-item-disabled' : ''}`}
                  onClick={() => selectHour(h)}
                  disabled={disabled}
                >
                  {h}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="tp-divider">:</div>

        {/* Minutes */}
        <div className="tp-column" ref={minuteRef}>
          <div className="tp-column-label">MIN</div>
          <div className="tp-scroll">
            {minutes.map(m => {
              const active = activeMinute === m;
              return (
                <button
                  key={m}
                  data-minute={m}
                  className={`tp-item ${active ? 'tp-item-active' : ''}`}
                  onClick={() => selectMinute(m)}
                >
                  {m.toString().padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>

        {/* AM/PM */}
        <div className="tp-column tp-column-ampm">
          <div className="tp-column-label">&nbsp;</div>
          <div className="tp-scroll tp-scroll-ampm">
            <button
              className={`tp-item tp-item-period ${ampm === 'AM' ? 'tp-item-active' : ''}`}
              onClick={() => toggleAmPm('AM')}
            >
              AM
            </button>
            <button
              className={`tp-item tp-item-period ${ampm === 'PM' ? 'tp-item-active' : ''}`}
              onClick={() => toggleAmPm('PM')}
            >
              PM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
