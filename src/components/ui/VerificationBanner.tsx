import { motion } from 'framer-motion';
import { Clock, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './VerificationBanner.css';

interface Props {
    status: 'none' | 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
}

export function VerificationBanner({ status, rejectionReason }: Props) {
    const { t } = useTranslation();
    if (status === 'none' || status === 'approved') return null;

    const config = {
        pending: {
            icon: <Clock size={20} />,
            title: t('sharedPages.pro.pendingTitle'),
            message: t('sharedPages.pro.pendingMsg'),
            className: 'vb-pending',
        },
        rejected: {
            icon: <XCircle size={20} />,
            title: t('sharedPages.pro.rejectedTitle'),
            message: rejectionReason || t('sharedPages.pro.rejectedMsg'),
            className: 'vb-rejected',
        },
    };

    const c = config[status];

    return (
        <motion.div
            className={`verification-banner ${c.className}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {c.icon}
            <div className="vb-content">
                <strong>{c.title}</strong>
                <p>{c.message}</p>
            </div>
        </motion.div>
    );
}
