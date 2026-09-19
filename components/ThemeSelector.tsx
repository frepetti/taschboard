import { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className = '' }: ThemeSelectorProps) {
  const { themes, currentTheme, setTheme, loading } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (loading && themes.length === 0) {
    return null;
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Seleccionar tema visual"
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-2 rounded-lg text-sm transition-colors"
      >
        <Palette className="w-4 h-4 text-theme-primary" />
        <span className="hidden md:inline font-medium">{currentTheme.nombre}</span>
        
        {/* Color preview pill */}
        <div className="flex items-center -space-x-1">
          <span
            className="w-3 h-3 rounded-full border border-slate-900 shadow-sm"
            style={{ backgroundColor: currentTheme.primary_color }}
            title={`Primario: ${currentTheme.primary_color}`}
          />
          <span
            className="w-3 h-3 rounded-full border border-slate-900 shadow-sm"
            style={{ backgroundColor: currentTheme.accent_color }}
            title={`Acento: ${currentTheme.accent_color}`}
          />
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-card backdrop-blur-md border border-border-subtle shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-border-subtle text-xs font-semibold text-content-muted uppercase tracking-wider">
            Temas Disponibles
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {themes.map((theme) => {
              const isSelected = theme.slug === currentTheme.slug;
              return (
                <button
                  key={theme.id || theme.slug}
                  type="button"
                  onClick={() => {
                    setTheme(theme.slug);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? 'bg-theme-primary/20 text-content-main font-medium'
                      : 'text-content-main hover:bg-surface-card-subtle'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Swatches */}
                    <div className="flex items-center -space-x-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-border-subtle shadow-sm"
                        style={{ backgroundColor: theme.primary_color }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-border-subtle shadow-sm"
                        style={{ backgroundColor: theme.accent_color }}
                      />
                    </div>
                    <span>{theme.nombre}</span>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-theme-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
