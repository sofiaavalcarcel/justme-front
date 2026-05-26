import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertTriangle, Shield } from 'lucide-react';
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
    const [certNumber, setCertNumber] = useState('');
    const [documents, setDocuments] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments(Array.from(e.target.files));
        }
    };

    const handleSubmit = async () => {
        if (!accepted || !certNumber.trim()) return;
        setLoading(true);
        try {
            await verificationService.applyForProfessional({
                certificationNumber: certNumber.trim(),
                documents,
            });
            notify('success', t('becomePro.successTitle'), t('becomePro.successMsg'));
            onSuccess();
            handleClose();
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
        setCertNumber('');
        setDocuments([]);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="">
            <div className="bpm-modal">
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
                                {t('becomePro.intro')}
                            </p>

                            <div className="bpm-warning">
                                <AlertTriangle size={18} />
                                <div>
                                    <strong>{t('becomePro.warningTitle')}</strong>
                                    <p>
                                        {t('becomePro.warningMsg')}
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
                                    {t('becomePro.checkbox')}
                                </span>
                            </label>

                            <Button
                                onClick={() => setStep(1)}
                                disabled={!accepted}
                                size="lg"
                                className="bpm-continue-btn"
                            >
                                {t('sharedPages.pro.continue')}
                            </Button>
                        </motion.div>
                    )}

                    {/* Step 1: Documents & Certification */}
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
                            <h2>{t('becomePro.docsTitle')}</h2>
                            <p className="bpm-desc">
                                {t('becomePro.docsDesc')}
                            </p>

                            <div className="bpm-form-group">
                                <label>{t('becomePro.certLabel')} *</label>
                                <input
                                    type="text"
                                    placeholder="Ej: CERT-2024-00123"
                                    value={certNumber}
                                    onChange={(e) => setCertNumber(e.target.value)}
                                    className="bpm-input"
                                />
                            </div>

                            <div className="bpm-form-group">
                                <label>{t('becomePro.docsLabel')}</label>
                                <div className="bpm-upload-area">
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        multiple
                                        onChange={handleFileChange}
                                        id="bpm-file-input"
                                        className="bpm-file-input"
                                    />
                                    <label htmlFor="bpm-file-input" className="bpm-upload-label">
                                        <Upload size={24} />
                                        <span>{t('becomePro.clickToUpload')}</span>
                                        <span className="bpm-upload-hint">PDF, JPG o PNG (máx. 10MB)</span>
                                    </label>
                                </div>
                                {documents.length > 0 && (
                                    <div className="bpm-file-list">
                                        {documents.map((f, i) => (
                                            <div key={i} className="bpm-file-item">
                                                <FileText size={14} />
                                                <span>{f.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bpm-actions">
                                <Button variant="ghost" onClick={() => setStep(0)}>{t('sharedPages.pro.back')}</Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!certNumber.trim() || loading}
                                    loading={loading}
                                    size="lg"
                                >
                                    {loading ? t('becomePro.submitting') : t('becomePro.submitBtn')}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
}
