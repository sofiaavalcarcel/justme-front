export function validateEmail(email: string): string | null {
  if (!email) return 'El correo es obligatorio';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Formato de correo inválido';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) return 'El teléfono es obligatorio';
  if (!/^\+?[\d\s\-()]{7,15}$/.test(phone)) return 'Formato de teléfono inválido';
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `${fieldName} es obligatorio`;
  return null;
}

export function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Débil', color: 'var(--error-500)' };
  if (score <= 2) return { score, label: 'Aceptable', color: 'var(--warning-500)' };
  if (score <= 3) return { score, label: 'Buena', color: 'var(--accent-500)' };
  return { score, label: 'Fuerte', color: 'var(--success-500)' };
}
