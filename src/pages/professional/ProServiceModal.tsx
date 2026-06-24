import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, DollarSign, Clock, FileText, Check, Loader2, AlertCircle, PlusCircle } from 'lucide-react';
import { apiClient } from '../../services/api';
import './ProServiceModal.css';

interface Category {
  id: number;
  name: string;
  icon?: string;
  category?: string;
  isActive?: boolean;
}

interface ExistingService {
  id: number;
  serviceId: number;
  price: number;
  duration: number;
  description?: string;
  service: { id: number; name: string; icon?: string };
}

interface ProServiceModalProps {
  open: boolean;
  onClose: () => void;
  professionalId: number;
  existingServices: ExistingService[];
  onSaved: () => void;
  onRequestCategory?: () => void; // Callback para abrir el modal de solicitud
}

const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120];

export function ProServiceModal({
  open,
  onClose,
  professionalId,
  existingServices,
  onSaved,
  onRequestCategory,
}: ProServiceModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState(45);
  const [description, setDescription] = useState('');

  // Pre-fill campos si ya tiene ese servicio
  useEffect(() => {
    if (!selectedCategoryId) return;
    const existing = existingServices.find(s => s.serviceId === Number(selectedCategoryId));
    if (existing) {
      setPrice(String(existing.price));
      setDuration(existing.duration);
      setDescription(existing.description || '');
    } else {
      setPrice('');
      setDuration(45);
      setDescription('');
    }
  }, [selectedCategoryId, existingServices]);

  // Cargar y deduplicar categorías al abrir
  useEffect(() => {
    if (!open) return;
    setLoadingCats(true);
    setError('');
    setSuccess(false);
    setSelectedCategoryId('');
    setPrice('');
    setDuration(45);
    setDescription('');
    apiClient
      .get('/services/categories')
      .then(res => {
        const list: Category[] = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const active = list.filter((c) => c.isActive !== false);
        // Deduplicar por nombre (case-insensitive)
        const unique = Array.from(
          new Map(active.map(item => [item.name.toLowerCase().trim(), item])).values()
        );
        setCategories(unique);
      })
      .catch(() => setError('No se pudieron cargar las categorías.'))
      .finally(() => setLoadingCats(false));
  }, [open]);

  const isEditing = selectedCategoryId
    ? existingServices.some(s => s.serviceId === Number(selectedCategoryId))
    : false;

  const handleSave = async () => {
    if (!selectedCategoryId) return setError('Selecciona una categoría.');
    const numPrice = parseFloat(price.replace(/\./g, '').replace(',', '.'));
    if (!price || isNaN(numPrice) || numPrice < 0) return setError('Ingresa un precio válido.');
    setError('');
    setSaving(true);
    try {
      await apiClient.post(`/services/professional/${professionalId}`, {
        serviceId: Number(selectedCategoryId),
        price: numPrice,
        duration,
        description: description || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1000);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error al guardar el servicio.');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (val: string) => {
    const num = val.replace(/\D/g, '');
    return num ? Number(num).toLocaleString('es-CO') : '';
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="psm-overlay-container">
          {/* Backdrop */}
          <motion.div
            className="psm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="psm-modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Header */}
            <div className="psm-header">
              <div className="psm-header-text">
                <h2>{isEditing ? 'Editar Servicio' : 'Agregar Servicio'}</h2>
                <p>Selecciona la categoría y define tu precio y duración</p>
              </div>
              <button className="psm-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="psm-body">
              {/* Campo: Categoría */}
              <div className="psm-section">
                <label className="psm-label" htmlFor="psm-category-select">
                  <Tag size={15} />
                  Categoría de servicio
                </label>
                {loadingCats ? (
                  <div className="psm-loading">
                    <Loader2 size={18} className="spin" />
                    <span>Cargando categorías...</span>
                  </div>
                ) : (
                  <select
                    id="psm-category-select"
                    className="psm-select"
                    value={selectedCategoryId}
                    onChange={e => setSelectedCategoryId(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">— Elige una categoría —</option>
                    {categories.map(cat => {
                      const alreadyHas = existingServices.some(s => s.serviceId === cat.id);
                      return (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}{alreadyHas ? ' ✓ (activo)' : ''}
                        </option>
                      );
                    })}
                  </select>
                )}

                {/* Link para solicitar nueva categoría */}
                {!loadingCats && (
                  <button
                    className="psm-request-link"
                    onClick={() => {
                      onClose();
                      onRequestCategory?.();
                    }}
                    type="button"
                  >
                    <PlusCircle size={14} />
                    ¿No encuentras tu servicio? Solicitar nueva categoría
                  </button>
                )}
              </div>

              {/* Campos: Precio, Duración, Descripción (se muestran al elegir categoría) */}
              <AnimatePresence>
                {selectedCategoryId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {isEditing && (
                      <div className="psm-edit-notice">
                        <AlertCircle size={14} />
                        Ya tienes este servicio activo. Puedes actualizar el precio o duración.
                      </div>
                    )}

                    {/* Precio */}
                    <div className="psm-section">
                      <label className="psm-label">
                        <DollarSign size={15} />
                        Precio (COP)
                      </label>
                      <div className="psm-input-wrap">
                        <span className="psm-input-prefix">$</span>
                        <input
                          className="psm-input"
                          type="text"
                          placeholder="Ej: 180.000"
                          value={price}
                          onChange={e => setPrice(formatPrice(e.target.value))}
                          inputMode="numeric"
                        />
                      </div>
                    </div>

                    {/* Duración */}
                    <div className="psm-section">
                      <label className="psm-label">
                        <Clock size={15} />
                        Duración estimada
                      </label>
                      <div className="psm-duration-grid">
                        {DURATION_OPTIONS.map(min => (
                          <button
                            key={min}
                            className={`psm-dur-btn ${duration === min ? 'psm-dur-active' : ''}`}
                            onClick={() => setDuration(min)}
                            type="button"
                          >
                            {min < 60 ? `${min} min` : `${min / 60}h${min % 60 ? ` ${min % 60}m` : ''}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="psm-section">
                      <label className="psm-label">
                        <FileText size={15} />
                        Descripción <span className="psm-optional">(opcional)</span>
                      </label>
                      <textarea
                        className="psm-textarea"
                        placeholder="Ej: Incluye lavado, corte y secado con productos premium..."
                        rows={3}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              {error && (
                <div className="psm-error">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="psm-footer">
              <button className="psm-btn-cancel" onClick={onClose} type="button">
                Cancelar
              </button>
              <motion.button
                className={`psm-btn-save ${success ? 'psm-btn-success' : ''}`}
                disabled={!selectedCategoryId || !price || saving || success}
                onClick={handleSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
              >
                {success ? (
                  <><Check size={18} /> Guardado</>
                ) : saving ? (
                  <><Loader2 size={18} className="spin" /> Guardando...</>
                ) : (
                  isEditing ? 'Actualizar Servicio' : 'Guardar Servicio'
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
