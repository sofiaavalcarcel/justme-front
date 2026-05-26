import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft, Check, Heart, Scissors, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { LanguageToggle } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { validateEmail, validatePassword, validateRequired, validatePhone, getPasswordStrength } from '../../utils/validators';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const steps = [
    t('register.step0'),
    t('register.step1'),
    t('register.step2')
  ];

  const { register, openLoginModal } = useAuth();

  const handleLoginRedirect = () => {
    navigate('/');
    openLoginModal();
  };

  const { notify } = useNotification();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'user' | 'professional'>('user');
  const [form, setForm] = useState({ name: '', lastName: '', docType: 'CC', docNumber: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const update = (key: string, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (touched[key]) validateField(key, val);
  };

  const validateField = (key: string, value?: string) => {
    const val = value ?? form[key as keyof typeof form];
    let err: string | null = null;
    switch (key) {
      case 'name': err = validateRequired(val, 'Nombre'); break;
      case 'lastName': err = validateRequired(val, 'Apellidos'); break;
      case 'docType': err = validateRequired(val, 'Tipo de documento'); break;
      case 'docNumber': err = validateRequired(val, 'Número de documento'); break;
      case 'phone': err = validatePhone(val); break;
      case 'email': err = validateEmail(val); break;
      case 'password': err = validatePassword(val); break;
      case 'confirmPassword':
        err = val !== form.password ? 'Las contraseñas no coinciden' : null;
        break;
    }
    setErrors(prev => ({ ...prev, [key]: err || undefined }));
    return !err;
  };

  const handleBlur = (key: string) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    validateField(key);
  };

  const validateStep = (): boolean => {
    if (step === 0) return true;
    if (step === 1) {
      const fields = ['name', 'lastName', 'docType', 'docNumber', 'phone'];
      fields.forEach(f => { setTouched(prev => ({ ...prev, [f]: true })); validateField(f); });
      return fields.every(f => {
        const val = form[f as keyof typeof form];
        if (f === 'name') return !validateRequired(val, 'Nombre');
        if (f === 'lastName') return !validateRequired(val, 'Apellidos');
        if (f === 'docType') return !validateRequired(val, 'Tipo de documento');
        if (f === 'docNumber') return !validateRequired(val, 'Número de documento');
        if (f === 'phone') return !validatePhone(val);
        return true;
      });
    }
    if (step === 2) {
      const fields = ['email', 'password', 'confirmPassword'];
      fields.forEach(f => { setTouched(prev => ({ ...prev, [f]: true })); validateField(f); });
      return fields.every(f => {
        const val = form[f as keyof typeof form];
        if (f === 'email') return !validateEmail(val);
        if (f === 'password') return !validatePassword(val);
        if (f === 'confirmPassword') return val === form.password;
        return true;
      });
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    if (step < 2) { setStep(step + 1); return; }

    setLoading(true);
    try {
      await register({
        name: form.name,
        lastName: form.lastName,
        docType: form.docType,
        docNumber: form.docNumber,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: role
      });

      const userRole = localStorage.getItem('justme_role') || role;
      notify('success', '¡Cuenta creada!', 'Bienvenido a JustMe.');
      navigate(userRole === 'admin' ? '/admin' : userRole === 'professional' ? '/professional' : '/user');
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 409) {
        // Email duplicado: llevar al paso 2 y marcar el campo en rojo
        setStep(2);
        setTouched(prev => ({ ...prev, email: true }));
        setErrors(prev => ({ ...prev, email: 'Este correo ya está registrado' }));
      } else {
        notify('error', 'Error al registrarse', typeof msg === 'string' ? msg : 'No se pudo crear la cuenta.');
      }
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = getPasswordStrength(form.password);

  return (
    <div className="rg-page">

      {/* ── Capa 1: Flora Botánica Belissa (Composición con Sentido) ── */}
      <div className="rg-bg-layer" aria-hidden="true">
        <svg className="rg-flora-svg" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Grupo Derecha: Ramo Principal Integrado */}
          <g opacity="0.85">
            {/* Hojas Base que dan estructura */}
            <path d="M1100 0 C980 60,880 180,940 360 C1000 540,1140 580,1200 480 C1260 380,1240 200,1100 0Z" fill="var(--flora-red)" opacity="0.4" />
            <path d="M1250 200 C1160 140,1040 200,1080 380 C1120 560,1280 600,1340 480 C1400 360,1380 280,1250 200Z" fill="var(--flora-red)" opacity="0.3" />
            
            {/* Tallos que nacen de la composición */}
            <line x1="1050" y1="0" x2="1020" y2="800" stroke="var(--flora-red)" strokeWidth="1.2" opacity="0.4" />
            <line x1="1200" y1="100" x2="1180" y2="800" stroke="var(--flora-amber)" strokeWidth="1" opacity="0.3" />
            
            {/* Anillos de Enmarque (Personalidad Editorial) */}
            <circle cx="1180" cy="420" r="200" stroke="var(--flora-red)" strokeWidth="0.5" opacity="0.15" />
            <circle cx="1180" cy="420" r="240" stroke="var(--flora-red)" strokeWidth="0.5" opacity="0.1" />

            {/* Hojas de Acento en Ámbar */}
            <path d="M980 500 C880 440,760 480,800 640 C840 800,1000 820,1060 700 C1120 580,1100 560,980 500Z" fill="var(--flora-amber)" opacity="0.25" />
            <path d="M1350 550 C1260 510,1160 570,1200 710 C1240 850,1380 860,1400 770 C1420 680,1420 590,1350 550Z" fill="var(--flora-red)" opacity="0.2" />

            {/* Nodos de Energía Focalizados */}
            <circle cx="1060" cy="120" r="22" fill="var(--flora-amber)" opacity="0.6" style={{ filter: 'blur(3px)' }} />
            <circle cx="1320" cy="380" r="14" fill="var(--flora-red)" opacity="0.5" />
            <circle cx="1190" cy="660" r="10" fill="var(--flora-amber)" opacity="0.4" />
          </g>

          {/* Detalle en Esquina Inferior Izquierda (Sutil) */}
          <g opacity="0.25">
            <path d="M0 650 C60 580,160 600,150 720 C140 840,40 860,0 780Z" fill="var(--flora-red)" />
          </g>
        </svg>

        {/* Aura Atmosférica Belissa */}
        <div className="rg-ambient rg-ambient--red" style={{ opacity: 0.12, filter: 'blur(160px)', width: '900px', height: '900px', top: '-10%', right: '-10%' }} />
      </div>

      {/* ── Capa 2: Waves de Seda + Formulario ── */}
      <div className="rg-organic-shell">
        <div className="rg-wave-container">
          <svg className="rg-wave-svg wave-bg" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L0 800 C150 800,400 790,550 770 C750 740,820 680,825 600 C830 520,750 480,780 380 C810 280,950 240,900 120 C850 40,780 0,650 0 Z" fill="white" opacity="0.6" />
          </svg>
          <svg className="rg-wave-svg wave-main" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0 L0 800 C100 800,280 800,420 785 C580 765,720 720,725 640 C730 560,650 520,680 430 C710 340,820 290,780 150 C740 50,680 0,550 0 Z" fill="white" />
          </svg>
        </div>

        <div className="rg-form-inner">
          <div className="login-form-container">

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <Link to="/" className="rg-back-link" style={{ 
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
              <LanguageToggle size="sm" />
            </div>

            <h1>{t('register.createAcc')}</h1>
            <p className="login-subtitle">{t('register.createAccSub')}</p>

            {/* Progress */}
            <div className="register-progress">
              {steps.map((s, i) => (
                <div key={s} className={`progress-step ${i <= step ? 'progress-active' : ''} ${i < step ? 'progress-done' : ''}`}>
                  <div className="progress-dot">
                    {i < step ? <Check size={12} /> : <span>{i + 1}</span>}
                  </div>
                  <span className="progress-label">{s}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="register-step">
                    <p className="step-question">{t('register.question')}</p>
                    <div className="role-cards">
                      <motion.div className={`role-card ${role === 'user' ? 'role-card-active' : ''}`} onClick={() => setRole('user')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <span className="role-card-emoji"><Heart size={32} /></span>
                        <h3>{t('register.roleUserTitle')}</h3>
                        <p>{t('register.roleUserDesc')}</p>
                      </motion.div>
                      <motion.div className={`role-card ${role === 'professional' ? 'role-card-active' : ''}`} onClick={() => setRole('professional')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <span className="role-card-emoji"><Scissors size={32} /></span>
                        <h3>{t('register.roleProTitle')}</h3>
                        <p>{t('register.roleProDesc')}</p>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="register-step">
                    <div className="form-field">
                      <Input label={t('register.name')} icon={<User size={18} />} value={form.name} onChange={e => update('name', e.target.value)} onBlur={() => handleBlur('name')} className={touched.name && errors.name ? 'input-error' : ''} />
                      <AnimatePresence>
                        {touched.name && errors.name && (
                          <motion.span className="field-error" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                            <AlertCircle size={12} /> {errors.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="form-field">
                      <Input label={t('register.lastName')} icon={<User size={18} />} value={form.lastName} onChange={e => update('lastName', e.target.value)} onBlur={() => handleBlur('lastName')} className={touched.lastName && errors.lastName ? 'input-error' : ''} />
                      <AnimatePresence>
                        {touched.lastName && errors.lastName && (
                          <motion.span className="field-error" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                            <AlertCircle size={12} /> {errors.lastName}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    {/* Tipo de documento */}
                    <div className="form-field">
                      <label style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 700, 
                        color: 'var(--neutral-700)', 
                        display: 'block', 
                        marginBottom: 6,
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        fontFamily: 'var(--font-display)'
                      }}>
                        {t('register.docType')}
                      </label>
                      <select
                        value={form.docType}
                        onChange={e => update('docType', e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--neutral-200)', background: 'var(--surface-primary)', color: 'var(--neutral-900)', fontSize: 14 }}
                      >
                        <option value="CC">Cédula de Ciudadanía (CC)</option>
                        <option value="CE">Cédula de Extranjería (CE)</option>
                        <option value="TI">Tarjeta de Identidad (TI)</option>
                        <option value="PP">Pasaporte (PP)</option>
                        <option value="NIT">NIT</option>
                      </select>
                      <AnimatePresence>
                        {touched.docType && errors.docType && (
                          <motion.span className="field-error" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                            <AlertCircle size={12} /> {errors.docType}
                          </motion.span>
                        )}
                      </AnimatePresence>

                    </div>
                    <div className="form-field">
                      <Input label="Número de documento" icon={<User size={18} />} value={form.docNumber} onChange={e => update('docNumber', e.target.value)} onBlur={() => handleBlur('docNumber')} className={touched.docNumber && errors.docNumber ? 'input-error' : ''} />
                      <AnimatePresence>
                        {touched.docNumber && errors.docNumber && (
                          <motion.span className="field-error" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                            <AlertCircle size={12} /> {errors.docNumber}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="form-field">
                      <Input label={t('register.phone')} icon={<Phone size={18} />} type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} onBlur={() => handleBlur('phone')} className={touched.phone && errors.phone ? 'input-error' : ''} />
                      <AnimatePresence>
                        {touched.phone && errors.phone && (
                          <motion.span className="field-error" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                            <AlertCircle size={12} /> {errors.phone}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="register-step">
                    <div className="form-field">
                      <Input label={t('register.email')} icon={<Mail size={18} />} type="email" value={form.email} onChange={e => update('email', e.target.value)} onBlur={() => handleBlur('email')} className={touched.email && errors.email ? 'input-error' : ''} />
                      <AnimatePresence>
                        {touched.email && errors.email && (
                          <motion.span className="field-error" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                            <AlertCircle size={12} /> {errors.email}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="form-field">
                      <Input
                        label={t('register.password')}
                        icon={<Lock size={18} />}
                        type={showPwd ? 'text' : 'password'}
                        iconRight={
                          <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>
                            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        }
                        value={form.password}
                        onChange={e => update('password', e.target.value)}
                        onBlur={() => handleBlur('password')}
                        className={touched.password && errors.password ? 'input-error' : ''}
                      />
                      {form.password && (
                        <div className="pwd-strength">
                          <div className="pwd-strength-bar">
                            <div className="pwd-strength-fill" style={{ width: `${(pwdStrength.score / 5) * 100}%`, background: pwdStrength.color }} />
                          </div>
                          <span className="pwd-strength-label" style={{ color: pwdStrength.color }}>{pwdStrength.label}</span>
                        </div>
                      )}
                      <AnimatePresence>
                        {touched.password && errors.password && (
                          <motion.span className="field-error" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                            <AlertCircle size={12} /> {errors.password}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="form-field">
                      <Input
                        label={t('register.confirmPassword')}
                        icon={<Lock size={18} />}
                        type={showConfirmPwd ? 'text' : 'password'}
                        iconRight={
                          <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>
                            {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        }
                        value={form.confirmPassword}
                        onChange={e => update('confirmPassword', e.target.value)}
                        onBlur={() => handleBlur('confirmPassword')}
                        className={touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}
                      />
                      <AnimatePresence>
                        {touched.confirmPassword && errors.confirmPassword && (
                          <motion.span className="field-error" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                            <AlertCircle size={12} /> {errors.confirmPassword}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="register-actions">
                {step > 0 && (
                  <Button type="button" variant="ghost" onClick={() => setStep(step - 1)} icon={<ArrowLeft size={18} />}>
                    {t('register.btnBack')}
                  </Button>
                )}
                <Button type="submit" fullWidth={step === 0} loading={loading && step === 2} iconRight={step < 2 ? <ArrowRight size={18} /> : undefined}>
                  {step < 2 ? t('register.btnContinue') : t('register.btnCreate')}
                </Button>
              </div>
            </form>

            <p className="login-signup">
              {t('register.hasAccount')} <button type="button" onClick={handleLoginRedirect} style={{ background: 'none', border: 'none', color: 'var(--primary-500)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>{t('register.signInLink')}</button>
            </p>
          </div>{/* /login-form-container */}
        </div>{/* /rg-form-inner */}
      </div>{/* /rg-organic-shell */}

      {/* ── LAYER 3: Botánico foreground (sobre la wave blanca) ── */}
      <div className="rg-fg-layer" aria-hidden="true">
        <svg className="rg-flora" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hoja grande superpuesta al borde derecho de la wave */}
          <path d="M820 100 C740 40,640 80,680 240 C720 400,860 440,900 340 C940 240,920 160,820 100Z" fill="var(--flora-red)" style={{ filter: 'blur(1px)' }} />
          <path d="M780 400 C700 340,600 380,640 540 C680 700,820 720,860 620 C900 520,880 460,780 400Z" fill="var(--flora-red)" opacity="0.8" style={{ filter: 'blur(0.5px)' }} />
          <path d="M860 580 C800 540,740 570,760 660 C780 750,880 760,900 690 C920 620,910 600,860 580Z" fill="var(--flora-amber)" />
          {/* Tallo fino sobre la wave */}
          <line x1="870" y1="60" x2="840" y2="800" stroke="var(--flora-red)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
          <circle cx="875" cy="200" r="10" fill="var(--flora-amber)" opacity="0.9" />
          <circle cx="848" cy="480" r="7" fill="var(--flora-red)" opacity="0.8" />
        </svg>
      </div>

    </div>
  );
}
