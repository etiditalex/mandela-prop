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
          50: "#f4faf6",
          100: "#e5f2ea",
          200: "#c5ddcc",
          300: "#8fb89a",
          400: "#6aa07c",
          500: "#4e8a62",
          600: "#3d7450",
          700: "#30603c",
          800: "#245032",
          900: "#183624",
        },
      },
    },
  },
  plugins: [],
};

export default config;
