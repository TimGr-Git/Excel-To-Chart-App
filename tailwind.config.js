/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}", // all pages in the app directory
    "./components/**/*.{ts,tsx}", // all components you add
    "./pages/**/*.{ts,tsx}", // optional if you still use pages/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
