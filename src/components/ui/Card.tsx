import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import './Card.css';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({
  children, variant = 'default', padding = 'md', hover = false,
  className = '', onClick, style
}: CardProps) {
  return (
    <motion.div
      className={`card card-${variant} card-p-${padding} ${hover ? 'card-hover' : ''} ${className}`}
      onClick={onClick}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{ ...(onClick ? { cursor: 'pointer' } : {}), ...style }}
    >
      {children}
    </motion.div>
  );
}
