/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#000000',
        'secondary': '#1A1A1A',
        'accent': '#3B82F6',
        'success': '#22C55E',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'bg': '#FFFFFF',
        'card-bg': '#F5F5F5',
        'border-color': '#E5E5E5',
      },
      fontFamily: {
        'sans': ['Inter', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
