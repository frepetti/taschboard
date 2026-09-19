import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../utils/LanguageContext';

export function ColorSchemeToggle() {
  const { colorScheme, toggleColorScheme } = useTheme();
  const { language } = useLanguage();

  const isDark = colorScheme === 'dark';
  const label = isDark
    ? (language === 'es' ? 'Cambiar a modo claro' : 'Switch to light mode')
    : (language === 'es' ? 'Cambiar a modo oscuro' : 'Switch to dark mode');

  return (
    <button
      onClick={toggleColorScheme}
      className="flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg p-2 transition-all group relative z-10"
      title={label}
      aria-label={label}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-300 group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-slate-100 group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
