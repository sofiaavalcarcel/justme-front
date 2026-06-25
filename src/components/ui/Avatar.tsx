import { useState } from 'react';
import { resolveAssetUrl } from '../../config/api';
import './Avatar.css';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

export function Avatar({ src, name, size = 'md', status, className = '' }: AvatarProps) {
  const [error, setError] = useState(false);
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  const getImageUrl = (url?: string) => resolveAssetUrl(url);

  const finalSrc = src ? getImageUrl(src) : null;

  return (
    <div className={`avatar avatar-${size} ${className}`}>
      {finalSrc && !error ? (
        <img 
          src={finalSrc} 
          alt={name} 
          className="avatar-img" 
          onError={() => setError(true)}
        />
      ) : (
        <span className="avatar-initials">{initials}</span>
      )}
      {status && <span className={`avatar-status avatar-status-${status}`} />}
    </div>
  );
}
