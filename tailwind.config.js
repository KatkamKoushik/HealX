/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Calm emerald healthcare primary
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        healthcare: {
          teal: '#0d9488',
          blue: '#0284c7',
          amber: '#d97706',
          rose: '#e11d48',
          slate: '#334155',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Noto Sans Telugu"',
          'sans-serif',
        ],
        telugu: ['"Noto Sans Telugu"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
