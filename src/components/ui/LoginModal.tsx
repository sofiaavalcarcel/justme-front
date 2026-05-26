import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, X } from 'lucide-react';
import { Button, Input } from './index';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { validateEmail, validatePassword } from '../../utils/validators';
import './LoginModal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, loginWithToken } = useAuth();
  const { notify } = useNotification();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [closing, setClosing] = useState(false);

  const googleLoginAttempted = useRef(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Handle Google OAuth callback token
  useEffect(() => {
    const token = searchParams.get('token');
    const roleParam = searchParams.get('role');

    if (token && !googleLoginAttempted.current) {
      googleLoginAttempted.current = true;
      const handleTokenCallback = async () => {
        setLoading(true);
        try {
          await loginWithToken(token, roleParam, true);
          const userRole = localStorage.getItem('justme_role') || sessionStorage.getItem('justme_role') || 'user';
          notify('success', '¡Bienvenido de nuevo!', 'Sesión iniciada correctamente.');
          triggerClose();
          if (userRole === 'admin') navigate('/admin');
          else if (userRole === 'professional') navigate('/professional');
          else navigate('/user');
        } catch {
          setApiError('Error al iniciar sesión con Google.');
        } finally {
          setLoading(false);
        }
      };
      handleTokenCallback();
    }
  }, [searchParams, loginWithToken, navigate, notify]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setClosing(false);
      setTimeout(() => firstInputRef.current?.focus(), 350);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ESC key to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) triggerClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const triggerClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
      // Reset form
      setEmail('');
      setPassword('');
      setErrors({});
      setTouched({});
      setApiError(null);
      setRememberMe(false);
      setShowPwd(false);
    }, 260);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) triggerClose();
  };

  const validate = () => {
    const emailErr = validateEmail(email);
    const pwdErr = validatePassword(password);
    const errs: typeof errors = {};
    if (emailErr) errs.email = emailErr;
    if (pwdErr) errs.password = pwdErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') {
      const err = validateEmail(email);
      setErrors(prev => ({ ...prev, email: err || undefined }));
    } else {
      const err = validatePassword(password);
      setErrors(prev => ({ ...prev, password: err || undefined }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setTouched({ email: true, password: true });
    if (!validate()) return;

    setLoading(true);
    try {
      await login({ email, password }, rememberMe);
      const userRole = localStorage.getItem('justme_role') || sessionStorage.getItem('justme_role') || 'user';
      notify('success', '¡Bienvenido de nuevo!', 'Sesión iniciada correctamente.');
      triggerClose();
      if (userRole === 'admin') navigate('/admin');
      else if (userRole === 'professional') navigate('/professional');
      else navigate('/user');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Credenciales inválidas.';
      setApiError(typeof msg === 'string' ? msg : msg[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/google`;
  };

  if (!isOpen && !closing) return null;

  return (
    <div
      ref={backdropRef}
      className={`lm-backdrop${closing ? ' lm-closing' : ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Iniciar sesión"
    >
      <div className="lm-card">
        {/* Decorative glow orbs */}
        <div className="lm-orb lm-orb-1" />
        <div className="lm-orb lm-orb-2" />

        <div className="lm-body">
          {/* ── Close button (floating top-right) ── */}
          <button
            className="lm-close"
            onClick={triggerClose}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>

          {/* ── Title ── */}
          <div className="lm-title-block">
            <h2 className="lm-title">
              Bienvenido a{' '}
              <span className="lm-title-gradient">JustMe</span>
            </h2>
            <p className="lm-subtitle">{t('login.signInSub') || 'Inicia sesión para continuar tu experiencia premium.'}</p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleLogin} className="lm-form" noValidate>
            {/* Email */}
            <div>
              <Input
                label={t('login.email') || 'Correo electrónico'}
                type="email"
                icon={<Mail size={18} />}
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (touched.email) {
                    const err = validateEmail(e.target.value);
                    setErrors(prev => ({ ...prev, email: err || undefined }));
                  }
                }}
                onBlur={() => handleBlur('email')}
                className={touched.email && errors.email ? 'input-error' : ''}
                autoComplete="email"
                id="lm-email"
              />
              {touched.email && errors.email && (
                <span className="lm-field-error">
                  <AlertCircle size={12} /> {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div>
              <Input
                label={t('login.password') || 'Contraseña'}
                type={showPwd ? 'text' : 'password'}
                icon={<Lock size={18} />}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
                    aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (touched.password) {
                    const err = validatePassword(e.target.value);
                    setErrors(prev => ({ ...prev, password: err || undefined }));
                  }
                }}
                onBlur={() => handleBlur('password')}
                className={touched.password && errors.password ? 'input-error' : ''}
                autoComplete="current-password"
                id="lm-password"
              />
              {touched.password && errors.password && (
                <span className="lm-field-error">
                  <AlertCircle size={12} /> {errors.password}
                </span>
              )}
            </div>

            {/* API Error */}
            {apiError && (
              <div className="lm-api-error">
                <AlertCircle size={16} />
                {apiError}
              </div>
            )}

            {/* Options row */}
            <div className="lm-options">
              <label className="lm-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  id="lm-remember"
                />
                {t('login.remember') || 'Recordarme'}
              </label>
              <Link to="/forgot-password" className="lm-forgot" onClick={triggerClose}>
                {t('login.forgot') || '¿Olvidaste tu contraseña?'}
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
              iconRight={<ArrowRight size={18} />}
              id="lm-submit"
            >
              {t('login.btn') || 'Iniciar sesión'}
            </Button>
          </form>

          {/* Divider */}
          <div className="lm-divider">
            <span>{t('login.or') || 'o continúa con'}</span>
          </div>

          {/* Google */}
          <button
            type="button"
            className="lm-social-btn"
            onClick={handleGoogleLogin}
            id="lm-google-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuar con Google
          </button>

          {/* Footer */}
          <p className="lm-footer-text">
            {t('login.noAccount') || '¿No tienes cuenta?'}{' '}
            <Link to="/register" onClick={triggerClose}>
              {t('login.signUpLink') || 'Regístrate gratis'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}