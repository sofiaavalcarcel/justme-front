import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Verified, CreditCard, ArrowRight, Sparkles, Menu, X } from 'lucide-react';

import { Button, ThemeToggle, LanguageToggle } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import './Landing.css';
import videoo from '../../assets/imagenes/videoo.mp4';
import senora1 from '../../assets/imagenes/señora_1.png';
import senora2 from '../../assets/imagenes/señora_2.png';
import senora3 from '../../assets/imagenes/señora_3.png';
import senora4 from '../../assets/imagenes/señora_4.png';
import senora6 from '../../assets/imagenes/señora_6.png';

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { openLoginModal } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <div className="desktop-actions">
              <LanguageToggle size="sm" />
            </div>
            <ThemeToggle size="sm" />
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
              <Button variant="primary" className="w-full" onClick={() => navigate('/register')}>{t('nav.getStarted')}</Button>
            </div>
          </nav>
        </div>
      </header>

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
              <button className="lux-see-all">Ver todos <ArrowRight size={20} /></button>
            </div>

            <div className="lux-prof-grid">
              {[
                { name: 'Elena Martinez', role: 'Especialista en Faciales & Skincare', img: senora2, price: '$85/sesión', score: '4.9', tags: ['HydraFacial', 'Peeling'] },
                { name: 'Marcus Vance', role: 'Hair Stylist & Color Metry', img: senora3, price: '$120/sesión', score: '5.0', tags: ['Balayage', 'Tratamientos'] },
                { name: 'Sofia Rossi', role: 'Manicurista & Masoterapeuta', img: senora4, price: '$65/sesión', score: '4.8', tags: ['Gelish', 'Relajante'] }
              ].map((p, i) => (

                <div key={i} className="lux-prof-card">
                  <div className="lux-prof-img">
                    <img src={p.img} alt={p.name} />
                    <div className="lux-prof-price">{p.price}</div>
                  </div>
                  <div className="lux-prof-info">
                    <div className="lux-prof-title">
                      <div>
                        <h3>{p.name}</h3>
                        <p>{p.role}</p>
                      </div>
                      <div className="lux-score"><Star size={14} fill="currentColor" /> {p.score}</div>
                    </div>
                    <div className="lux-tags">
                      {p.tags.map(t => <span key={t}>{t}</span>)}
                    </div>
                    <Button className="w-full">Reservar con {p.name.split(' ')[0]}</Button>
                  </div>
                </div>
              ))}
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
