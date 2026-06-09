import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, FileText, Send, Check, Loader2, AlertCircle, Info } from 'lucide-react';
import { professionalsService } from '../../services/professionalsService';
import './CategoryRequestModal.css';

interface CategoryRequestModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_SUGGESTIONS = [
  'Bienestar', 'Estética', 'Barbería', 'Peluquería',
  'Masajes', 'Manicura & Pedicura', 'Maquillaje',
  'Fitness', 'Nutrición', 'Tatuajes & Piercings', 'Otra',
];

export function CategoryRequestModal({ open, onClose }: CategoryRequestModalProps) {
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setCategory('');
    setCustomCategory('');
    setDescription('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const finalCategory = category === 'Otra' ? customCategory.trim() : category;
    if (!finalCategory) return setError('Selecciona o escribe la categoría del servicio.');
    setError('');
    setSaving(true);
    try {
      await professionalsService.createCategoryRequest({
        name: finalCategory,        // usamos la categoría como nombre
        category: finalCategory,
        description: description.trim() || undefined,
      });
      setSuccess(true);
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al enviar la solicitud.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="crm-overlay-container">
          <motion.div
            className="crm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            className="crm-modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Header */}
            <div className="crm-header">
              <div className="crm-header-text">
                <h2>Solicitar nueva categoría</h2>
                <p>El equipo de JustMe revisará tu solicitud en 24–48 horas</p>
              </div>
              <button className="crm-close" onClick={handleClose} type="button">
                <X size={20} />
              </button>
            </div>

            <div className="crm-body">
              {/* Info notice */}
              <div className="crm-info-notice">
                <Info size={15} />
                <span>
                  Si tu solicitud es aprobada, la nueva categoría estará disponible para ti
                  y para todos los profesionales de la plataforma.
                </span>
              </div>

              {!success ? (
                <>
                  {/* Categoría */}
                  <div className="crm-section">
                    <label className="crm-label">
                      <Layers size={14} />
                      Categoría que quieres ofrecer <span className="crm-required">*</span>
                    </label>
                    <div className="crm-chip-grid">
                      {CATEGORY_SUGGESTIONS.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          className={`crm-chip ${category === cat ? 'crm-chip-active' : ''}`}
                          onClick={() => setCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    {category === 'Otra' && (
                      <input
                        className="crm-input"
                        style={{ marginTop: 10 }}
                        type="text"
                        placeholder="Escribe el nombre de la categoría..."
                        value={customCategory}
                        onChange={e => setCustomCategory(e.target.value)}
                        maxLength={60}
                        autoFocus
                      />
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="crm-section">
                    <label className="crm-label" htmlFor="crm-desc">
                      <FileText size={14} />
                      Descripción <span className="crm-optional">(opcional)</span>
                    </label>
                    <textarea
                      id="crm-desc"
                      className="crm-textarea"
                      placeholder="Describe brevemente en qué consiste este servicio..."
                      rows={3}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      maxLength={300}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="crm-error">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}
                </>
              ) : (
                /* Estado de éxito */
                <motion.div
                  className="crm-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="crm-success-icon">
                    <Check size={32} />
                  </div>
                  <h3>¡Solicitud enviada!</h3>
                  <p>
                    Recibirás una notificación cuando el equipo de JustMe revise tu solicitud.
                    Generalmente tomamos entre 24 y 48 horas.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="crm-footer">
              <button className="crm-btn-cancel" onClick={handleClose} type="button">
                {success ? 'Cerrar' : 'Cancelar'}
              </button>
              {!success && (
                <motion.button
                  className="crm-btn-send"
                  disabled={saving || !category || (category === 'Otra' && !customCategory.trim())}
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                >
                  {saving ? (
                    <><Loader2 size={16} className="spin" /> Enviando...</>
                  ) : (
                    <><Send size={16} /> Enviar solicitud</>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
