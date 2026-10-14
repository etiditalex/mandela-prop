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
        "brand-soft": "var(--brand-soft)",
        black: "var(--black)",
        cream: "var(--cream)",
        karim: {
          50: "#f3ffff",
          100: "#d9ffff",
          200: "#a3ffff",
          300: "#66f7f7",
          400: "#22f4f4",
          500: "#00f8f8",
          600: "#00d8d8",
          700: "#00f8f8",
          800: "#00c4c4",
          900: "#046666",
        },
      },
    },
  },
  plugins: [],
};

export default config;
