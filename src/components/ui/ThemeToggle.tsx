import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

export function ThemeToggle({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const { isDark, toggleTheme } = useTheme();
  const iconSize = size === 'sm' ? 16 : 20;

  return (
    <motion.button
      className={`theme-toggle theme-toggle-${size}`}
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <Sun size={iconSize} /> : <Moon size={iconSize} />}
      </motion.div>
    </motion.button>
  );
}
