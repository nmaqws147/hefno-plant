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
          DEFAULT: '#d4a843',
          light: '#f0d78c',
          dark: '#b8922e',
          50: '#fdf8ed',
          100: '#f9edcf',
          200: '#f2d89e',
          300: '#e9be63',
          400: '#d4a843',
          500: '#c4922a',
          600: '#a87420',
          700: '#8a571c',
          800: '#73461f',
          900: '#623a1f',
        },
        luxury: {
          black: '#0a0a0a',
          card: '#141414',
          surface: '#1a1a1a',
          border: 'rgba(212,168,67,0.2)',
          'border-strong': 'rgba(212,168,67,0.4)',
        },
        sage: {
          DEFAULT: '#8a9a7a',
          light: '#a8b89a',
          dark: '#6a7a5a',
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
