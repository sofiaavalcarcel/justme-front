import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, Copy, Check, Loader } from 'lucide-react';
import { Card, Button } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { useNotification } from '../../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import './UserRewards.css';

interface Coupon {
  id: string;
  code: string;
  discount: number;
  description: string;
  expiresAt: string;
}

export default function UserRewards() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        const data = await userService.getCoupons();
        setCoupons(Array.isArray(data) ? data : []);
      } catch {
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    notify('success', t('userRewards.copiedTitle'), t('userRewards.copiedDesc', { code }));
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="rewards-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
      </div>
    );
  }

  return (
    <div className="user-rewards">
      <div className="ur-header">
        <h1>{t('userRewards.title')}</h1>
        <p>{t('userRewards.subtitle')}</p>
      </div>

      {/* Points Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="gradient" padding="lg" className="points-card">
          <div className="ur-top">
            <div>
              <p className="ur-pts-lbl">{t('userRewards.loyaltyPoints')}</p>
              <h2 className="ur-pts-val">{(user as any)?.loyaltyPoints || 0}</h2>
            </div>
            <Star className="ur-pts-icon" size={150} />
          </div>
          <div className="ur-progress-box">
            <div className="ur-prog-text">
              <span>{Math.min((user as any)?.loyaltyPoints || 0, 500)} / 500 Puntos</span>
              <span>{Math.floor(((user as any)?.loyaltyPoints || 0) / 500 * 100)}%</span>
            </div>
            <div className="ur-prog-track">
              <div 
                className="ur-prog-fill" 
                style={{ width: `${Math.min(((user as any)?.loyaltyPoints || 0) / 500 * 100, 100)}%` }} 
              />
            </div>
            <p className="points-hint" style={{ marginTop: '8px', opacity: 0.8, fontSize: 'var(--text-xs)' }}>
              {t('userRewards.pointsHint')}
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Coupons */}
      <section className="ur-coupons-sec">
        <h2><Gift size={20} /> {t('userRewards.availCoupons')}</h2>
        {coupons.length === 0 ? (
          <div className="ur-empty">
            <Gift size={48} />
            <p>{t('userRewards.noCoupons')}</p>
            <p style={{ fontSize: 'var(--text-xs)' }}>{t('userRewards.keepUsing')}</p>
          </div>
        ) : (
          <div className="ur-coupons-grid">
            {coupons.map((coupon, i) => (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card variant="glass" padding="none" className="coupon-card">
                  <div className="coupon-cutout-top" />
                  <div className="coupon-cutout-bottom" />
                  
                  <div className="coupon-left">
                    <div className="coupon-amt">
                      {coupon.discount}% <small style={{ fontSize: '0.5em' }}>OFF</small>
                    </div>
                    <h3 className="coupon-desc">{coupon.description}</h3>
                    <p className="coupon-exp">
                      {t('userRewards.expires')} {new Date(coupon.expiresAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="coupon-right">
                    <code className="coupon-code">{coupon.code}</code>
                    <Button 
                      size="sm" 
                      variant="primary" 
                      onClick={() => handleCopy(coupon.code, coupon.id)}
                      icon={copiedId === coupon.id ? <Check size={14} /> : <Copy size={14} />}
                    >
                      {copiedId === coupon.id ? t('userRewards.copied') : t('userHome.copy')}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
