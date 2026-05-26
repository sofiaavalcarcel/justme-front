import { useState, useEffect } from 'react';
import { Modal, Input, Button, Switch } from '../../../components/ui';
import type { Professional, ProfessionalUpdateDto } from '../types';
import { Mail, User as UserIcon, Phone, ShieldCheck, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProfessionalEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: Professional | null;
  onSave: (id: string, data: ProfessionalUpdateDto) => void;
  isLoading: boolean;
}

export function ProfessionalEditModal({ isOpen, onClose, professional, onSave, isLoading }: ProfessionalEditModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ProfessionalUpdateDto>({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    verified: false,
    isVisible: true
  });

  useEffect(() => {
    if (professional) {
      setFormData({
        name: professional.user?.name || professional.name || '',
        lastName: professional.user?.lastName || professional.lastName || '',
        email: professional.user?.email || professional.email || '',
        phone: professional.user?.phone || professional.phone || '',
        verified: professional.verified,
        isVisible: professional.isVisible
      });
    }
  }, [professional]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (professional) {
      onSave(professional.id, formData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('sharedPages.admin.editModalTitle')}>
      <form onSubmit={handleSubmit} className="pro-edit-form">
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
          <Input
            label={t('sharedPages.admin.firstName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            icon={<UserIcon size={18} />}
            required
          />
          <Input
            label={t('sharedPages.admin.lastName')}
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            icon={<UserIcon size={18} />}
          />
          <div style={{ gridColumn: 'span 2' }}>
            <Input
              label={t('sharedPages.pro.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              icon={<Mail size={18} />}
              required
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <Input
              label={t('sharedPages.pro.phone')}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              icon={<Phone size={18} />}
            />
          </div>
          
          <div className="toggle-field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={20} style={{ color: formData.verified ? 'var(--primary-500)' : 'var(--neutral-400)' }} />
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t('sharedPages.admin.verified')}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Cuenta verificada por JustMe</p>
              </div>
            </div>
            <Switch
              checked={formData.verified || false}
              onChange={(checked: boolean) => setFormData({ ...formData, verified: checked })}
            />
          </div>

          <div className="toggle-field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Eye size={20} style={{ color: formData.isVisible ? 'var(--success-500)' : 'var(--neutral-400)' }} />
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Visibilidad</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Visible en el marketplace</p>
              </div>
            </div>
            <Switch
              checked={formData.isVisible || false}
              onChange={(checked: boolean) => setFormData({ ...formData, isVisible: checked })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
          <Button type="button" variant="ghost" onClick={onClose} style={{ flex: 1 }}>
            {t('sharedPages.admin.cancelBtn')}
          </Button>
          <Button type="submit" variant="primary" loading={isLoading} style={{ flex: 1 }}>
            {t('sharedPages.admin.saveBtn')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
