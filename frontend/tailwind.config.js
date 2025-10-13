/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Scientific theme colors
        'science-blue': '#0066cc',
        'science-dark': '#1a1a2e',
        'science-light': '#f8f9fa',
        'science-accent': '#00d4ff',
      },
    },
  },
  plugins: [],
}
