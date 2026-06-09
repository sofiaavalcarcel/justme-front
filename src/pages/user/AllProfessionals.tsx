import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, User, Loader } from 'lucide-react';
import { Card, Avatar, Rating, Button } from '../../components/ui';
import { professionalsService } from '../../services/professionalsService';
import { useTranslation } from 'react-i18next';
import './AllProfessionals.css';

const PAGE_SIZE = 20;

/** Skeleton placeholder shown while data loads */
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-avatar" />
      <div className="skeleton skeleton-name" />
      <div className="skeleton skeleton-rating" />
      <div className="skeleton-tags">
        <div className="skeleton skeleton-tag" />
        <div className="skeleton skeleton-tag" />
      </div>
      <div className="skeleton skeleton-meta" />
    </div>
  );
}

export default function AllProfessionals() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Use refs to avoid stale closures in the IntersectionObserver callback
  const offsetRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const formatCOP = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(num || 0).replace('COP', '$');
  };

  /** Extract the service/tag name from different data shapes */
  const getServiceName = (s: any): string => {
    if (typeof s === 'string') return s;
    return s?.service?.name || s?.name || '';
  };

  /** Safely get the lowest price from a professional's services */
  const getPrice = (pro: any): number => {
    if (pro.price) return Number(pro.price);
    const services = pro.professionalServices || pro.services || [];
    for (const s of services) {
      const p = s?.price || s?.service?.price;
      if (p) return Number(p);
    }
    return 0;
  };

  // Initial fetch
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const result = await professionalsService.getTopProfessionals(PAGE_SIZE, 0);
        const list = Array.isArray(result) ? result : (result?.data || []);
        const totalCount = result?.total ?? list.length;

        setProfessionals(list);
        setTotal(totalCount);
        offsetRef.current = list.length;

        const more = list.length < totalCount;
        setHasMore(more);
        hasMoreRef.current = more;
      } catch (err) {
        console.warn('Failed to fetch professionals', err);
        setProfessionals([]);
        setHasMore(false);
        hasMoreRef.current = false;
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // Load more (called by IntersectionObserver)
  const loadMore = async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const result = await professionalsService.getTopProfessionals(PAGE_SIZE, offsetRef.current);
      const list = Array.isArray(result) ? result : (result?.data || []);
      const totalCount = result?.total ?? total;

      setProfessionals(prev => [...prev, ...list]);
      offsetRef.current += list.length;
      setTotal(totalCount);

      const more = list.length === PAGE_SIZE && offsetRef.current < totalCount;
      setHasMore(more);
      hasMoreRef.current = more;
    } catch (err) {
      console.warn('Failed to load more professionals', err);
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  // IntersectionObserver — set up once after initial load
  useEffect(() => {
    if (loading || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingMoreRef.current) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading]); // only re-run when initial loading finishes

  return (
    <div className="all-pros-page">
      {/* Header */}
      <motion.div
        className="all-pros-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className="all-pros-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className="all-pros-title-group">
          <h1>{t('allProfessionals.title')}</h1>
          <p>{t('allProfessionals.subtitle')}</p>
        </div>
      </motion.div>

      {/* Initial Loading — Skeleton Grid */}
      {loading ? (
        <div className="skeleton-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : professionals.length === 0 ? (
        /* Empty State */
        <motion.div
          className="all-pros-empty"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="all-pros-empty-icon">
            <User size={28} />
          </div>
          <h3>{t('allProfessionals.emptyTitle')}</h3>
          <p>{t('allProfessionals.emptyDesc')}</p>
          <Button size="sm" variant="ghost" onClick={() => navigate('/user')}>
            {t('allProfessionals.backBtn')}
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Professionals Grid */}
          <div className="all-pros-grid">
            {professionals.map((pro: any, i: number) => (
              <motion.div
                key={pro.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
              >
                <Card
                  variant="glass"
                  hover
                  className="pro-card-home"
                  onClick={() => navigate(`/user/professional/${pro.id}`)}
                >
                  <Avatar
                    src={pro.avatar || pro.photoUrl || pro.user?.avatar}
                    name={pro.name || pro.user?.name || 'Professional'}
                    size="lg"
                  />
                  <h3>{pro.name || pro.user?.name || 'Professional'}</h3>
                  <Rating
                    value={Number(pro.averageRating || pro.rating || 0)}
                    size="sm"
                    showValue
                    count={pro.reviewCount || 0}
                  />
                  <div className="pro-card-tags">
                    {(pro.professionalServices || pro.services || []).slice(0, 2).map((s: any, idx: number) => {
                      const name = getServiceName(s);
                      return name ? (
                        <span key={`${pro.id}-svc-${idx}`} className="pro-tag">
                          {name}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <div className="pro-card-meta">
                    {pro.distance != null && (
                      <span className="pro-distance">
                        <MapPin size={13} /> {Number(pro.distance || 0).toFixed(1)} {t('userHome.distanceUnit')}
                      </span>
                    )}
                    <span className="pro-price">
                      {t('userHome.fromPrice')} {formatCOP(getPrice(pro))}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Count indicator */}
          <p className="all-pros-count">
            {professionals.length} / {total}
          </p>

          {/* Infinite scroll sentinel + loading indicator */}
          {hasMore && (
            <div className="all-pros-load-more" ref={sentinelRef}>
              {loadingMore && (
                <Loader
                  size={24}
                  style={{
                    animation: 'spin 0.8s linear infinite',
                    color: 'var(--primary-500)',
                  }}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
