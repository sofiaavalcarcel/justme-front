import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Verified, CreditCard, ArrowRight, Sparkles, Menu, X } from 'lucide-react';

import { Button, ThemeToggle, LanguageToggle } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { professionalsService } from '../../services/professionalsService';
import './Landing.css';
import videoo from '../../assets/imagenes/videoo.mp4';
import senora1 from '../../assets/imagenes/señora_1.png';
import senora6 from '../../assets/imagenes/señora_6.png';

interface TopProfessional {
  id: number;
  averageRating: number;
  reviewCount: number;
  bio?: string;
  user: { name: string; lastName: string; profileImage?: string };
  professionalServices?: { price: number; isActive: boolean; service?: { name: string; category?: string } }[];
}

const FALLBACK_PROFESSIONALS: TopProfessional[] = [
  {
    id: 1,
    averageRating: 4.9,
    reviewCount: 124,
    user: { name: 'Elena', lastName: 'Martínez', profileImage: undefined },
    professionalServices: [
      { price: 85000, isActive: true, service: { name: 'HydraFacial', category: 'Faciales & Skincare' } },
      { price: 65000, isActive: true, service: { name: 'Peeling', category: 'Faciales & Skincare' } },
    ],
  },
  {
    id: 2,
    averageRating: 5.0,
    reviewCount: 98,
    user: { name: 'Marcus', lastName: 'Vance', profileImage: undefined },
    professionalServices: [
      { price: 120000, isActive: true, service: { name: 'Balayage', category: 'Hair Stylist & Color' } },
      { price: 80000, isActive: true, service: { name: 'Tratamientos', category: 'Hair Stylist & Color' } },
    ],
  },
  {
    id: 3,
    averageRating: 4.8,
    reviewCount: 76,
    user: { name: 'Sofia', lastName: 'Rossi', profileImage: undefined },
    professionalServices: [
      { price: 65000, isActive: true, service: { name: 'Gelish', category: 'Manicura & Masajes' } },
      { price: 55000, isActive: true, service: { name: 'Relajante', category: 'Manicura & Masajes' } },
    ],
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { openLoginModal } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [topProfessionals, setTopProfessionals] = useState<TopProfessional[]>(FALLBACK_PROFESSIONALS);
  const [proLoading, setProLoading] = useState(false);

  useEffect(() => {
    professionalsService.getTopProfessionals(3, 0)
      .then((res: any) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        if (list.length > 0) {
          setTopProfessionals(list.slice(0, 3));
        }
        // if empty, keep fallback data
      })
      .catch(() => { /* keep fallback data */ })
      .finally(() => setProLoading(false));
  }, []);

  return (
    <div className={`landing ${isMenuOpen ? 'menu-open' : ''}`}>
      {/* TopNavBar */}
      <header className="lux-header">
        <div className="lux-header-inner">
          <div className="lux-brand">
            <span className="lux-logo-text">JustMe</span>
          </div>

          {/* Desktop Nav */}
          <nav className="lux-nav-links">
            <a href="#inicio">Inicio</a>
            <a href="#servicios">Servicios</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#profesionales">Profesionales</a>
          </nav>

          <div className="nav-actions">
            <Button variant="ghost" size="sm" onClick={openLoginModal} id="landing-signin-btn">{t('nav.signIn')}</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/register')}>{t('nav.getStarted')}</Button>

            {/* Hamburger Trigger */}
            <button className="lux-menu-trigger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`lux-mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <nav className="lux-mobile-nav">
            <a href="#inicio" onClick={() => setIsMenuOpen(false)}>Inicio</a>
            <a href="#servicios" onClick={() => setIsMenuOpen(false)}>Servicios</a>
            <a href="#como-funciona" onClick={() => setIsMenuOpen(false)}>Cómo funciona</a>
            <a href="#profesionales" onClick={() => setIsMenuOpen(false)}>Profesionales</a>
            <a href="#contacto" onClick={() => setIsMenuOpen(false)}>Contacto</a>
            <hr className="lux-mobile-divider" />
            <div className="lux-mobile-extra">
              <div className="lux-mobile-row">
                <span>Idioma</span>
                <LanguageToggle size="md" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Button variant="ghost" className="w-full" onClick={() => { setIsMenuOpen(false); openLoginModal(); }}>{t('nav.signIn')}</Button>
                <Button variant="primary" className="w-full" onClick={() => navigate('/register')}>{t('nav.getStarted')}</Button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Floating Theme Toggle */}
      <div className="floating-theme-toggle">
        <ThemeToggle size="md" />
      </div>

      <main className="lux-main">
        {/* Hero Section */}
        <section id="inicio" className="lux-hero">
          <div className="lux-hero-bg">
            <video autoPlay loop muted playsInline src={videoo} />
            <div className="lux-hero-overlay"></div>
          </div>
          <div className="lux-hero-content" style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
            <div className="lux-hero-text">
              <h1>La excelencia del salón, <br /><span className="lux-highlight">en la comodidad de tu hogar.</span></h1>
              <p>Reserva servicios de belleza premium con los mejores profesionales certificados. Llevamos el lujo a tu puerta.</p>
              <div className="lux-hero-actions">
                <Button size="lg" onClick={() => navigate('/register')}>Descubrir servicios</Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/register?role=professional')}>Ver especialistas</Button>
              </div>
            </div>
          </div>
          {/* Organic Wave */}
          <div className="lux-hero-wave">
            <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
            </svg>
          </div>
        </section>

        {/* Services */}
        <section id="servicios" className="lux-services">
          <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div className="lux-services-grid">
              {['Faciales', 'Cabello', 'Masajes', 'Depilación', 'Barbería', 'Uñas', 'Maquillaje'].map((s, i) => (
                <div key={i} className="lux-service-item group">
                  <div className="lux-service-icon">
                    <Sparkles className="text-[#DC143C]" size={32} color="#DC143C" />
                  </div>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Explore & Collage Section */}
        <section id="como-funciona" className="lux-explore">
          <div className="container lux-explore-container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div className="lux-explore-image-wrapper">
              <div className="lux-explore-shape">
                <img alt="Beauty Collage" src={senora1} />

              </div>
              <div className="lux-floating-card">
                <div className="lux-star-icon"><Star size={20} fill="currentColor" /></div>
                <div>
                  <p className="lux-rating-text">4.9/5 RATING</p>
                  <p className="lux-rating-sub">Basado en +10k servicios</p>
                </div>
              </div>
            </div>
            <div className="lux-explore-text">
              <h2>Explora una nueva <br />era del cuidado personal</h2>
              <p className="lux-explore-desc">Utilizamos tecnología avanzada para conectar tu ubicación con los mejores artistas de belleza en tiempo real. Sin esperas, sin traslados, solo resultados excepcionales.</p>
              <div className="lux-feature-list">
                <div className="lux-feature-item">
                  <div className="lux-feature-icon red"><Verified size={24} /></div>
                  <div>
                    <h4>Profesionales Certificados</h4>
                    <p>Cada especialista pasa por un riguroso proceso de validación y pruebas de técnica.</p>
                  </div>
                </div>
                <div className="lux-feature-item">
                  <div className="lux-feature-icon teal"><CreditCard size={24} /></div>
                  <div>
                    <h4>Precios Transparentes</h4>
                    <p>Sin cargos ocultos. Conoce el precio exacto antes de confirmar tu reserva.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Rated Professionals */}
        <section id="profesionales" className="lux-professionals">
          <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div className="lux-prof-header">
              <div>
                <h2>Profesionales Destacados</h2>
                <p>Reserva con los favoritos de nuestra comunidad esta semana.</p>
              </div>
              <button className="lux-see-all" onClick={openLoginModal}>Ver todos <ArrowRight size={20} /></button>
            </div>

            <div className="lux-prof-grid">
              {proLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="lux-prof-card lux-prof-skeleton">
                      <div className="lux-prof-img lux-skeleton-img" />
                      <div className="lux-prof-info">
                        <div className="lux-skeleton-line" style={{ width: '60%', height: '1.2rem', marginBottom: '0.5rem' }} />
                        <div className="lux-skeleton-line" style={{ width: '80%', height: '0.85rem', marginBottom: '1rem' }} />
                        <div className="lux-skeleton-line" style={{ width: '100%', height: '2.5rem', borderRadius: '12px' }} />
                      </div>
                    </div>
                  ))
                : topProfessionals.length > 0
                  ? topProfessionals.map((p) => {
                      const firstName = p.user?.name ?? 'Pro';
                      const fullName = `${p.user?.name ?? ''} ${p.user?.lastName ?? ''}`.trim();
                      const activeServices = (p.professionalServices ?? []).filter(s => s.isActive);
                      const minPrice = activeServices.length > 0
                        ? Math.min(...activeServices.map(s => Number(s.price)))
                        : null;
                      const priceLabel = minPrice !== null
                        ? `Desde $${minPrice.toLocaleString('es-CO')}`
                        : 'Precio a consultar';
                      const tags = [...new Set(
                        activeServices.slice(0, 2).map(s => s.service?.name ?? s.service?.category ?? '').filter(Boolean)
                      )];
                      const rating = p.averageRating ? parseFloat(String(p.averageRating)).toFixed(1) : 'N/A';
                      const avatarUrl = p.user?.profileImage;
                      const role = activeServices[0]?.service?.category ?? activeServices[0]?.service?.name ?? 'Profesional de belleza';

                      return (
                        <div key={p.id} className="lux-prof-card">
                          <div className="lux-prof-img">
                            {avatarUrl
                              ? <img src={avatarUrl} alt={fullName} />
                              : <div className="lux-prof-avatar-fallback">{firstName.charAt(0).toUpperCase()}</div>
                            }
                            <div className="lux-prof-price">{priceLabel}</div>
                          </div>
                          <div className="lux-prof-info">
                            <div className="lux-prof-title">
                              <div>
                                <h3>{fullName}</h3>
                                <p>{role}</p>
                              </div>
                              <div className="lux-score"><Star size={14} fill="currentColor" /> {rating}</div>
                            </div>
                            <div className="lux-tags">
                              {tags.length > 0
                                ? tags.map(tag => <span key={tag}>{tag}</span>)
                                : <span>Servicios disponibles</span>
                              }
                            </div>
                            <Button className="w-full" onClick={openLoginModal}>Reservar con {firstName}</Button>
                          </div>
                        </div>
                      );
                    })
                  : (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#9ca3af', padding: '3rem 0' }}>
                        <p>No hay profesionales disponibles en este momento.</p>
                      </div>
                    )
              }
            </div>
          </div>
        </section>

        {/* Promotion */}
        <section className="lux-promo">
          <div className="container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div className="lux-promo-card">
              <div className="lux-promo-content">
                <span className="lux-promo-badge">OFERTA DE BIENVENIDA</span>
                <h2>Obtén 20% de descuento en tu primer servicio</h2>
                <p>Descarga la app, regístrate y usa el código <span className="lux-code">JustMe</span>.</p>
              </div>
              <div className="lux-promo-image">
                <img src={senora6} alt="Promo" />
                <div className="lux-promo-overlay"></div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contacto" className="landing-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="nav-brand">
                <span className="nav-logo-icon"><Sparkles size={20} color="#DC143C" /></span>
                <span className="nav-logo-text">JustMe</span>
              </div>
              <p>{t('landing.footer.desc')}</p>
            </div>
            <div className="footer-links">
              <h4>{t('landing.footer.platform')}</h4>
              <a href="#">{t('landing.footer.forClients')}</a>
              <a href="#">{t('landing.footer.forProfessionals')}</a>
              <a href="#">{t('landing.footer.pricing')}</a>
            </div>
            <div className="footer-links">
              <h4>{t('landing.footer.company')}</h4>
              <a href="#">{t('landing.footer.about')}</a>
              <a href="#">{t('landing.footer.blog')}</a>
              <a href="#">{t('landing.footer.careers')}</a>
            </div>
            <div className="footer-links">
              <h4>{t('landing.footer.support')}</h4>
              <a href="#">{t('landing.footer.helpCenter')}</a>
              <a href="#">{t('landing.footer.contact')}</a>
              <a href="#">{t('landing.footer.privacy')}</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t('landing.footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
