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
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-colors text-sm text-slate-300 hover:text-white group z-50 relative"
      title={language === 'es' ? 'Cambiar a Inglés' : 'Change to Spanish'}
    >
      <Globe className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
      <span className="font-medium uppercase tracking-wider">{language}</span>
    </button>
  );
}