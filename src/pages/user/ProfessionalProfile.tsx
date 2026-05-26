import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Star, CheckCircle, ChevronRight, Calendar, DollarSign, Loader } from 'lucide-react';
import { Button, Avatar, Rating, Card, Badge } from '../../components/ui';
import { professionalsService } from '../../services/professionalsService';

import { useTranslation } from 'react-i18next';
import './ProfessionalProfile.css';

export default function ProfessionalProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pro, setPro] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  
  const formatCOP = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(num || 0).replace('COP', '$');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [proData, svcData, revData] = await Promise.all([
          professionalsService.getProfessionalById(id),
          professionalsService.getServices(id),
          professionalsService.getReviews(id),
        ]);
        setPro(proData);
        setServices(Array.isArray(svcData) ? svcData : (svcData?.data || []));
        setReviews(Array.isArray(revData) ? revData : []);
      } catch (err: any) {
        console.error('Failed to load professional profile', err);
        setError(t('proProfile.errorLoad'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="pro-profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
      </div>
    );
  }

  if (error || !pro) {
    return (
      <div className="pro-profile-page" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <p style={{ color: 'var(--neutral-400)' }}>{error || t('proProfile.errorLoad')}</p>
        <Button variant="ghost" onClick={() => navigate(-1)}>{t('proProfile.goBack')}</Button>
      </div>
    );
  }

  const proName = pro.name || pro.user?.name || 'Professional';
  const proAvatar = pro.avatar || pro.photoUrl || pro.user?.avatar;
  const proRating = pro.rating || 0;
  const proReviewCount = pro.reviewCount || reviews.length;
  const proBio = pro.bio || pro.description || '';
  const proLocation = pro.location || {};
  const proVerified = pro.verified !== undefined ? pro.verified : true;
  const proDistance = pro.distance || 0;
  const proResponseTime = pro.responseTime || '~10 min';
  const proCompletedServices = pro.completedServices || pro.totalServices || 0;
  const basePrice = services.length > 0 ? Math.min(...services.map((s: any) => s.price || 0)) : (pro.price || 0);

  return (
    <div className="pro-profile-page">
      {/* Hero */}
      <motion.div className="pro-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="pro-hero-bg" />
        <div className="pro-hero-content">
          <Avatar src={proAvatar} name={proName} size="xl" />
          <div className="pro-hero-info">
            <div className="pro-hero-name">
              <h1>{proName}</h1>
              {proVerified && <Badge variant="success" size="md"><CheckCircle size={12} /> {t('proProfile.verified')}</Badge>}
            </div>
            <Rating value={proRating} size="md" showValue count={proReviewCount} />
            <div className="pro-hero-meta">
              <span><MapPin size={14} /> {proDistance.toFixed(1)} {t('proProfile.away')}</span>
              <span><Clock size={14} /> {proResponseTime} {t('proProfile.response')}</span>
              <span><Star size={14} /> {proCompletedServices} {t('proProfile.servicesCount')}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="pro-profile-body">
        {/* Bio */}
        {proBio && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2>{t('proProfile.about')}</h2>
            <p className="pro-bio">{proBio}</p>
          </motion.section>
        )}

        {/* Services */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2>{t('proProfile.servicesPrices')}</h2>
          {services.length === 0 ? (
            <p style={{ color: 'var(--neutral-400)', fontSize: 'var(--text-sm)' }}>{t('proProfile.noServices')}</p>
          ) : (
            <div className="services-list">
              {services.map((svc: any, i: number) => {
                const svcName = svc.name || svc.service?.name || t('proDash.service', 'Servicio');
                return (
                  <Card key={svc.id || i} variant="default" padding="sm" hover className="service-row"
                    onClick={() => navigate(`/user/booking/${pro.id}?serviceId=${svc.id}`)}>
                    <div className="service-info">
                      <h4>{svcName}</h4>
                      <span className="service-dur"><Clock size={13} /> {svc.duration || 30} min</span>
                    </div>
                    <div className="service-price-action">
                      <span className="service-price">{formatCOP(svc.price || 0)}</span>
                      <ChevronRight size={16} />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Availability */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2>{t('proProfile.availability')}</h2>
          <Card variant="glass" padding="md">
            <div className="availability-info">
              <Calendar size={20} />
              <div>
                <p className="avail-status">{pro.availability || t('proProfile.checkAvail')}</p>
                {proLocation.address && (
                  <p className="avail-location"><MapPin size={13} /> {proLocation.address}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Reviews */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h2>{t('proProfile.reviews')} ({proReviewCount})</h2>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--neutral-400)', fontSize: 'var(--text-sm)' }}>{t('proProfile.noReviews')}</p>
          ) : (
            <div className="reviews-list">
              {reviews.slice(0, 5).map((review: any) => (
                <Card key={review.id} variant="default" padding="md" className="review-card">
                  <div className="review-header">
                    <Avatar src={review.userAvatar || review.user?.avatar} name={review.userName || review.user?.name || 'User'} size="sm" />
                    <div>
                      <p className="review-name">{review.userName || review.user?.name || 'User'}</p>
                      <p className="review-date">{review.date || new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Rating value={review.rating || 0} size="sm" />
                  </div>
                  <p className="review-text">{review.comment || review.text}</p>
                </Card>
              ))}
            </div>
          )}
        </motion.section>
      </div>

      {/* Sticky Book CTA */}
      <div className="pro-book-cta glass">
        <div className="cta-price-info">
          <span className="cta-from">{t('proProfile.from')}</span>
          <span className="cta-price">{formatCOP(basePrice)}</span>
        </div>
        <Button size="lg" onClick={() => navigate(`/user/booking/${pro.id}`)} iconRight={<DollarSign size={18} />}>
          {t('proProfile.bookNow')}
        </Button>
      </div>
    </div>
  );
}
