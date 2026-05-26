import { type InputHTMLAttributes, useState } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Input({ label, error, icon, iconRight, className = '', ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!props.value || !!props.defaultValue;

  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      <div className={`input-wrapper ${focused ? 'input-focused' : ''}`}>
        {icon && <span className="input-icon-left">{icon}</span>}
        <input
          {...props}
          className={`input-field ${icon ? 'has-icon-left' : ''} ${iconRight ? 'has-icon-right' : ''}`}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        />
        {label && (
          <label className={`input-label ${focused || hasValue ? 'input-label-float' : ''}`}>
            {label}
          </label>
        )}
        {iconRight && <span className="input-icon-right">{iconRight}</span>}
      </div>
      {error && <p className="input-error-text">{error}</p>}
    </div>
  );
}
