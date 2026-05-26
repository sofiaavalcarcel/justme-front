import { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../../../components/ui';
import type { User, UserUpdateDto } from '../types';
import { Mail, User as UserIcon, Phone } from 'lucide-react';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (id: string, data: UserUpdateDto) => void;
  isLoading: boolean;
}

export function UserEditModal({ isOpen, onClose, user, onSave, isLoading }: UserEditModalProps) {
  const [formData, setFormData] = useState<UserUpdateDto>({
    name: '',
    email: '',
    phone: '',
    isActive: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        isActive: user.isActive
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      onSave(user.id, formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Usuario">
      <form onSubmit={handleSubmit} className="user-edit-form">
        <div className="form-grid" style={{ display: 'grid', gap: '1.5rem', marginTop: '1rem' }}>
          <Input
            label="Nombre Completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            icon={<UserIcon size={18} />}
            required
          />
          <Input
            label="Correo Electrónico"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            icon={<Mail size={18} />}
            required
          />
          <Input
            label="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            icon={<Phone size={18} />}
          />
          
          <div className="form-field">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Estado de la Cuenta
            </label>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                padding: '0.75rem',
                background: 'var(--neutral-50)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
            >
              <div className={`status-toggle ${formData.isActive ? 'active' : ''}`} style={{
                width: '40px',
                height: '22px',
                background: formData.isActive ? 'var(--success-500)' : 'var(--neutral-300)',
                borderRadius: '20px',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  background: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '3px',
                  left: formData.isActive ? '21px' : '3px',
                  transition: 'all 0.3s ease'
                }} />
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--neutral-700)' }}>
                {formData.isActive ? 'Cuenta Activa' : 'Cuenta Suspendida'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Button type="button" variant="ghost" onClick={onClose} style={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={isLoading} style={{ flex: 1 }}>
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}
