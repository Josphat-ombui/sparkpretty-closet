/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary-rgb))',
          dark: 'rgb(var(--primary-dark-rgb))',
          light: 'rgb(var(--primary-light-rgb))',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary-rgb))',
          dark: 'rgb(var(--secondary-dark-rgb))',
          light: '#E8F4FF',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb))',
          light: 'rgb(var(--accent-light-rgb))',
        },
        bg: {
          DEFAULT: 'rgb(var(--bg-rgb))',
          white: '#FFFFFF',
        },
        text: {
          DEFAULT: '#000000',
          light: '#4A4A4A',
          muted: '#8A8A8A',
        },
        border: 'rgb(var(--border-rgb))',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        button: 'var(--shadow-button)',
        modal: '0 20px 60px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
