/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1565C0',
        secondary: '#FFD600',
        neutral: '#FFFFFF',
        dark: '#1a1a1a',
        light: '#f5f5f5',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'lift': '0 12px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
