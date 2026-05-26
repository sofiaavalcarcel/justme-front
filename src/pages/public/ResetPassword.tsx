import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Input } from '../../components/ui';
import { apiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Key, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import './ResetPassword.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openLoginModal } = useAuth();
  const [email, setEmail] = useState((location.state as any)?.email || '');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleLoginRedirect = () => {
    navigate('/');
    openLoginModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !token || !newPassword) { setError('Todos los campos son requeridos'); return; }
    if (newPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setError(null);
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { email, token, newPassword });
      setDone(true);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Código inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-page">
      {/* ── Capa 1: Fondo Botánico ── */}
      <div className="rp-bg-layer">
        <div className="rp-flora">
          <div className="rp-blob" style={{ width: '550px', height: '550px', top: '10%', left: '-10%', background: 'var(--rp-red)', filter: 'blur(100px)', opacity: 0.3 }}></div>
          <div className="rp-blob" style={{ width: '450px', height: '450px', bottom: '15%', right: '5%', background: 'var(--rp-amber)', filter: 'blur(90px)', opacity: 0.25 }}></div>
        </div>
      </div>

      {/* ── Capa 2: Wave Orgánica Shell ── */}
      <div className="rp-organic-shell">
        <svg className="rp-wave-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <path 
            fill="#fff" 
            d="M-100,0 C250,150 400,-100 700,200 C900,400 1200,100 1540,300 L1540,900 L-100,900 Z"
            style={{ transition: 'all 0.8s ease' }}
          />
        </svg>

        <div className="rp-form-inner">
          <div className="login-form-container">
           <div style={{ marginBottom: '1.2rem' }}>
            <Link to="/" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              textDecoration: 'none', 
              color: 'var(--neutral-500)',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}>
              <ArrowLeft size={16} />
              Volver
            </Link>
          </div>

          <h1>Nueva contraseña</h1>
          <p className="login-subtitle">
            Ingresa el código de 6 dígitos que enviamos a tu correo y escoge tu nueva contraseña.
          </p>

          {done ? (
            <div
              key="success"
              style={{
                background: 'var(--success-50, #f0fdf4)',
                border: '1.5px solid var(--success-300, #86efac)',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'center',
              }}
            >
              <CheckCircle size={44} color="#22c55e" />
              <div>
                <p style={{ fontWeight: 700, color: 'var(--neutral-900)', marginBottom: 4 }}>
                  ¡Contraseña actualizada!
                </p>
                <p style={{ color: 'var(--neutral-500)', fontSize: 14 }}>
                  Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
              </div>
               <Button onClick={handleLoginRedirect} fullWidth iconRight={<ArrowRight size={18} />}>
                Ir al login
              </Button>
            </div>
          ) : (
            <form key="form" onSubmit={handleSubmit} className="login-form">
              <Input
                label="Correo electrónico"
                type="email"
                icon={<Mail size={18} />}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <Input
                label="Código de verificación"
                type="text"
                icon={<Key size={18} />}
                value={token}
                onChange={e => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
              />

              <Input
                label="Nueva contraseña"
                type={showPwd ? 'text' : 'password'}
                icon={<Lock size={18} />}
                iconRight={
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />

              {error && (
                <div
                  className="field-error"
                  style={{ background: 'var(--error-50)', padding: '10px 14px', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--error-500)' }}
                >
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <Button type="submit" fullWidth loading={loading} size="lg" iconRight={<ArrowRight size={18} />}>
                Cambiar contraseña
              </Button>

              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--neutral-500)' }}>
                ¿No recibiste el código?{' '}
                <Link to="/forgot-password" style={{ color: 'var(--primary-500)', fontWeight: 600 }}>
                  Reenviar
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>

    {/* ── Capa 3: Detalles Decorativos ── */}
      <div className="rp-fg-layer">
        <div className="rp-flora">
          <div className="rp-circle" style={{ width: '120px', height: '120px', top: '20%', right: '15%', border: '20px solid var(--rp-red)', opacity: 0.1 }}></div>
          <div className="rp-circle" style={{ width: '70px', height: '70px', bottom: '10%', left: '25%', border: '15px solid var(--rp-amber)', opacity: 0.1 }}></div>
        </div>
      </div>
    </div>
  );
}
