import { useState, useEffect } from 'react';
import { Card, Avatar, Button, Input } from '../../../components/ui';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { userService } from '../../../services/userService';
import { User, Phone, Mail, Camera, Edit2, ShieldCheck } from 'lucide-react';
import { TwoFactorSection } from './TwoFactorSection';

export function AdminProfileView() {
  const { user, setUser } = useAuth();
  const { notify } = useNotification();
  
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      if (!user?.id) return;
      setSaving(true);
      const updatedUser = await userService.updateProfile(user.id.toString(), formData);
      setUser({ ...user, ...updatedUser, role: user.role });
      setEditing(false);
      notify('success', 'Perfil actualizado', 'Los cambios se han guardado correctamente.');
    } catch (err: any) {
      notify('error', 'Error al guardar', err.response?.data?.message || 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const refreshProfile = async () => {
    try {
      if (!user?.id) return;
      const profile = await userService.getProfile(user.id.toString());
      setUser({ ...user, ...profile });
    } catch (err) {
      console.error('Error refreshing profile', err);
    }
  };

  return (
    <div className="admin-profile-feature" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="feature-header" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--neutral-900)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Mi Perfil Administrativo
        </h2>
        <p style={{ color: 'var(--neutral-500)' }}>Gestiona tu información personal y la seguridad de tu cuenta.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <Card padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--neutral-100)', paddingBottom: '2rem' }}>
            <div style={{ position: 'relative' }}>
              <Avatar src={user?.avatar} name={user?.name || 'Admin'} size="xl" />
              <button style={{
                position: 'absolute', bottom: 4, right: 4,
                background: 'var(--primary-500)', color: 'white',
                border: '4px solid white', borderRadius: '50%', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: 'var(--shadow-md)'
              }}>
                <Camera size={16} />
              </button>
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{user?.name} {user?.lastName}</h3>
              <p style={{ color: 'var(--neutral-500)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} /> {user?.email}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--primary-50)', color: 'var(--primary-600)', padding: '4px 12px', borderRadius: '20px' }}>
                  Administrador
                </span>
                {user?.isTwoFactorEnabled && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--success-50)', color: 'var(--success-600)', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={12} /> 2FA Activado
                  </span>
                )}
              </div>
            </div>

            {!editing && (
              <Button variant="secondary" icon={<Edit2 size={16} />} onClick={() => setEditing(true)}>
                Editar
              </Button>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Input
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!editing}
              icon={<User size={18} />}
            />
            <Input
              label="Apellidos"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={!editing}
              icon={<User size={18} />}
            />
            <div style={{ gridColumn: 'span 2' }}>
              <Input
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editing}
                icon={<Phone size={18} />}
              />
            </div>

            {editing && (
              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={saving}>
                  Guardar Cambios
                </Button>
              </div>
            )}
          </form>
        </Card>

        {/* 2FA Section */}
        <TwoFactorSection 
          isTwoFactorEnabled={!!user?.isTwoFactorEnabled} 
          onUpdate={refreshProfile} 
        />
      </div>
    </div>
  );
}
