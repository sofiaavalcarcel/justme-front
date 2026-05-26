import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import './LanguageToggle.css';

interface LanguageToggleProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LanguageToggle({ size = 'md' }: LanguageToggleProps) {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      className={`lang-toggle lang-toggle-${size}`}
      onClick={toggleLanguage}
      aria-label="Toggle language"
      title={i18n.language.startsWith('es') ? 'Switch to English' : 'Cambiar a Español'}
    >
      <Globe size={size === 'sm' ? 18 : size === 'lg' ? 24 : 20} />
      <span className="lang-text">{i18n.language.startsWith('es') ? 'ES' : 'EN'}</span>
    </button>
  );
}
