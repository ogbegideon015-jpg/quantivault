import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: "#B8860B", light: "#D4A017", bg: "#FFFBEB" },
        forest: { DEFAULT: "#1B3A2D", light: "#2D5E47" },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Gill Sans", "Calibri", "sans-serif"],
        mono: ["Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
