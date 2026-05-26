import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import './Tabs.css';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange: (id: string) => void;
  variant?: 'default' | 'pills';
}

export function Tabs({ tabs, activeTab, onChange, variant = 'default' }: TabsProps) {
  const [active, setActive] = useState(activeTab || tabs[0]?.id);

  const handleClick = (id: string) => {
    setActive(id);
    onChange(id);
  };

  return (
    <div className={`tabs tabs-${variant}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab ${active === tab.id ? 'tab-active' : ''}`}
          onClick={() => handleClick(tab.id)}
        >
          {tab.icon && <span className="tab-icon">{tab.icon}</span>}
          <span>{tab.label}</span>
          {active === tab.id && variant === 'default' && (
            <motion.div
              className="tab-indicator"
              layoutId="tab-indicator"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
