import { useState } from 'react';
import { Card, Button, Input } from '../../../components/ui';
import { Modal } from '../../../components/ui/Modal';
import { authService } from '../../../services/authService';
import { useNotification } from '../../../context/NotificationContext';
import { Shield, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TwoFactorSectionProps {
  isTwoFactorEnabled: boolean;
  onUpdate: () => void;
}

export function TwoFactorSection({ isTwoFactorEnabled, onUpdate }: TwoFactorSectionProps) {
  const { notify } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'generate' | 'verify'>('generate');

  const handleStartSetup = async () => {
    setIsLoading(true);
    try {
      const { qrCode } = await authService.generate2FA();
      setQrCode(qrCode);
      setStep('verify');
      setIsModalOpen(true);
    } catch (err) {
      notify('error', 'Error', 'No se pudo generar el código QR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      notify('warning', 'Código incompleto', 'El código debe tener 6 dígitos');
      return;
    }
    setIsLoading(true);
    try {
      await authService.turnOn2FA(verificationCode);
      notify('success', '2FA Activado', 'Tu cuenta está ahora protegida con autenticación de dos factores.');
      setIsModalOpen(false);
      onUpdate();
    } catch (err) {
      notify('error', 'Código inválido', 'El código introducido no es correcto.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('¿Estás seguro de que quieres desactivar la protección 2FA? Esto reducirá la seguridad de tu cuenta.')) return;
    setIsLoading(true);
    try {
      await authService.turnOff2FA();
      notify('success', '2FA Desactivado', 'La protección de dos factores ha sido removida.');
      onUpdate();
    } catch (err) {
      notify('error', 'Error', 'No se pudo desactivar el 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card padding="lg" variant="default">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
        <div style={{ 
          width: 48, 
          height: 48, 
          borderRadius: 'var(--radius-lg)', 
          background: isTwoFactorEnabled ? 'var(--success-50) ' : 'var(--neutral-50)', 
          color: isTwoFactorEnabled ? 'var(--success-600)' : 'var(--neutral-400)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Shield size={24} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Autenticación de Dos Factores (2FA)
            </h3>
            {isTwoFactorEnabled ? (
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                color: 'var(--success-600)', 
                background: 'var(--success-50)', 
                padding: '4px 10px', 
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <CheckCircle size={12} /> Activo
              </span>
            ) : (
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                color: 'var(--neutral-500)', 
                background: 'var(--neutral-100)', 
                padding: '4px 10px', 
                borderRadius: '20px'
              }}>
                Desactivado
              </span>
            )}
          </div>
          
          <p style={{ color: 'var(--neutral-500)', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
            Añade una capa extra de seguridad a tu cuenta administrativa. Al activarlo, deberás introducir un código generado por tu aplicación de autenticación (Google Authenticator, Authy, etc.) cada vez que inicies sesión.
          </p>

          {isTwoFactorEnabled ? (
            <Button variant="danger" onClick={handleDisable} loading={isLoading}>
              Desactivar protección
            </Button>
          ) : (
            <Button variant="primary" onClick={handleStartSetup} loading={isLoading}>
              Configurar 2FA
            </Button>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isLoading && setIsModalOpen(false)}
        title="Configurar Autenticación de Dos Factores"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <AnimatePresence mode="wait">
            {step === 'verify' && qrCode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div style={{ 
                  background: 'white', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-xl)', 
                  display: 'inline-block',
                  border: '1px solid var(--neutral-100)',
                  marginBottom: '1.5rem'
                }}>
                  <img src={qrCode} alt="2FA QR Code" style={{ width: 180, height: 180 }} />
                </div>
                
                <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>1. Escanea el código QR</p>
                  <p style={{ color: 'var(--neutral-500)', fontSize: '0.85rem' }}>
                    Usa una aplicación de autenticación como Google Authenticator o Authy para escanear el código de arriba.
                  </p>
                  
                  <p style={{ fontWeight: 600, marginBottom: '0.5rem', marginTop: '1.5rem' }}>2. Introduce el código de 6 dígitos</p>
                  <Input 
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '4px' }}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <Button variant="secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button variant="primary" style={{ flex: 2 }} onClick={handleVerifyAndEnable} loading={isLoading}>
                    Verificar y Activar
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </Card>
  );
}
