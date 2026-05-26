import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, Input, Button, Switch, Avatar 
} from '../../../components/ui';
import { useAdminSettings } from '../hooks/useAdminSettings';
import type { PlatformSettings } from '../types';
import { 
  Globe, Percent, Map, Save, Loader,
  Shield, Bell, Server, Cpu, Database, CreditCard,
  AlertTriangle, CheckCircle2
} from 'lucide-react';

export function AdminSettingsForm() {
  const { settings, isLoading, isSaving, saveSettings } = useAdminSettings();
  const [activeTab, setActiveTab] = useState('general');
  
  const [formData, setFormData] = useState<PlatformSettings>({
    platformName: '',
    commissionRate: '',
    supportEmail: '',
    maxRadius: '',
    maintenanceMode: false,
    allowGuestBooking: true,
    autoApproveProfessionals: false,
    currencyCode: 'COP',
    smtpHost: 'smtp.justme.com',
    smtpPort: '587'
  });

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(formData);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: 'var(--space-4)' }}>
        <Loader className="spin" size={40} style={{ color: 'var(--primary-500)' }} />
        <p style={{ color: 'var(--neutral-500)', fontWeight: 500 }}>Cargando configuraciones...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe size={18} /> },
    { id: 'operations', label: 'Operaciones', icon: <Cpu size={18} /> },
    { id: 'notifications', label: 'Notificaciones', icon: <Bell size={18} /> },
    { id: 'security', label: 'Seguridad', icon: <Shield size={18} /> },
  ];

  return (
    <div className="admin-settings-feature" style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-4)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-8)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-4xl)', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--neutral-900)', letterSpacing: '-0.03em', marginBottom: 'var(--space-1)' }}>
            Configuración del Sistema
          </h2>
          <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)' }}>
            Gestiona los parámetros globales, seguridad y comportamiento de la plataforma.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button 
            variant="ghost" 
            onClick={() => settings && setFormData(prev => ({ ...prev, ...settings }))}
            disabled={isSaving}
          >
            Descartar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            loading={isSaving}
            icon={<Save size={18} />}
            disabled={JSON.stringify(formData) === JSON.stringify({ ...formData, ...settings })}
            style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 2rem', boxShadow: 'var(--shadow-lg)' }}
          >
            Guardar Cambios
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 'var(--space-8)' }}>
        
        {/* Navigation Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-xl)',
                border: 'none',
                background: activeTab === tab.id ? 'var(--primary-50)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary-600)' : 'var(--neutral-500)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <span style={{ color: activeTab === tab.id ? 'var(--primary-500)' : 'inherit' }}>
                {tab.icon}
              </span>
              <span style={{ flex: 1 }}>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="active-pill" style={{ position: 'absolute', left: 0, width: '4px', height: '20px', background: 'var(--primary-500)', borderRadius: '0 4px 4px 0' }} />
              )}
            </button>
          ))}

          <div style={{ marginTop: 'var(--space-8)', padding: '16px', background: 'var(--neutral-50)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--neutral-100)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success-500)' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--neutral-400)', textTransform: 'uppercase' }}>Estado del Sistema</span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-600)', margin: 0, lineHeight: 1.5 }}>
              Todos los servicios operan normalmente. No hay incidencias reportadas.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'general' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <Card variant="glass" padding="lg" style={{ border: '1px solid var(--neutral-200)' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Globe size={20} className="text-primary" /> Identidad de la Plataforma
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                      <Input
                        label="Nombre de la Aplicación"
                        value={formData.platformName}
                        onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                        placeholder="Ej. JustMe Beauty"
                      />
                      <Input
                        label="Email de Soporte"
                        value={formData.supportEmail}
                        onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                        placeholder="soporte@justme.com"
                        type="email"
                      />
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', marginBottom: '8px', display: 'block' }}>Logo de la Plataforma</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--neutral-50)', borderRadius: 'var(--radius-xl)', border: '1.5px dashed var(--neutral-200)' }}>
                          <Avatar size="lg" name={formData.platformName} />
                          <div>
                            <Button size="sm" variant="outline">Cambiar Logo</Button>
                            <p style={{ fontSize: '10px', color: 'var(--neutral-400)', marginTop: '4px' }}>PNG, JPG o SVG. Max 2MB.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card variant="glass" padding="lg" style={{ border: '1px solid var(--neutral-200)' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertTriangle size={20} style={{ color: 'var(--warning-500)' }} /> Zona de Peligro
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--warning-50)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--warning-100)' }}>
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--warning-900)', margin: 0 }}>Modo Mantenimiento</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--warning-700)', margin: 0 }}>Desactiva el acceso a todos los usuarios excepto administradores.</p>
                      </div>
                      <Switch 
                        checked={!!formData.maintenanceMode} 
                        onChange={(val) => setFormData({ ...formData, maintenanceMode: val })} 
                      />
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'operations' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <Card variant="glass" padding="lg" style={{ border: '1px solid var(--neutral-200)' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CreditCard size={20} className="text-primary" /> Tarifas y Comisiones
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                      <Input
                        label="Comisión de la Plataforma (%)"
                        value={formData.commissionRate}
                        onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                        icon={<Percent size={18} />}
                        type="number"
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)' }}>Moneda Base</label>
                        <select 
                          value={formData.currencyCode}
                          onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
                          style={{ padding: '12px', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--neutral-200)', outline: 'none' }}
                        >
                          <option value="COP">Peso Colombiano (COP)</option>
                          <option value="USD">Dólar Americano (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                        </select>
                      </div>
                    </div>
                  </Card>

                  <Card variant="glass" padding="lg" style={{ border: '1px solid var(--neutral-200)' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Map size={20} className="text-primary" /> Geofencing y Búsqueda
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                      <Input
                        label="Radio Máximo de Búsqueda (km)"
                        value={formData.maxRadius}
                        onChange={(e) => setFormData({ ...formData, maxRadius: e.target.value })}
                        icon={<Map size={18} />}
                        type="number"
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--neutral-50)', borderRadius: 'var(--radius-xl)' }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', margin: 0 }}>Autoverificar Profesionales</p>
                          <p style={{ fontSize: '11px', color: 'var(--neutral-500)', margin: 0 }}>Aprobar automáticamente nuevas solicitudes de profesionales.</p>
                        </div>
                        <Switch 
                          checked={!!formData.autoApproveProfessionals} 
                          onChange={(val) => setFormData({ ...formData, autoApproveProfessionals: val })} 
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'notifications' && (
                <Card variant="glass" padding="lg" style={{ border: '1px solid var(--neutral-200)' }}>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Server size={20} className="text-primary" /> Servidor de Correo (SMTP)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                    <Input
                      label="Host SMTP"
                      value={formData.smtpHost}
                      onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                      placeholder="smtp.example.com"
                    />
                    <Input
                      label="Puerto"
                      value={formData.smtpPort}
                      onChange={(e) => setFormData({ ...formData, smtpPort: e.target.value })}
                      placeholder="587"
                    />
                    <div style={{ gridColumn: 'span 2' }}>
                      <Button variant="outline" size="sm" icon={<CheckCircle2 size={16} />}>Enviar Correo de Prueba</Button>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'security' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <Card variant="glass" padding="lg" style={{ border: '1px solid var(--neutral-200)' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Shield size={20} className="text-primary" /> Políticas de Acceso
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--neutral-100)', borderRadius: 'var(--radius-xl)' }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', margin: 0 }}>Permitir Reservas de Invitados</p>
                          <p style={{ fontSize: '11px', color: 'var(--neutral-500)', margin: 0 }}>Usuarios pueden agendar sin crear una cuenta permanente.</p>
                        </div>
                        <Switch 
                          checked={!!formData.allowGuestBooking} 
                          onChange={(val) => setFormData({ ...formData, allowGuestBooking: val })} 
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--neutral-100)', borderRadius: 'var(--radius-xl)' }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', margin: 0 }}>Autenticación de Dos Factores (2FA)</p>
                          <p style={{ fontSize: '11px', color: 'var(--neutral-500)', margin: 0 }}>Requerir 2FA para todas las cuentas administrativas.</p>
                        </div>
                        <Switch checked={true} onChange={() => {}} disabled />
                      </div>
                    </div>
                  </Card>

                  <Card variant="glass" padding="lg" style={{ border: '1px solid var(--neutral-200)', background: 'var(--neutral-900)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                          <Database size={24} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, margin: 0 }}>Base de Datos</p>
                          <p style={{ fontSize: '11px', opacity: 0.6, margin: 0 }}>Último respaldo: hace 2 horas</p>
                        </div>
                      </div>
                      <Button variant="primary" size="sm">Descargar Backup</Button>
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
