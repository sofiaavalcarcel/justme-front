import { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../../../components/ui';
import type { ServiceCategory, ServiceCategoryDto } from '../types';
import { Scissors, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ServiceCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ServiceCategory | null;
  onSave: (data: ServiceCategoryDto) => void;
  isLoading: boolean;
}

export function ServiceCategoryModal({ isOpen, onClose, category, onSave, isLoading }: ServiceCategoryModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ServiceCategoryDto>({
    name: '',
    description: '',
    category: '',
    isActive: true
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        category: category.category,
        isActive: category.isActive
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        isActive: true
      });
    }
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={category ? t('sharedPages.admin.editSvcTitle') : t('sharedPages.admin.addCat')}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
        <Input
          label={t('sharedPages.admin.platName')} // Reusing name label or generic name
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          icon={<Scissors size={18} />}
          required
          placeholder="Ej. Peluquería"
        />

        <Input
          label={t('sharedPages.admin.svcCategory')}
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          icon={<Tag size={18} />}
          required
          placeholder="Slug o identificador (ej. hair)"
        />

        <div className="form-group">
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: '0.5rem' }}>
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Breve descripción de la categoría..."
            rows={3}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              border: '1.5px solid var(--neutral-200)', 
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--neutral-50)', borderRadius: 'var(--radius-md)' }}>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Estado Activo</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Determina si los usuarios pueden ver esta categoría</p>
          </div>
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, isActive: e.target.checked })}
            style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary-500)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
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
