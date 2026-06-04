import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Clock, MapPin, ShieldCheck,
  Briefcase, Image, MessageSquare, X, CheckCircle,
  Quote
} from 'lucide-react';
import { API_URL } from '../../config/api';
import './ProProfileDetail.css';

interface ProProfileDetailProps {
  professional: any;
  onBack: () => void;
}

type Tab = 'services' | 'portfolio' | 'reviews';

export const ProProfileDetail: React.FC<ProProfileDetailProps> = ({ professional, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('services');

  // Formatting Image URL safely
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    try {
      const apiUrlObj = new URL(API_URL);
      return `${apiUrlObj.protocol}//${apiUrlObj.host}${url.startsWith('/') ? url : '/' + url}`;
    } catch {
      const fallback = API_URL.replace(/\/api\/?$/, '');
      return `${fallback}${url.startsWith('/') ? url : '/' + url}`;
    }
  };

  const activeServices = professional.professionalServices?.filter((ps: any) => ps.isActive !== false) || [];
  const topReviews = professional.reviews?.slice(0, 5) || [];

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
        {/* Close Button at top right */}
        <button className="pro-detail-close" onClick={onBack}>
          <X size={20} />
        </button>

        {/* Hero Header */}
        <div className="pro-detail-hero">

          <div className="pro-hero-content">
            <motion.div
              layoutId={`avatar-${professional.id}`}
              className="pro-hero-avatar-wrapper"
            >
              <img src={getImageUrl(professional.avatar) || `https://ui-avatars.com/api/?name=${professional.user?.name || 'P'}`} alt={professional.name} className="pro-hero-avatar" />
              {professional.verified && (
                <div className="pro-verified-badge">
                  <ShieldCheck size={16} />
                </div>
              )}
            </motion.div>

            <div className="pro-hero-info">
              <div className="pro-hero-title-row">
                <h1>{professional.name}</h1>
                <div className="pro-hero-stats">
                  <span className="stat-item">
                    <Star size={14} fill="currentColor" className="star-icon" />
                    {professional.averageRating || '5.0'} ({professional.reviewCount || 0})
                  </span>
                  <span className="stat-item">
                    <Briefcase size={14} />
                    {professional.completedServices || 0} Trabajos
                  </span>
                  {professional.distance !== undefined && (
                    <span className="stat-item">
                      <MapPin size={14} />
                      {Number(professional.distance).toFixed(1)} km
                    </span>
                  )}
                </div>
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
            <Briefcase size={18} /> Servicios
          </button>
          <button
            className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <Image size={18} /> Portafolio
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <MessageSquare size={18} /> Reseñas
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
                className="services-list-modern"
              >
                {activeServices.map((ps: any, idx: number) => (
                  <motion.div 
                    key={ps.id} 
                    className="service-card-modern"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="service-decor"></div>
                    <div className="service-info-modern">
                      <div className="service-header-modern">
                        <h4>{ps.name || ps.service?.name}</h4>
                        <span className="service-price-modern">${Number(ps.price).toLocaleString()}</span>
                      </div>
                      <p>{ps.description || 'Sin descripción detallada.'}</p>
                      <div className="service-meta-modern">
                        <span className="service-duration-chip">
                          <Clock size={12} /> {ps.duration || 30} min
                        </span>
                        <span className="service-include-chip">
                          <CheckCircle size={12} /> Incluye atención personal
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {activeServices.length === 0 && (
                  <div className="empty-state">
                    <Briefcase size={48} />
                    <p>No hay servicios listados</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'portfolio' && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="portfolio-masonry"
              >
                {professional.portfolioImages?.length > 0 ? (
                  professional.portfolioImages.map((img: any, idx: number) => (
                    <motion.div 
                      key={img.id} 
                      className="portfolio-item-modern"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <img src={getImageUrl(img.imageUrl)} alt={img.caption || 'Trabajo del profesional'} />
                      <div className="img-overlay-modern">
                        <div className="overlay-content">
                          <Image size={24} className="overlay-icon" />
                          <span>{img.caption || 'Excelente trabajo'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="empty-state">
                    <Image size={48} />
                    <p>No hay fotos en el portafolio</p>
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
                className="reviews-list-modern"
              >
                {topReviews.length > 0 ? (
                  topReviews.map((rev: any, idx: number) => (
                    <motion.div 
                      key={rev.id} 
                      className="review-card-modern"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div className="review-header-modern">
                        <img src={getImageUrl(rev.user?.avatar) || `https://ui-avatars.com/api/?name=${rev.user?.name}`} alt="avatar" className="rev-avatar-modern" />
                        <div className="rev-info-modern">
                          <strong>{rev.user?.name}</strong>
                          <div className="rev-rating-modern">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={14} className={i < rev.rating ? 'star-filled' : 'star-empty'} />
                            ))}
                          </div>
                        </div>
                        <Quote size={24} className="quote-icon" />
                      </div>
                      <p className="rev-comment-modern">"{rev.comment}"</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="empty-state">
                    <MessageSquare size={48} />
                    <p>Aún no hay reseñas</p>
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

