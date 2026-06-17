import layerstack from '@layerstack/tailwind/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  plugins: [layerstack()],
  ux: {
    themes: {
      light: {
        primary: '#e8743f',
        'primary-content': '#1d1814',
        secondary: '#6b8e7f',
        'surface-100': '#fbf6ee',
        'surface-200': '#f3e9d7',
        'surface-300': '#ece0c8',
        'surface-content': '#1d1814',
      },
    },
  },
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#1d1814', 2: '#4a3f33', 3: '#7a6d5e' },
        paper: { DEFAULT: '#fbf6ee', 2: '#f3e9d7', 3: '#ece0c8' },
        brand: { DEFAULT: '#e8743f', soft: '#fbe6d6' },
        sage: { DEFAULT: '#6b8e7f', soft: '#d8e3dc' },
        teal: { DEFAULT: '#5a8f8a' },
      },
      fontFamily: {
        display: ['Cabinet Grotesk', 'Mona Sans', 'system-ui', 'sans-serif'],
        body: ['General Sans', 'Hanken Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '14px',
        lg: '22px',
        xl: '32px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      maxWidth: {
        container: 'var(--container)',
      },
    },
  },
};
