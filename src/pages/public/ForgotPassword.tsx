import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { apiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './ForgotPassword.css'; // Estilos exclusivos

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { openLoginModal } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleLoginRedirect = () => {
    navigate('/');
    openLoginModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Ingresa tu correo electrónico'); return; }
    setError(null);
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Ocurrió un error. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-page">
      {/* ── Capa 1: Fondo Botánico (Composición con Rojo Eléctrico) ── */}
      <div className="fp-bg-layer">
        <div className="fp-flora">
          {/* Blobs con opacidad aumentada para que el rojo sea "más vivo" */}
          <div className="fp-blob" style={{ width: '900px', height: '900px', top: '-10%', right: '-10%', background: 'var(--fp-red-vivid)', opacity: 0.8 }}></div>
          <div className="fp-blob" style={{ width: '700px', height: '700px', bottom: '-5%', right: '0%', background: 'var(--fp-amber)', opacity: 0.6 }}></div>
          <div className="fp-blob" style={{ width: '500px', height: '500px', top: '30%', right: '15%', background: 'var(--fp-red)', opacity: 0.5, filter: 'blur(120px)' }}></div>
        </div>
      </div>

      {/* ── Capa 2: Wave Orgánica Shell (Contraste Máximo) ── */}
      <div className="fp-organic-shell">
        <svg className="fp-wave-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          {/* Sombras más intensas para que el rojo de fondo resalte */}
          <path fill="rgba(0,0,0,0.05)" d="M0,0 L1000,0 C880,280 1200,480 1050,680 C950,830 1100,900 0,900 Z" />
          <path fill="rgba(255,255,255,0.4)" d="M0,0 L900,0 C800,260 1100,460 950,660 C850,810 1000,900 0,900 Z" />
          <path fill="#fff" d="M0,0 L820,0 C720,240 1020,440 870,640 C770,790 920,900 0,900 Z" />
        </svg>

        <div className="fp-form-inner">
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

            <h1>Recuperar contraseña</h1>
            <p className="login-subtitle">
              Ingresa tu correo y te enviaremos un código de verificación.
            </p>

            {sent ? (
              <div
                key="success"
                style={{
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1.5px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '20px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  textAlign: 'center',
                  animation: 'fpFadeUp 0.6s ease'
                }}
              >
                <CheckCircle size={48} color="#22c55e" />
                <div>
                  <p style={{ fontWeight: 800, color: 'var(--neutral-900)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    ¡Revisa tu correo!
                  </p>
                  <p style={{ color: 'var(--neutral-600)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Si el correo está registrado, recibirás un código de 6 dígitos en los próximos minutos.
                  </p>
                </div>
                <Button onClick={() => navigate('/reset-password', { state: { email } })} fullWidth iconRight={<ArrowRight size={18} />}>
                  Ingresar código
                </Button>
              </div>
            ) : (
              <form key="form" onSubmit={handleSubmit} className="login-form">
                <div className="register-step">
                  <label>Correo electrónico</label>
                  <Input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    icon={<Mail size={20} />}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="field-error">
                    <AlertCircle size={18} /> {error}
                  </div>
                )}

                <div className="register-actions">
                  <Button type="submit" fullWidth loading={loading} iconRight={<ArrowRight size={18} />}>
                    Enviar código
                  </Button>
                </div>
              </form>
            )}
            
            <p className="login-signup">
              ¿Recordaste tu contraseña?{' '}
              <button type="button" onClick={handleLoginRedirect} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 800, cursor: 'pointer', padding: 0 }}>
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* ── Capa 3: Detalles Decorativos (Densidad Máxima Belissa) ── */}
      <div className="fp-fg-layer" style={{ pointerEvents: 'none' }}>
        <div className="fp-flora">
          {/* GRUPO IZQUIERDO (Detrás del formulario) */}
          <div className="fp-circle" style={{ width: '400px', height: '400px', top: '-15%', left: '-10%', border: '60px solid var(--fp-red)', opacity: 0.08 }}></div>
          <div className="fp-circle" style={{ width: '300px', height: '300px', top: '-5%', left: '-5%', border: '1px solid var(--fp-red)', opacity: 0.15 }}></div>
          <div className="fp-circle" style={{ width: '200px', height: '200px', bottom: '-5%', left: '5%', border: '40px solid var(--fp-amber)', opacity: 0.06 }}></div>

          {/* LINEAS ORGANICAS (SVG) - Atraviesan la vista */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.15 }}>
            <path d="M-100,200 C200,100 400,500 800,300 S1200,100 1500,400" fill="none" stroke="var(--fp-red)" strokeWidth="1" />
            <path d="M-100,300 C300,200 500,600 900,400 S1300,200 1600,500" fill="none" stroke="var(--fp-red)" strokeWidth="0.5" />
            <path d="M0,1000 C400,800 600,400 1000,600 S1400,800 1800,200" fill="none" stroke="var(--fp-amber)" strokeWidth="1" />
          </svg>

          {/* CONSTELACION DERECHA (Llenado principal) */}
          <div className="fp-circle" style={{ width: '500px', height: '500px', top: '10%', right: '-5%', border: '2px solid var(--fp-red)', opacity: 0.1 }}></div>
          <div className="fp-circle" style={{ width: '460px', height: '460px', top: '12%', right: '-3%', border: '1px solid var(--fp-red)', opacity: 0.05 }}></div>
          
          {/* Círculos concéntricos dinámicos */}
          <div className="fp-circle" style={{ width: '150px', height: '150px', top: '40%', right: '15%', border: '20px solid var(--fp-red)', opacity: 0.12 }}></div>
          <div className="fp-circle" style={{ width: '110px', height: '110px', top: '42.5%', right: '16.5%', border: '10px solid var(--fp-amber)', opacity: 0.08 }}></div>
          
          {/* Orbes de luz (Glows) esparcidos */}
          <div className="fp-circle" style={{ width: '250px', height: '250px', top: '20%', right: '30%', background: 'var(--fp-red)', filter: 'blur(100px)', opacity: 0.12 }}></div>
          <div className="fp-circle" style={{ width: '300px', height: '300px', bottom: '10%', right: '10%', background: 'var(--fp-red)', filter: 'blur(120px)', opacity: 0.1 }}></div>
          <div className="fp-circle" style={{ width: '150px', height: '150px', bottom: '40%', right: '40%', background: 'var(--fp-amber)', filter: 'blur(80px)', opacity: 0.07 }}></div>

          {/* Detalles de acento (Dots & Rings) */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="fp-circle" style={{ 
              width: `${10 + i * 15}px`, 
              height: `${10 + i * 15}px`, 
              top: `${20 + i * 10}%`, 
              right: `${10 + i * 5}%`, 
              border: '1px solid var(--fp-red)', 
              opacity: 0.15 
            }}></div>
          ))}

          <div className="fp-circle" style={{ width: '700px', height: '700px', bottom: '-25%', right: '-15%', border: '100px solid var(--fp-red)', opacity: 0.03 }}></div>
        </div>
      </div>
    </div>
  );
}
