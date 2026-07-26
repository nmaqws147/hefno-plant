/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        primary: {
          DEFAULT: '#52b788',
          foreground: '#0d2818',
        },
        muted: {
          foreground: '#6b7280',
        },
        background: '#ffffff',
        foreground: '#1f2937',
        forest: {
          DEFAULT: '#1e352f',
          light: '#2d5a4a',
        },
        gold: {
          DEFAULT: '#b8955a',
          light: '#d4b87a',
        },
        champagne: {
          DEFAULT: '#faf7f0',
          dark: '#f5f0e5',
        },
        dark: {
          bg: '#0f1a09',
          card: '#1a2c0d',
          text: '#e8f5e8',
          'text-secondary': '#a8c6a8',
          border: '#2d4a1f',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'zoom-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'zoom-in': 'zoom-in 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
