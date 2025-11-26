import { createTailwindConfig } from "@ghxstship/config-tailwind";

/**
 * ATLVS Tailwind Configuration
 * Extends shared design system tokens from @ghxstship/config-tailwind
 * Only app-specific overrides should be defined here
 */
const config = createTailwindConfig({
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // App-specific grid layouts only
      gridTemplateColumns: {
        feature: "repeat(auto-fit, minmax(220px, 1fr))",
        "feature-lg": "repeat(auto-fit, minmax(280px, 1fr))",
      },
    },
  },
});

export default config;
