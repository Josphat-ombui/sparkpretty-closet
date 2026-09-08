import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';

export const THEMES = {
  blue: {
    id: 'blue',
    label: 'Ocean Blue',
    swatch: '#1D6FD8',
    description: 'Clear, trustworthy and professional.',
  },
  green: {
    id: 'green',
    label: 'Emerald Green',
    swatch: '#1E8A5A',
    description: 'Fresh, natural and calming.',
  },
  pink: {
    id: 'pink',
    label: 'Blush Pink',
    swatch: '#D6337B',
    description: 'Soft, feminine and modern.',
  },
  maroon: {
    id: 'maroon',
    label: 'Royal Maroon',
    swatch: '#8E1F3B',
    description: 'Rich, elegant and bold.',
  },
};

export const THEME_ORDER = ['blue', 'green', 'pink', 'maroon'];

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const getInitial = () => {
  if (typeof window === 'undefined') return 'blue';
  const stored = localStorage.getItem('sparkpretty-theme');
  return THEMES[stored] ? stored : 'blue';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getInitial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', THEMES[theme] ? theme : 'blue');
  }, [theme]);

  useEffect(() => {
    let active = true;
    api.get('/site/settings')
      .then((res) => {
        if (!active) return;
        const remote = (res.data || {}).site_theme;
        if (THEMES[remote] && !localStorage.getItem('sparkpretty-theme')) {
          setThemeState(remote);
          document.documentElement.setAttribute('data-theme', remote);
        }
      })
      .catch(() => {})
      .finally(() => active && setLoaded(true));
    return () => { active = false; };
  }, []);

  const setTheme = useCallback((next) => {
    if (!THEMES[next]) return;
    setThemeState(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('sparkpretty-theme', next);
    } catch { /* ignore */ }
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      const idx = THEME_ORDER.indexOf(prev);
      const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('sparkpretty-theme', next);
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes: THEMES, themeList: THEME_ORDER, loaded }}>
      {children}
    </ThemeContext.Provider>
  );
};
