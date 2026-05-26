import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './DatePicker.css';

interface DatePickerProps {
  selectedDate: string;
  onSelect: (date: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onSelect }) => {
  const { i18n } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [direction, setDirection] = useState(0); // -1 = prev, 1 = next

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDate; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  const handleNextMonth = () => {
    setDirection(1);
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handlePrevMonth = () => {
    setDirection(-1);
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const isSelected = (date: Date) => selectedDate && formatDate(date) === selectedDate;
  const isPast = (date: Date) => date < today;
  const isToday = (date: Date) => date.getTime() === today.getTime();

  const canGoPrev = !(currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear());

  const monthName = currentMonth.toLocaleDateString(i18n.language || 'es-ES', { month: 'long', year: 'numeric' });
  const weekdays = i18n.language === 'es'
    ? ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Count available days (non-past) for visual indicator
  const availableDays = daysInMonth.filter(d => d && !isPast(d)).length;

  return (
    <div className="dp-container">
      {/* Header */}
      <div className="dp-header">
        <button className="dp-nav" onClick={handlePrevMonth} disabled={!canGoPrev} aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <div className="dp-month-info">
          <h4 className="dp-month-name">{monthName}</h4>
          <span className="dp-available-hint">{availableDays} días disponibles</span>
        </div>
        <button className="dp-nav" onClick={handleNextMonth} aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday Labels */}
      <div className="dp-weekdays">
        {weekdays.map((d, i) => (
          <div key={i} className="dp-weekday">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="dp-grid">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentMonth.getTime()}
            className="dp-days"
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {daysInMonth.map((date, i) => (
              <div key={i} className="dp-cell">
                {date && (
                  <button
                    className={`dp-day ${isSelected(date) ? 'dp-day-selected' : ''} ${isPast(date) ? 'dp-day-past' : ''} ${isToday(date) ? 'dp-day-today' : ''}`}
                    disabled={isPast(date)}
                    onClick={() => onSelect(formatDate(date))}
                  >
                    <span className="dp-day-num">{date.getDate()}</span>
                    {isToday(date) && <span className="dp-today-indicator" />}
                    {isSelected(date) && (
                      <motion.span
                        className="dp-selection-ring"
                        layoutId="dp-selection"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
