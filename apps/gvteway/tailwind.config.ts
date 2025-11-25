import type { Config } from "tailwindcss";
import { createTailwindConfig } from "@ghxstship/config-tailwind";

const config = createTailwindConfig({
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#ffffff",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#000000",
        },
      },
      fontFamily: {
        display: ["var(--font-anton)", "Anton", "sans-serif"],
        heading: ["var(--font-bebas)", "Bebas Neue", "sans-serif"],
        body: ["var(--font-share-tech)", "Share Tech", "sans-serif"],
        code: ["var(--font-share-tech-mono)", "Share Tech Mono", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.05em",
        wide: "0.4em",
      },
    },
  },
});

export default config;
