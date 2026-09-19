import { useLanguage } from '../utils/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-sm text-white group z-50 relative"
      title={language === 'es' ? 'Cambiar a Inglés' : 'Change to Spanish'}
    >
      <Globe className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
      <span className="font-medium uppercase tracking-wider">{language}</span>
    </button>
  );
}