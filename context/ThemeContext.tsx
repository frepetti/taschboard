import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';

export interface ThemeConfig {
  badge_style?: 'default' | 'heineken_star' | string;
  logo_url?: string;
  score_shape?: string;
  star_color?: string;
  [key: string]: any;
}

export interface Theme {
  id: string;
  nombre: string;
  slug: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  border_color: string;
  config?: ThemeConfig;
  activo: boolean;
  created_at?: string;
}

export type ColorScheme = 'dark' | 'light';

export interface ThemeContextType {
  themes: Theme[];
  currentTheme: Theme;
  setTheme: (slugOrId: string) => void;
  refreshThemes: () => Promise<void>;
  loading: boolean;
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

export const FALLBACK_THEMES: Theme[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    nombre: 'Default',
    slug: 'default',
    primary_color: '#7c3aed',
    secondary_color: '#4c1d95',
    accent_color: '#ec4899',
    border_color: '#334155',
    config: { badge_style: 'default' },
    activo: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    nombre: 'Heineken',
    slug: 'heineken',
    primary_color: '#008200',
    secondary_color: '#205527',
    accent_color: '#ff2b00',
    border_color: '#c3c3c3',
    config: { badge_style: 'heineken_star', header_bg: '#205527', header_text: '#ffffff' },
    activo: true,
  },
];

const THEME_STORAGE_KEY = 'taschboard_active_theme';
const COLOR_SCHEME_STORAGE_KEY = 'taschboard_color_scheme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function applyColorSchemeVariables(scheme: ColorScheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.setAttribute('data-color-scheme', scheme);

  if (scheme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.setProperty('--bg-app', '#0f1117');
    root.style.setProperty('--bg-card', '#181b23');
    root.style.setProperty('--bg-card-subtle', '#222631');
    root.style.setProperty('--text-main', '#ffffff');
    root.style.setProperty('--text-muted', '#9ca3af');
    root.style.setProperty('--border-subtle', '#2d3342');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    root.style.setProperty('--bg-app', '#ebedf0');
    root.style.setProperty('--bg-card', '#ffffff');
    root.style.setProperty('--bg-card-subtle', '#f8fafc');
    root.style.setProperty('--text-main', '#0f172a');
    root.style.setProperty('--text-muted', '#64748b');
    root.style.setProperty('--border-subtle', '#d5d9e2');
  }
}

export function applyThemeVariables(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Custom multi-tenant CSS properties
  root.style.setProperty('--theme-primary', theme.primary_color);
  root.style.setProperty('--theme-secondary', theme.secondary_color);
  root.style.setProperty('--theme-accent', theme.accent_color);
  root.style.setProperty('--theme-border', theme.border_color);

  // Dynamic Header Variables (Immutable across dark/light mode)
  const headerBg = theme.config?.header_bg || (theme.slug === 'heineken' || theme.secondary_color === '#205527' ? '#205527' : '#111318');
  const headerText = theme.config?.header_text || '#ffffff';
  root.style.setProperty('--theme-header-bg', headerBg);
  root.style.setProperty('--theme-header-text', headerText);

  // Standard Tailwind / Theme overrides
  root.style.setProperty('--primary', theme.primary_color);
  root.style.setProperty('--secondary', theme.secondary_color);
  root.style.setProperty('--accent', theme.accent_color);
  root.style.setProperty('--border', theme.border_color);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themes, setThemes] = useState<Theme[]>(FALLBACK_THEMES);
  const [currentTheme, setCurrentThemeState] = useState<Theme>(FALLBACK_THEMES[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('dark');

  // Apply CSS variables whenever currentTheme changes
  useEffect(() => {
    applyThemeVariables(currentTheme);
  }, [currentTheme]);

  // Apply color scheme CSS variables whenever colorScheme changes
  useEffect(() => {
    applyColorSchemeVariables(colorScheme);
  }, [colorScheme]);

  // Fetch active themes from Supabase with fallback to static catalog
  const refreshThemes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('btl_temas')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('⚠️ Could not load themes from Supabase, using fallback themes:', error.message);
        setThemes(FALLBACK_THEMES);
        return;
      }

      if (data && data.length > 0) {
        const mappedThemes: Theme[] = data.map((item: any) => ({
          id: item.id,
          nombre: item.nombre,
          slug: item.slug,
          primary_color: item.primary_color,
          secondary_color: item.secondary_color,
          accent_color: item.accent_color,
          border_color: item.border_color,
          config: typeof item.config === 'object' && item.config !== null ? item.config : {},
          activo: Boolean(item.activo),
          created_at: item.created_at,
        }));

        setThemes(mappedThemes);

        // Re-evaluate active theme against new list
        const savedSlug = localStorage.getItem(THEME_STORAGE_KEY);
        const matched = mappedThemes.find(t => t.slug === savedSlug || t.id === savedSlug);
        if (matched) {
          setCurrentThemeState(matched);
        } else if (!mappedThemes.some(t => t.slug === currentTheme.slug)) {
          setCurrentThemeState(mappedThemes[0]);
        }
      } else {
        setThemes(FALLBACK_THEMES);
      }
    } catch (err) {
      console.warn('⚠️ Network or runtime error fetching themes:', err);
      setThemes(FALLBACK_THEMES);
    } finally {
      setLoading(false);
    }
  }, [currentTheme.slug]);

  // Initial load
  useEffect(() => {
    // 1. Initial cached theme preference
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      const initial = FALLBACK_THEMES.find(t => t.slug === savedTheme || t.id === savedTheme);
      if (initial) {
        setCurrentThemeState(initial);
        applyThemeVariables(initial);
      }
    } else {
      applyThemeVariables(FALLBACK_THEMES[0]);
    }

    // 2. Initial cached color scheme preference (default: 'dark')
    const savedScheme = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY) as ColorScheme | null;
    const initialScheme: ColorScheme = savedScheme === 'light' || savedScheme === 'dark' ? savedScheme : 'dark';
    setColorSchemeState(initialScheme);
    applyColorSchemeVariables(initialScheme);

    // 3. Fetch live data
    refreshThemes();
  }, [refreshThemes]);

  const setTheme = useCallback(
    (slugOrId: string) => {
      const found = themes.find(t => t.slug === slugOrId || t.id === slugOrId);
      if (found) {
        setCurrentThemeState(found);
        applyThemeVariables(found);
        localStorage.setItem(THEME_STORAGE_KEY, found.slug);
      } else {
        console.warn(`⚠️ Theme '${slugOrId}' not found in active themes`);
      }
    },
    [themes]
  );

  const toggleColorScheme = useCallback(() => {
    setColorSchemeState(prev => {
      const next: ColorScheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, next);
      applyColorSchemeVariables(next);
      return next;
    });
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
    applyColorSchemeVariables(scheme);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        themes,
        currentTheme,
        setTheme,
        refreshThemes,
        loading,
        colorScheme,
        toggleColorScheme,
        setColorScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

