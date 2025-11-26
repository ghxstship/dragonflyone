import { createTailwindConfig } from "@ghxstship/config-tailwind";

/**
 * GVTEWAY Tailwind Configuration
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
});

export default config;
