import { type ReactNode } from 'react';
import './Badge.css';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'accent';
  size?: 'sm' | 'md';
  dot?: boolean;
  style?: React.CSSProperties;
}

export function Badge({ children, variant = 'default', size = 'sm', dot, style }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} badge-${size}`} style={style}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}
