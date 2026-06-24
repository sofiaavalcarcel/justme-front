import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, XCircle, Clock, User, FileText, ExternalLink,
    ChevronDown, ChevronUp, AlertTriangle, Loader, RefreshCw, Send
} from 'lucide-react';
import { Button, Modal, Avatar, Badge } from '../../components/ui';
import { verificationService } from '../../services/verificationService';
import { useNotification } from '../../context/NotificationContext';
import './ProfessionalApplications.css';

type Status = 'pending' | 'approved' | 'rejected';

interface Application {
    id: number;
    userId: number;
    user: { name: string; email: string; avatar?: string };
    status: Status;
    reason: string;
    certifications: string[];
    adminNotes?: string;
    createdAt: string;
}

export default function ProfessionalApplications() {
    const { notify } = useNotification();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<Status | 'all'>('pending');
    const [expanded, setExpanded] = useState<number | null>(null);

    // Review modal
    const [reviewModal, setReviewModal] = useState<{ app: Application; action: 'approved' | 'rejected' } | null>(null);
    const [adminMessage, setAdminMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchApps = useCallback(async () => {
        setLoading(true);
        try {
            const data = await verificationService.getApplications(statusFilter === 'all' ? undefined : statusFilter);
            setApplications(data);
        } catch {
            notify('error', 'Error', 'No se pudieron cargar las solicitudes.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { fetchApps(); }, [fetchApps]);

    const handleReviewSubmit = async () => {
        if (!reviewModal) return;
        if (!adminMessage.trim()) {
            notify('warning', 'Mensaje requerido', 'Por favor escribe un mensaje para el usuario.');
            return;
        }
        setSubmitting(true);
        try {
            await verificationService.updateApplicationStatus(reviewModal.app.id, reviewModal.action, adminMessage);
            notify('success',
                reviewModal.action === 'approved' ? '✅ Solicitud aprobada' : '❌ Solicitud rechazada',
                `Se notificó a ${reviewModal.app.user.name} por correo y en la app.`
            );
            setReviewModal(null);
            setAdminMessage('');
            fetchApps();
        } catch (err: any) {
            notify('error', 'Error', err?.response?.data?.message || 'No se pudo procesar la solicitud.');
        } finally {
            setSubmitting(false);
        }
    };

    const statusBadge = (status: Status) => {
        if (status === 'approved') return <Badge variant="success" size="sm"><CheckCircle size={12} />Aprobada</Badge>;
        if (status === 'rejected') return <Badge variant="error" size="sm"><XCircle size={12} />Rechazada</Badge>;
        return <Badge variant="warning" size="sm"><Clock size={12} />Pendiente</Badge>;
    };

    return (
        <div className="pro-apps-page">
            {/* Header */}
            <div className="pro-apps-header">
                <div>
                    <h1>Solicitudes de Profesional</h1>
                    <p className="pro-apps-subtitle">Gestiona las solicitudes de usuarios que quieren convertirse en profesionales.</p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    icon={<RefreshCw size={14} />}
                    onClick={fetchApps}
                    loading={loading}
                >
                    Actualizar
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className="pro-apps-tabs">
                {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
                    <button
                        key={tab}
                        className={`pro-apps-tab ${statusFilter === tab ? 'active' : ''}`}
                        onClick={() => setStatusFilter(tab)}
                    >
                        {tab === 'pending' && <Clock size={14} />}
                        {tab === 'approved' && <CheckCircle size={14} />}
                        {tab === 'rejected' && <XCircle size={14} />}
                        {tab === 'all' && <User size={14} />}
                        {tab === 'pending' ? 'Pendientes' : tab === 'approved' ? 'Aprobadas' : tab === 'rejected' ? 'Rechazadas' : 'Todas'}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="pro-apps-loading">
                    <Loader size={32} className="spin" />
                    <p>Cargando solicitudes...</p>
                </div>
            ) : applications.length === 0 ? (
                <div className="pro-apps-empty">
                    <User size={48} opacity={0.2} />
                    <p>No hay solicitudes {statusFilter !== 'all' ? `${statusFilter === 'pending' ? 'pendientes' : statusFilter === 'approved' ? 'aprobadas' : 'rechazadas'}` : ''}.</p>
                </div>
            ) : (
                <div className="pro-apps-list">
                    {applications.map((app, i) => (
                        <motion.div
                            key={app.id}
                            className="pro-app-card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                        >
                            {/* Card Header */}
                            <div className="pro-app-card-header" onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                                <Avatar
                                    src={app.user.avatar}
                                    name={app.user.name}
                                    size="md"
                                />
                                <div className="pro-app-info">
                                    <div className="pro-app-name-row">
                                        <span className="pro-app-name">{app.user.name}</span>
                                        {statusBadge(app.status)}
                                    </div>
                                    <span className="pro-app-email">{app.user.email}</span>
                                    <span className="pro-app-date">
                                        Solicitado el {new Date(app.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <button className="pro-app-expand-btn">
                                    {expanded === app.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {expanded === app.id && (
                                    <motion.div
                                        className="pro-app-details"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <div className="pro-app-details-inner">
                                            {/* Reason */}
                                            <div className="pro-app-section">
                                                <h4><FileText size={14} /> Razón para ser profesional</h4>
                                                <p className="pro-app-reason">{app.reason}</p>
                                            </div>

                                            {/* Certifications */}
                                            {app.certifications && app.certifications.length > 0 && (
                                                <div className="pro-app-section">
                                                    <h4><FileText size={14} /> Certificaciones adjuntas</h4>
                                                    <div className="pro-app-certs">
                                                        {app.certifications.map((url, idx) => {
                                                            const isImage = /\.(jpg|jpeg|png|webp)$/i.test(url);
                                                            return isImage ? (
                                                                <a
                                                                    key={idx}
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="pro-app-cert-thumb"
                                                                >
                                                                    <img src={url} alt={`Certificación ${idx + 1}`} />
                                                                    <span><ExternalLink size={12} /> Ver</span>
                                                                </a>
                                                            ) : (
                                                                <a
                                                                    key={idx}
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="pro-app-cert-file"
                                                                >
                                                                    <FileText size={20} />
                                                                    <span>Documento {idx + 1}</span>
                                                                    <ExternalLink size={12} />
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Admin Notes (if already reviewed) */}
                                            {app.adminNotes && (
                                                <div className="pro-app-section">
                                                    <h4>Mensaje enviado al usuario</h4>
                                                    <p className="pro-app-admin-notes">{app.adminNotes}</p>
                                                </div>
                                            )}

                                            {/* Action buttons — only for pending */}
                                            {app.status === 'pending' && (
                                                <div className="pro-app-actions">
                                                    <Button
                                                        variant="ghost"
                                                        icon={<XCircle size={16} />}
                                                        onClick={() => {
                                                            setReviewModal({ app, action: 'rejected' });
                                                            setAdminMessage('');
                                                        }}
                                                    >
                                                        Rechazar
                                                    </Button>
                                                    <Button
                                                        variant="primary"
                                                        icon={<CheckCircle size={16} />}
                                                        onClick={() => {
                                                            setReviewModal({ app, action: 'approved' });
                                                            setAdminMessage(`¡Bienvenido ${app.user.name}! Tu solicitud para unirte a JustMe como profesional ha sido aprobada. Ya puedes configurar tus servicios y comenzar a recibir clientes.`);
                                                        }}
                                                    >
                                                        Aprobar
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            <Modal
                isOpen={!!reviewModal}
                onClose={() => { setReviewModal(null); setAdminMessage(''); }}
                title={reviewModal?.action === 'approved' ? '✅ Aprobar solicitud' : '❌ Rechazar solicitud'}
            >
                {reviewModal && (
                    <div className="review-modal-content">
                        {reviewModal.action === 'rejected' && (
                            <div className="review-warning">
                                <AlertTriangle size={18} />
                                <p>Al rechazar esta solicitud, el usuario recibirá tu mensaje por correo y notificación en la app.</p>
                            </div>
                        )}

                        <div className="review-user-chip">
                            <Avatar src={reviewModal.app.user.avatar} name={reviewModal.app.user.name} size="sm" />
                            <div>
                                <strong>{reviewModal.app.user.name}</strong>
                                <span>{reviewModal.app.user.email}</span>
                            </div>
                        </div>

                        <div className="review-message-group">
                            <label>
                                {reviewModal.action === 'approved' ? '🎉 Mensaje de bienvenida' : '📝 Motivo del rechazo'} *
                            </label>
                            <textarea
                                className="review-textarea"
                                value={adminMessage}
                                onChange={e => setAdminMessage(e.target.value)}
                                placeholder={reviewModal.action === 'approved'
                                    ? 'Ej: ¡Bienvenido al equipo! Ya puedes configurar tus servicios...'
                                    : 'Ej: Tu solicitud fue rechazada porque las certificaciones adjuntas no son suficientes...'}
                                rows={5}
                            />
                        </div>

                        <div className="review-actions">
                            <Button variant="ghost" onClick={() => { setReviewModal(null); setAdminMessage(''); }}>
                                Cancelar
                            </Button>
                            <Button
                                variant={reviewModal.action === 'approved' ? 'primary' : 'danger'}
                                icon={<Send size={16} />}
                                onClick={handleReviewSubmit}
                                loading={submitting}
                                disabled={!adminMessage.trim()}
                            >
                                {reviewModal.action === 'approved' ? 'Confirmar y Aprobar' : 'Confirmar y Rechazar'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
