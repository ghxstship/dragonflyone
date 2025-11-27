/**
 * GHXSTSHIP Design System ESLint Configuration
 * 
 * ZERO TOLERANCE POLICY:
 * - No raw HTML elements (use design system components)
 * - No default Tailwind classes outside design system
 * - No inline styles
 * - No hardcoded values (colors, spacing, typography)
 * - No ad-hoc component variations
 * 
 * ALL UI must go through design system components and tokens.
 */
module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:tailwindcss/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "tailwindcss"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  settings: {
    tailwindcss: {
      // Use callees to detect Tailwind classes in cn(), clsx(), etc.
      callees: ["cn", "clsx", "cva", "twMerge"],
      // Allow design system classes
      whitelist: [
        // Typography tokens
        "text-display-.*", "text-h[1-6]-.*", "text-body-.*", "text-mono-.*", "text-micro.*",
        // Font families
        "font-display", "font-heading", "font-body", "font-mono", "font-code",
        // Font weights
        "font-weight-.*",
        // Line heights
        "leading-display", "leading-heading", "leading-title", "leading-subtitle", 
        "leading-body", "leading-relaxed", "leading-comfortable", "leading-none",
        // Semantic colors
        "bg-surface-.*", "bg-ink-.*", "bg-success.*", "bg-warning.*", "bg-error.*", "bg-info.*",
        "text-on-dark-.*", "text-on-light-.*", "text-on-mid-.*",
        "text-primary", "text-secondary", "text-tertiary", "text-muted", "text-inverse", "text-accent", "text-link.*",
        "border-primary", "border-secondary", "border-muted", "border-focus", "border-inverse", "border-accent",
        // Semantic spacing
        "spacing-.*", "gap-xs", "gap-sm", "gap-md", "gap-lg", "gap-xl", "gap-2xl", "gap-3xl",
        // Semantic sizing
        "w-icon-.*", "h-icon-.*", "w-avatar-.*", "h-avatar-.*", "h-input.*", "h-button.*",
        "min-w-card-.*", "min-w-sidebar", "min-w-select",
        "max-w-container-.*", "max-w-prose", "max-w-content",
        "min-h-card", "min-h-calendar-cell", "min-h-panel-.*", "min-h-chat", "min-h-map",
        "max-h-dropdown", "max-h-modal", "max-h-panel-.*", "max-h-chat",
        // Semantic border radius
        "rounded-radius-.*", "rounded-button", "rounded-input", "rounded-card", "rounded-avatar", "rounded-badge", "rounded-tag",
        // Semantic shadows
        "shadow-outline.*", "shadow-hard.*", "shadow-sm", "shadow-md", "shadow-lg",
        // Z-index
        "z-base", "z-dropdown", "z-sticky", "z-fixed", "z-modal.*", "z-popover", "z-tooltip",
        // Transitions
        "duration-fast", "duration-base", "duration-slow", "duration-slower",
        // Animations
        "animate-hard-fade", "animate-scanline",
        // Opacity
        "opacity-overlay.*", "opacity-disabled", "opacity-muted", "opacity-hover",
        // Backgrounds
        "bg-halftone.*", "bg-grid-.*",
        // Accent colors (allowed for categories/tags)
        "bg-purple.*", "bg-pink.*", "bg-cyan.*", "bg-teal.*", "bg-violet.*", "bg-indigo.*",
        "text-purple.*", "text-pink.*", "text-cyan.*", "text-teal.*", "text-violet.*", "text-indigo.*",
        "border-purple.*", "border-pink.*", "border-cyan.*", "border-teal.*", "border-violet.*", "border-indigo.*",
        // Grey/Ink palette (design system)
        "bg-grey-.*", "text-grey-.*", "border-grey-.*",
        "bg-ink-.*", "text-ink-.*", "border-ink-.*",
        // Black/White (design system)
        "bg-black", "bg-white", "text-black", "text-white", "border-black", "border-white",
        // Interactive states
        "hover-surface", "active-surface", "focus-ring",
        // Ring tokens
        "ring-focus.*", "ring-error", "ring-success",
        // Letter spacing
        "tracking-label", "tracking-kicker", "tracking-display",
        // Aspect ratios
        "aspect-square", "aspect-video.*", "aspect-photo.*", "aspect-wide", "aspect-ultrawide", "aspect-golden"
      ]
    }
  },
  rules: {
    // ============================================================
    // DESIGN SYSTEM ENFORCEMENT - ZERO TOLERANCE
    // ============================================================
    
    // Tailwind plugin rules
    "tailwindcss/classnames-order": "warn",
    "tailwindcss/no-custom-classname": ["warn", {
      // Allow design system classes that may not be in default Tailwind
      "whitelist": [
        "text-display-.*", "text-h[1-6]-.*", "text-body-.*", "text-mono-.*",
        "font-display", "font-heading", "font-body", "font-mono", "font-code",
        "bg-surface-.*", "bg-ink-.*", "bg-grey-.*",
        "text-on-dark-.*", "text-on-light-.*", "text-on-mid-.*",
        "text-primary", "text-secondary", "text-tertiary", "text-muted",
        "border-primary", "border-secondary", "border-muted",
        "spacing-.*", "gap-xs", "gap-sm", "gap-md", "gap-lg", "gap-xl",
        "rounded-radius-.*", "rounded-button", "rounded-input", "rounded-card",
        "shadow-outline.*", "shadow-hard.*",
        "z-base", "z-dropdown", "z-sticky", "z-fixed", "z-modal.*", "z-popover", "z-tooltip",
        "duration-fast", "duration-base", "duration-slow", "duration-slower",
        "animate-hard-fade", "animate-scanline"
      ]
    }],
    "tailwindcss/no-contradicting-classname": "error",
    
    // TypeScript rules
    "@typescript-eslint/no-unused-vars": ["warn", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/no-explicit-any": "warn",
    
    // General code quality
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "warn",
    "no-var": "error",
    "react/jsx-key": "warn",
    
    // ============================================================
    // RAW TAILWIND PROHIBITION
    // Note: Set to "warn" during transition period. Change to "error" once all violations are fixed.
    // See BACKLOG.md for remediation plan.
    // ============================================================
    "no-restricted-syntax": [
      "warn",
      
      // ----------------------------------------
      // PROHIBITED: Raw Tailwind Typography
      // ----------------------------------------
      {
        "selector": "Literal[value=/(?<![a-z-])text-(xs|sm|base|lg|xl)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind text size. Use design system: text-body-*, text-mono-*, text-h*-*, text-display-*"
      },
      {
        "selector": "Literal[value=/(?<![a-z-])text-[2-9]xl(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind text size. Use design system: text-h*-*, text-display-*"
      },
      {
        "selector": "Literal[value=/(?<![a-z-])font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind font weight. Use design system: font-weight-normal, font-weight-medium, font-weight-semibold, font-weight-bold"
      },
      {
        "selector": "Literal[value=/(?<![a-z-])font-(sans|serif)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind font family. Use design system: font-display, font-heading, font-body, font-mono, font-code"
      },
      {
        "selector": "Literal[value=/(?<![a-z-])leading-(none|tight|snug|normal|relaxed|loose)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind line height. Use design system: leading-display, leading-heading, leading-body, leading-relaxed, leading-comfortable"
      },
      {
        "selector": "Literal[value=/(?<![a-z-])tracking-(tighter|tight|normal|wide|wider|widest)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind letter spacing. Use design system: tracking-label, tracking-kicker, tracking-display, or specific values"
      },
      
      // ----------------------------------------
      // PROHIBITED: Raw Tailwind Colors (Default Palette)
      // ----------------------------------------
      {
        "selector": "Literal[value=/(?<![a-z-])(bg|text|border|ring|outline|fill|stroke|from|via|to|divide|placeholder|decoration|accent|caret|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|sky|blue|rose)-[0-9]+/]",
        "message": "❌ PROHIBITED: Raw Tailwind color. Use design system semantic colors: bg-surface-*, bg-ink-*, text-on-dark-*, text-on-light-*, success-*, warning-*, error-*, info-*"
      },
      
      // ----------------------------------------
      // PROHIBITED: Arbitrary Values (Square Brackets)
      // ----------------------------------------
      {
        "selector": "Literal[value=/\\[#[0-9a-fA-F]{3,8}\\]/]",
        "message": "❌ PROHIBITED: Arbitrary hex color. Use design system color tokens from tailwind config."
      },
      {
        "selector": "Literal[value=/\\[rgb(a)?\\(/]",
        "message": "❌ PROHIBITED: Arbitrary RGB color. Use design system color tokens from tailwind config."
      },
      {
        "selector": "Literal[value=/\\[hsl(a)?\\(/]",
        "message": "❌ PROHIBITED: Arbitrary HSL color. Use design system color tokens from tailwind config."
      },
      {
        "selector": "Literal[value=/(?<![a-z-])(w|h|p|m|gap|space|top|right|bottom|left|inset)-\\[[0-9]+(px|rem|em|vh|vw|%)\\]/]",
        "message": "❌ PROHIBITED: Arbitrary spacing/sizing value. Use design system spacing tokens: spacing-*, gap-xs/sm/md/lg/xl"
      },
      {
        "selector": "Literal[value=/rounded-\\[[0-9]+(px|rem)\\]/]",
        "message": "❌ PROHIBITED: Arbitrary border radius. Use design system: rounded-radius-*, rounded-button, rounded-card, rounded-input"
      },
      {
        "selector": "Literal[value=/shadow-\\[/]",
        "message": "❌ PROHIBITED: Arbitrary shadow. Use design system: shadow-outline, shadow-hard, shadow-sm, shadow-md, shadow-lg"
      },
      {
        "selector": "Literal[value=/z-\\[[0-9]+\\]/]",
        "message": "❌ PROHIBITED: Arbitrary z-index. Use design system: z-base, z-dropdown, z-sticky, z-fixed, z-modal, z-popover, z-tooltip"
      },
      
      // ----------------------------------------
      // PROHIBITED: Raw Tailwind Border Radius
      // ----------------------------------------
      {
        "selector": "Literal[value=/(?<![a-z-])rounded-(sm|md|lg|xl|2xl|3xl|full)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind border radius. Use design system: rounded-radius-*, rounded-button, rounded-card, rounded-input, rounded-avatar"
      },
      
      // ----------------------------------------
      // PROHIBITED: Raw Tailwind Shadows
      // ----------------------------------------
      {
        "selector": "Literal[value=/(?<![a-z-])shadow-(sm|md|lg|xl|2xl|inner)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind shadow. Use design system: shadow-outline, shadow-hard, shadow-sm, shadow-md, shadow-lg"
      }
    ]
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "out/",
    "build/",
    "dist/",
    "*.config.js",
    "*.config.ts",
    ".eslintrc.js",
    ".eslintrc.json",
    "packages/config-tailwind/",
    "packages/config-eslint/",
    "packages/config-postcss/"
  ],
  overrides: [
    {
      // Design system UI components can use raw Tailwind internally
      files: ["packages/ui/src/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-syntax": "off"
      }
    },
    {
      // Config files are exempt
      files: ["*.config.{js,ts,mjs,cjs}", "tailwind.config.*"],
      rules: {
        "no-restricted-syntax": "off",
        "tailwindcss/no-custom-classname": "off"
      }
    }
  ]
};
