import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Clock, MapPin, ChevronLeft, ShieldCheck,
  Briefcase, Image, MessageSquare,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './ProProfileDetail.css';

interface ProProfileDetailProps {
  professional: any;
  onBack: () => void;
}

type Tab = 'services' | 'portfolio' | 'reviews';

export const ProProfileDetail: React.FC<ProProfileDetailProps> = ({ professional, onBack }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('services');

  return (
    <div className="pro-detail-modal-wrapper">
      <motion.div
        className="pro-detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onBack}
      />
      <motion.div
        className="pro-detail-overlay"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Hero Header */}
        <div className="pro-detail-hero">
          <div
            className="pro-hero-bg"
            style={{ backgroundImage: `url(${professional.portfolioImages?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80'})` }}
          />
          <div className="pro-hero-overlay" />

          <button className="pro-detail-back" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>

          <div className="pro-hero-content">
            <motion.div
              layoutId={`avatar-${professional.id}`}
              className="pro-hero-avatar-wrapper"
            >
              <img src={professional.avatar} alt={professional.name} className="pro-hero-avatar" />
              {professional.verified && (
                <div className="pro-verified-badge">
                  <ShieldCheck size={16} />
                </div>
              )}
            </motion.div>

            <div className="pro-hero-info">
              <h1>{professional.name}</h1>
              <div className="pro-hero-stats">
                <span className="stat-item">
                  <Star size={14} className="star-icon" />
                  {professional.averageRating || '5.0'} ({professional.reviewCount || 0})
                </span>
                <span className="stat-item">
                  <Briefcase size={14} />
                  {professional.completedServices || 0} {t('pro.jobs')}
                </span>
                <span className="stat-item">
                  <MapPin size={14} />
                  {professional.distance?.toFixed(1)} km
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="pro-detail-tabs">
          <button
            className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <Briefcase size={18} /> {t('pro.services')}
          </button>
          <button
            className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <Image size={18} /> {t('pro.portfolio')}
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <MessageSquare size={18} /> {t('pro.reviews')}
          </button>
        </div>

        {/* Tab Content */}
        <div className="pro-detail-body">
          <AnimatePresence mode="wait">
            {activeTab === 'services' && (
              <motion.div
                key="services"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="services-list"
              >
                {professional.professionalServices?.map((ps: any) => (
                  <div key={ps.id} className="service-card informational">
                    <div className="service-info">
                      <h4>{ps.service?.name}</h4>
                      <p>{ps.description || t('pro.noDescription')}</p>
                      <div className="service-meta">
                        <span className="service-price">${Number(ps.price).toLocaleString()}</span>
                        <span className="service-duration">
                          <Clock size={12} /> {ps.duration || 30} min
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'portfolio' && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="portfolio-grid"
              >
                {professional.portfolioImages?.length > 0 ? (
                  professional.portfolioImages.map((img: any) => (
                    <div key={img.id} className="portfolio-item">
                      <img src={img.imageUrl} alt={img.caption || 'Work'} />
                      {img.caption && <div className="img-overlay"><span>{img.caption}</span></div>}
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <Image size={48} />
                    <p>{t('pro.noPortfolio')}</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="reviews-list"
              >
                {professional.reviews?.length > 0 ? (
                  professional.reviews.map((rev: any) => (
                    <div key={rev.id} className="review-card">
                      <div className="review-header">
                        <img src={rev.user?.avatar || `https://ui-avatars.com/api/?name=${rev.user?.name}`} className="rev-avatar" />
                        <div className="rev-info">
                          <strong>{rev.user?.name}</strong>
                          <div className="rev-rating">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={12} className={i < rev.rating ? 'star-filled' : 'star-empty'} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="rev-comment">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <MessageSquare size={48} />
                    <p>{t('pro.noReviews')}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
