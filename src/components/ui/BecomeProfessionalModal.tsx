import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertTriangle, Shield, CheckCircle, X } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { verificationService } from '../../services/verificationService';
import { useNotification } from '../../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import './BecomeProfessionalModal.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function BecomeProfessionalModal({ isOpen, onClose, onSuccess }: Props) {
    const { t } = useTranslation();
    const { notify } = useNotification();
    const [step, setStep] = useState(0);
    const [accepted, setAccepted] = useState(false);
    const [reason, setReason] = useState('');
    const [documents, setDocuments] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            // Max 3 files
            setDocuments(prev => [...prev, ...newFiles].slice(0, 3));
        }
    };

    const removeFile = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!accepted || !reason.trim()) return;
        setLoading(true);
        try {
            await verificationService.applyForProfessional({
                reason: reason.trim(),
                documents,
            });
            setStep(2); // Success step
            onSuccess();
        } catch (err: any) {
            const msg = err?.response?.data?.message || t('becomePro.errorMsg');
            notify('error', t('sharedPages.pro.error'), msg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(0);
        setAccepted(false);
        setReason('');
        setDocuments([]);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="">
            <div className="bpm-modal">
                <button className="bpm-close-btn" onClick={handleClose}>
                    <X size={24} />
                </button>
                <AnimatePresence mode="wait">
                    {/* Step 0: Confirmation */}
                    {step === 0 && (
                        <motion.div
                            key="confirm"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bpm-step"
                        >
                            <div className="bpm-icon-wrap">
                                <Shield size={40} />
                            </div>
                            <h2>{t('becomePro.title')}</h2>
                            <p className="bpm-desc">
                                {t('becomePro.desc')}
                            </p>

                            <div className="bpm-warning">
                                <AlertTriangle size={18} />
                                <div>
                                    <strong>{t('becomePro.legalTitle')}</strong>
                                    <p>
                                        {t('becomePro.legalMsg')}
                                    </p>
                                </div>
                            </div>

                            <label className="bpm-checkbox">
                                <input
                                    type="checkbox"
                                    checked={accepted}
                                    onChange={(e) => setAccepted(e.target.checked)}
                                />
                                <span>
                                    {t('becomePro.certLabel')}
                                </span>
                            </label>

                            <Button
                                onClick={() => setStep(1)}
                                disabled={!accepted}
                                size="lg"
                                className="bpm-continue-btn"
                            >
                                {t('becomePro.continue')}
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 1: Reason + Documents */}
                    {step === 1 && (
                        <motion.div
                            key="docs"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bpm-step"
                        >
                            <div className="bpm-icon-wrap">
                                <FileText size={40} />
                            </div>
                            <h2>{t('becomePro.docTitle')}</h2>
                            <p className="bpm-desc">
                                {t('becomePro.docDesc')}
                            </p>

                            {/* Why do you want to be a professional */}
                            <div className="bpm-form-group">
                                <label>{t('becomePro.reasonLabel')} *</label>
                                <textarea
                                    placeholder="Ej: Soy Estilista con 5 años de experiencia y quiero trabajar con JustMe para destacar la belleza de mis clientes."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="bpm-textarea"
                                    rows={4}
                                    maxLength={1000}
                                />
                                <span className="bpm-char-count">{reason.length}/1000</span>
                            </div>

                            {/* Certifications upload */}
                            <div className="bpm-form-group">
                                <label>{t('becomePro.uploadTitle')} <span className="bpm-optional">(máx. 3 archivos)</span></label>
                                <div className="bpm-upload-area">
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        multiple
                                        onChange={handleFileChange}
                                        id="bpm-file-input"
                                        className="bpm-file-input"
                                        disabled={documents.length >= 3}
                                    />
                                    <label htmlFor="bpm-file-input" className={`bpm-upload-label ${documents.length >= 3 ? 'disabled' : ''}`}>
                                        <Upload size={24} />
                                        <span>{t('becomePro.uploadClick')}</span>
                                        <span className="bpm-upload-hint">PDF, JPG o PNG · Certificaciones, diplomas, títulos</span>
                                    </label>
                                </div>

                                {documents.length > 0 && (
                                    <div className="bpm-file-list">
                                        {documents.map((f, i) => (
                                            <div key={i} className="bpm-file-item">
                                                <FileText size={14} />
                                                <span>{f.name}</span>
                                                <button
                                                    type="button"
                                                    className="bpm-file-remove"
                                                    onClick={() => removeFile(i)}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bpm-actions">
                                <Button variant="ghost" onClick={() => setStep(0)}>{t('becomePro.back')}</Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!reason.trim() || loading}
                                    loading={loading}
                                    size="lg"
                                >
                                    {loading ? t('becomePro.sending') : t('becomePro.sendBtn')}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Success */}
                    {step === 2 && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bpm-step bpm-success-step"
                        >
                            <motion.div
                                className="bpm-success-icon"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
                            >
                                <CheckCircle size={56} />
                            </motion.div>
                            <h2>¡Solicitud enviada!</h2>
                            <p className="bpm-desc">
                                JustMe está validando tu solicitud para convertirte en Profesional. Este proceso puede tardar <strong>1 a 3 días hábiles</strong>.
                            </p>
                            <div className="bpm-info-box">
                                <p>📧 Recibirás un correo electrónico con la respuesta de nuestro equipo de verificación.</p>
                                <p>🔔 También te notificaremos dentro de la aplicación.</p>
                            </div>
                            <Button onClick={handleClose} size="lg" style={{ marginTop: 16 }}>Entendido</Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
}
