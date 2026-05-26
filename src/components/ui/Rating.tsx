import { Star } from 'lucide-react';
import './Rating.css';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (value: number) => void;
  showValue?: boolean;
  count?: number;
}

export function Rating({ value, max = 5, size = 'md', onChange, showValue = false, count }: RatingProps) {
  return (
    <div className={`rating rating-${size}`}>
      <div className="rating-stars">
        {Array.from({ length: max }, (_, i) => (
          <Star
            key={i}
            className={`rating-star ${i < Math.floor(value) ? 'star-filled' : i < value ? 'star-half' : 'star-empty'}`}
            onClick={() => onChange?.(i + 1)}
            style={onChange ? { cursor: 'pointer' } : undefined}
          />
        ))}
      </div>
      {showValue && <span className="rating-value">{value.toFixed(1)}</span>}
      {count !== undefined && <span className="rating-count">({count})</span>}
    </div>
  );
}
