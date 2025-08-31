/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#367AFF",
        secondary: "#0A142F",
        lightBlue: "#E8F0FE",
        grayText: "#667085",
      }
    },
  },
  plugins: [],
}
