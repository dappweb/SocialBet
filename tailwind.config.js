/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        // => @media (min-width: 475px) { ... }
        'sm': '640px',
        // => @media (min-width: 640px) { ... }
        'md': '768px',
        // => @media (min-width: 768px) { ... }
        'lg': '1024px',
        // => @media (min-width: 1024px) { ... }
        'xl': '1280px',
        // => @media (min-width: 1280px) { ... }
        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }
        '3xl': '1920px',
        // => @media (min-width: 1920px) { ... }
      },
      colors: {
        'soul': {
          50: '#fff9e6',
          100: '#ffeb3b',
          200: '#ffd700',
          300: '#ffcc00',
          400: '#ffb300',
          500: '#ff9900',
          600: '#ff8000',
          700: '#ff6600',
          800: '#ff5200',
          900: '#ff3b30',
        }
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
