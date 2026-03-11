/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00AEEF',
        secondary: '#0077CC',
        'background-soft': '#E8F7FF',
      }
    },
  },
  plugins: [],
}
