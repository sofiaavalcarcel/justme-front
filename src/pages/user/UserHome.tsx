import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Search, ChevronRight, Scissors, Sparkles, Star, Hand, Heart, Droplets, Waves, User, Loader } from 'lucide-react';
import { Card, Button, Avatar, Rating } from '../../components/ui';
import { professionalsService } from '../../services/professionalsService';
import { useGeolocation } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../services/api';
import './UserHome.css';

// Mapeos para iconos y colores basados en categorías conocidas
const iconMapping: Record<string, any> = {
  'Barber': <Scissors size={24} />,
  'Hair Stylist': <Sparkles size={24} />,
  'Makeup': <Star size={24} />,
  'Nails': <Hand size={24} />,
  'Skincare': <Droplets size={24} />,
  'Massage': <Heart size={24} />,
  'Spa': <Waves size={24} />,
  'Grooming': <User size={24} />,
};

const colorMapping: Record<string, string> = {
  'Barber': '#8b45ff',
  'Hair Stylist': '#ff3366',
  'Makeup': '#f59e0b',
  'Nails': '#ec4899',
  'Skincare': '#10b981',
  'Massage': '#6366f1',
  'Spa': '#06b6d4',
  'Grooming': '#8b5cf6',
};

export default function UserHome() {
  const navigate = useNavigate();
  const geo = useGeolocation();
  const { t } = useTranslation();

  const formatCOP = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(num || 0).replace('COP', '$');
  };

  const [dbCategories, setDbCategories] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [topPros, setTopPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPros = async () => {
      setLoading(true);
      setError(null);
      try {
        const lat = geo.latitude || 4.711;
        const lng = geo.longitude || -74.0721;
        const data = await professionalsService.getNearbyProfessionals({
          latitude: lat,
          longitude: lng,
          radius: 10,
        });
        const list = Array.isArray(data) ? data : (data?.data || []);
        setTopPros(list.slice(0, 4));
      } catch (err: any) {
        console.warn('Failed to fetch top professionals', err);
        setError(t('userHome.errorMsg'));
        setTopPros([]);
      } finally {
        setLoading(false);
      }
    };

    if (!geo.loading) {
      fetchPros();
    }
  }, [geo.loading, geo.latitude, geo.longitude]);

  useEffect(() => {
    apiClient.get('/services/categories')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        if (list.length > 0) {
          setDbCategories(list.filter((s: any) => s.isActive !== false).map((s: any) => ({
            id: s.id,
            name: s.name,
            icon: iconMapping[s.category] || iconMapping[s.name] || <Sparkles size={24} />,
            color: colorMapping[s.category] || colorMapping[s.name] || '#6366f1',
            bg: `${colorMapping[s.category] || colorMapping[s.name] || '#6366f1'}12`
          })));
        } else {
          // Fallback if no categories in DB
          setDbCategories(Object.keys(iconMapping).map(key => ({
            id: key,
            name: key,
            icon: iconMapping[key],
            color: colorMapping[key],
            bg: `${colorMapping[key]}12`
          })));
        }
      })
      .catch(() => {
        setDbCategories(Object.keys(iconMapping).map(key => ({
          id: key,
          name: key,
          icon: iconMapping[key],
          color: colorMapping[key],
          bg: `${colorMapping[key]}12`
        })));
      });
  }, []);

  return (
    <div className="user-home">
      {/* Location Banner */}
      <motion.div className="location-banner glass" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <MapPin size={18} className="location-pin" />
        <div className="location-text">
          <span className="location-label">{t('userHome.locationLabel')}</span>
          <span className="location-address">{geo.error ? 'Duitama, Boyacá' : t('userHome.locationDefault')}</span>
        </div>
        <button className="location-change">{t('userHome.change')}</button>
      </motion.div>

      {/* Hero Card */}
      <motion.div className="home-hero-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="home-hero-content">
          <h1>{t('userHome.heroTitle1')}<br />{t('userHome.heroTitle2')}</h1>
          <p>{t('userHome.heroDesc')}</p>
          <Button onClick={() => navigate('/user/search')} icon={<Search size={18} />}>
            {t('userHome.searchBtn')}
          </Button>
        </div>
        <div className="home-hero-decoration">
          <div className="hero-circle c1" />
          <div className="hero-circle c2" />
          <div className="hero-circle c3" />
        </div>
      </motion.div>

      {/* Service Categories */}
      <section className="home-section">
        <div className="home-section-header">
          <h2>{t('userHome.servicesTitle')}</h2>
          <button className="see-all" onClick={() => navigate('/user/search')}>{t('userHome.seeAll')} <ChevronRight size={16} /></button>
        </div>
        <div className="categories-grid">
          {dbCategories.map((cat, i) => (
            <motion.div
              key={cat.id}
              className={`category-chip ${selectedCategory === cat.id ? 'category-active' : ''}`}
              style={{ '--cat-color': cat.color, '--cat-bg': cat.bg } as React.CSSProperties}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedCategory(cat.id === selectedCategory ? null : cat.id);
                navigate('/user/search');
              }}
            >
              <div className="category-icon" style={{ color: cat.color, background: cat.bg }}>{cat.icon}</div>
              <span>{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Professionals */}
      <section className="home-section">
        <div className="home-section-header">
          <h2>{t('userHome.topProsTitle')}</h2>
          <button className="see-all" onClick={() => navigate('/user/search')}>{t('userHome.seeAll')} <ChevronRight size={16} /></button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-400)' }}>
            <p>{error}</p>
            <Button size="sm" variant="ghost" onClick={() => window.location.reload()}>{t('userHome.retry')}</Button>
          </div>
        ) : topPros.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-400)' }}>
            <User size={40} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <p>{t('userHome.noProsTitle')}</p>
            <Button size="sm" variant="ghost" onClick={() => navigate('/user/search')}>{t('userHome.searchWider')}</Button>
          </div>
        ) : (
          <div className="pros-scroll">
            {topPros.map((pro: any, i: number) => (
              <motion.div
                key={pro.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Card variant="glass" hover className="pro-card-home" onClick={() => navigate(`/user/professional/${pro.id}`)}>
                  <Avatar src={pro.avatar || pro.photoUrl || pro.user?.avatar} name={pro.name || pro.user?.name || 'Professional'} size="lg" />
                  <h3>{pro.name || pro.user?.name || 'Professional'}</h3>
                  <Rating value={pro.rating || 0} size="sm" showValue count={pro.reviewCount || 0} />
                  <div className="pro-card-tags">
                    {(pro.services || []).slice(0, 2).map((s: any) => (
                      <span key={typeof s === 'string' ? s : s.name} className="pro-tag">
                        {typeof s === 'string' ? s : s.name}
                      </span>
                    ))}
                  </div>
                  <div className="pro-card-meta">
                    <span className="pro-distance"><MapPin size={13} /> {(pro.distance || 0).toFixed(1)} {t('userHome.distanceUnit')}</span>
                    <span className="pro-price">{t('userHome.fromPrice')} {formatCOP(pro.price || pro.services?.[0]?.price || 0)}</span>
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
