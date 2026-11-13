/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
      colors: {
        brand: {
          50: '#effcf8',
          100: '#d8f7ed',
          300: '#6ee7c5',
          500: '#0f9f83',
          600: '#0b806c',
          700: '#096657',
          900: '#06483f',
        },
      },
      boxShadow: { soft: '0 16px 45px rgba(15, 23, 42, 0.08)' },
    },
  },
  plugins: [],
};
