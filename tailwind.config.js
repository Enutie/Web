/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'slide-1': '#DD4D3E',
        'slide-2': '#151515',
        'slide-3': '#2F4F4F',
      }
    },
  },
  plugins: [],
}