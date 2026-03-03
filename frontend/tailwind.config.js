/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#f97316', light: '#fb923c', dark: '#ea580c' },
        dark: { DEFAULT: '#0f172a', card: '#1e293b', border: '#334155' },
        accent: '#fbbf24'
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    }
  },
  plugins: []
}
