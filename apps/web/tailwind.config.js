/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#0fb88b",
        "primary-dark": "#0a8f6b",
        "background-light": "#f6f8f7",
        "background-dark": "#020906", // Deepest Forest Green
        "glass-dark": "#0A2319",
        "accent-yellow": "#F59E0B",
        "gold": "#D4AF37",
        "gold-light": "#F4D06F",
        "forest-dark": "#052e22",
        "forest-deep": "#021a12",
        "surface-dark": "#162e28",
        "surface-darker": "#0b1815",
        "rose-red": "#ff4d5e",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.375rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
