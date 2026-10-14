import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "var(--brand)",
        black: "var(--black)",
        cream: "var(--cream)",
        karim: {
          50: "#f2f7f4",
          100: "#dcebe3",
          200: "#b7d6c6",
          300: "#86b8a0",
          400: "#4d8f72",
          500: "#2a6d52",
          600: "#1c5a42",
          700: "#164a36",
          800: "#11392a",
          900: "#0c281d",
        },
      },
    },
  },
  plugins: [],
};

export default config;
