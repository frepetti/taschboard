import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../utils/AuthContext';

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

/**
 * Normalizes empresa name and resolves it against the active themes list.
 * Fallback to 'default' if empty or not matched.
 */
export function resolveThemeForUser(empresa: string | null | undefined, themeList: Theme[]): Theme {
  const defaultTheme = themeList.find(t => t.slug === 'default') || themeList[0] || FALLBACK_THEMES[0];
  if (!empresa) return defaultTheme;

  const normalized = empresa.trim().toLowerCase();
  if (!normalized) return defaultTheme;

  const matched = themeList.find(
    t => t.slug.toLowerCase() === normalized || t.nombre.toLowerCase() === normalized
  );

  return matched || defaultTheme;
}

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
  const { dbUser, dbRole } = useAuth();
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

        // Re-evaluate active theme against new list and user role
        if (dbRole && dbRole !== 'admin' && dbUser) {
          localStorage.removeItem(THEME_STORAGE_KEY);
          const resolved = resolveThemeForUser(dbUser.empresa, mappedThemes);
          setCurrentThemeState(resolved);
          applyThemeVariables(resolved);
        } else if (dbRole === 'admin') {
          const savedSlug = localStorage.getItem(THEME_STORAGE_KEY);
          const matched = mappedThemes.find(t => t.slug === savedSlug || t.id === savedSlug);
          if (matched) {
            setCurrentThemeState(matched);
            applyThemeVariables(matched);
          } else {
            const resolved = resolveThemeForUser(dbUser?.empresa, mappedThemes);
            setCurrentThemeState(resolved);
            applyThemeVariables(resolved);
          }
        } else {
          const savedSlug = localStorage.getItem(THEME_STORAGE_KEY);
          const matched = mappedThemes.find(t => t.slug === savedSlug || t.id === savedSlug);
          if (matched) {
            setCurrentThemeState(matched);
            applyThemeVariables(matched);
          } else {
            const defaultTheme = mappedThemes.find(t => t.slug === 'default') || mappedThemes[0];
            setCurrentThemeState(defaultTheme);
            applyThemeVariables(defaultTheme);
          }
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
  }, [dbRole, dbUser]);

  // Initial load: setup color scheme & fetch live themes
  useEffect(() => {
    // Initial color scheme preference (default: 'dark')
    const savedScheme = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY) as ColorScheme | null;
    const initialScheme: ColorScheme = savedScheme === 'light' || savedScheme === 'dark' ? savedScheme : 'dark';
    setColorSchemeState(initialScheme);
    applyColorSchemeVariables(initialScheme);

    // Fetch live themes
    refreshThemes();
  }, [refreshThemes]);

  // Synchronize theme dynamically when dbUser, dbRole, or themes change
  useEffect(() => {
    if (dbUser && dbRole) {
      if (dbRole !== 'admin') {
        localStorage.removeItem(THEME_STORAGE_KEY);
        const resolved = resolveThemeForUser(dbUser.empresa, themes);
        setCurrentThemeState(resolved);
        applyThemeVariables(resolved);
      } else {
        const savedSlug = localStorage.getItem(THEME_STORAGE_KEY);
        const matched = themes.find(t => t.slug === savedSlug || t.id === savedSlug);
        if (matched) {
          setCurrentThemeState(matched);
          applyThemeVariables(matched);
        } else {
          const resolved = resolveThemeForUser(dbUser.empresa, themes);
          setCurrentThemeState(resolved);
          applyThemeVariables(resolved);
        }
      }
    } else if (!dbUser && !localStorage.getItem(THEME_STORAGE_KEY)) {
      const defaultTheme = themes.find(t => t.slug === 'default') || themes[0] || FALLBACK_THEMES[0];
      setCurrentThemeState(defaultTheme);
      applyThemeVariables(defaultTheme);
    }
  }, [dbUser, dbRole, themes]);

  const setTheme = useCallback(
    (slugOrId: string) => {
      // Role protection: Only admins can manually override theme
      if (dbRole && dbRole !== 'admin') {
        console.warn(`[ThemeContext] Theme switching is disabled for role: ${dbRole}`);
        return;
      }

      const found = themes.find(t => t.slug === slugOrId || t.id === slugOrId);
      if (found) {
        setCurrentThemeState(found);
        applyThemeVariables(found);
        localStorage.setItem(THEME_STORAGE_KEY, found.slug);
      } else {
        console.warn(`⚠️ Theme '${slugOrId}' not found in active themes`);
      }
    },
    [themes, dbRole]
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

