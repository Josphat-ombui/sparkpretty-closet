import { createContext, useContext, useEffect, useState } from 'react';

export const THEMES = {
  'light-pink': {
    label: 'Light Pink',
    swatch: '#FFB6C1',
    vars: {
      '--primary-rgb': '255, 182, 193',
      '--primary-dark-rgb': '255, 105, 180',
      '--primary-light-rgb': '255, 228, 232',
      '--secondary-rgb': '30, 144, 255',
      '--secondary-dark-rgb': '24, 115, 204',
      '--accent-rgb': '255, 105, 180',
      '--accent-light-rgb': '255, 182, 193',
      '--bg-rgb': '255, 245, 248',
      '--border-rgb': '255, 214, 222',
      '--shadow-card': '0 2px 12px rgba(255, 182, 193, 0.2)',
      '--shadow-card-hover': '0 8px 30px rgba(255, 182, 193, 0.3)',
      '--shadow-button': '0 4px 14px rgba(30, 144, 255, 0.3)',
      '--grad-hero-from': '#FFB6C1',
      '--grad-hero-to': '#1E90FF',
      '--grad-soft-from': '#FFF5F8',
      '--grad-soft-to': '#FFE4E8',
      '--footer-from': '#E91E63',
      '--footer-to': '#AD1457',
    },
  },
  'dark-pink': {
    label: 'Dark Pink',
    swatch: '#C2185B',
    vars: {
      '--primary-rgb': '194, 24, 91',
      '--primary-dark-rgb': '173, 20, 87',
      '--primary-light-rgb': '248, 187, 208',
      '--secondary-rgb': '30, 144, 255',
      '--secondary-dark-rgb': '24, 115, 204',
      '--accent-rgb': '212, 165, 116',
      '--accent-light-rgb': '232, 201, 160',
      '--bg-rgb': '255, 245, 245',
      '--border-rgb': '243, 232, 232',
      '--shadow-card': '0 2px 12px rgba(194, 24, 91, 0.08)',
      '--shadow-card-hover': '0 8px 30px rgba(194, 24, 91, 0.12)',
      '--shadow-button': '0 4px 14px rgba(30, 144, 255, 0.25)',
      '--grad-hero-from': '#C2185B',
      '--grad-hero-to': '#D4A574',
      '--grad-soft-from': '#FFF5F5',
      '--grad-soft-to': '#F8BBD0',
      '--footer-from': '#C2185B',
      '--footer-to': '#880E4F',
    },
  },
  blue: {
    label: 'Blue',
    swatch: '#1E90FF',
    vars: {
      '--primary-rgb': '30, 144, 255',
      '--primary-dark-rgb': '24, 115, 204',
      '--primary-light-rgb': '227, 242, 255',
      '--secondary-rgb': '30, 144, 255',
      '--secondary-dark-rgb': '24, 115, 204',
      '--accent-rgb': '255, 105, 180',
      '--accent-light-rgb': '255, 182, 193',
      '--bg-rgb': '245, 250, 255',
      '--border-rgb': '219, 234, 254',
      '--shadow-card': '0 2px 12px rgba(30, 144, 255, 0.12)',
      '--shadow-card-hover': '0 8px 30px rgba(30, 144, 255, 0.18)',
      '--shadow-button': '0 4px 14px rgba(30, 144, 255, 0.3)',
      '--grad-hero-from': '#1E90FF',
      '--grad-hero-to': '#FF69B4',
      '--grad-soft-from': '#F5FAFF',
      '--grad-soft-to': '#E3F2FF',
      '--footer-from': '#1E90FF',
      '--footer-to': '#0B5ED7',
    },
  },
};

export const THEME_ORDER = ['light-pink', 'dark-pink', 'blue'];

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const getInitial = () => {
  const stored = typeof window !== 'undefined' && localStorage.getItem('sparkpretty-theme');
  return THEMES[stored] ? stored : 'light-pink';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    const vars = THEMES[theme].vars;
    Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
    root.setAttribute('data-theme', theme);
    localStorage.setItem('sparkpretty-theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme((prev) => {
      const idx = THEME_ORDER.indexOf(prev);
      return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};
