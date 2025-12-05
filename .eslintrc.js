/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  GHXSTSHIP DESIGN SYSTEM — BOLD CONTEMPORARY POP ART ADVENTURE                ║
 * ╠═══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                               ║
 * ║  ZERO TOLERANCE POLICY:                                                       ║
 * ║  • No raw HTML elements (use design system components)                        ║
 * ║  • No default Tailwind classes outside design system                          ║
 * ║  • No inline styles                                                           ║
 * ║  • No hardcoded values (colors, spacing, typography)                          ║
 * ║  • No ad-hoc component variations                                             ║
 * ║  • No soft shadows (hard offset only)                                         ║
 * ║  • No thin borders on interactive elements (2px+ required)                    ║
 * ║                                                                               ║
 * ║  ALL UI must go through design system components and tokens.                  ║
 * ║                                                                               ║
 * ║  AESTHETIC PILLARS:                                                           ║
 * ║  • BOLD: Thick borders (2-4px), heavy font weights, high contrast             ║
 * ║  • CONTEMPORARY: Sharp corners on actions, rounded on containers              ║
 * ║  • POP ART: Hard offset shadows, halftone/stripe patterns                     ║
 * ║  • ADVENTURE: Bounce animations, dynamic transforms                           ║
 * ║  • COMIC BOOK: Panel layouts, thick outlines, depth layers                    ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  rules: {
    // ════════════════════════════════════════════════════════════════════
    // DESIGN SYSTEM ENFORCEMENT - ZERO TOLERANCE
    // ════════════════════════════════════════════════════════════════════
    
    // NOTE: Tailwind ESLint plugin removed - our design system uses extensive
    // custom classes that the plugin cannot validate. The design system itself
    // enforces consistency through component APIs and TypeScript types.
    
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
    
    // ════════════════════════════════════════════════════════════════════
    // RAW TAILWIND PROHIBITION - BOLD CONTEMPORARY POP ART ENFORCEMENT
    // ════════════════════════════════════════════════════════════════════
    // 
    // AESTHETIC REQUIREMENTS:
    // • Borders: 2px+ on interactive elements (no 1px borders on buttons/inputs)
    // • Shadows: Hard offset only (no soft/blur shadows)
    // • Radius: Sharp on actions (4px), rounded on containers (8-16px)
    // • Animation: Snappy (100-200ms) with bounce/overshoot
    // 
    // Set to "warn" during transition. Change to "error" once violations fixed.
    // ════════════════════════════════════════════════════════════════════
    "no-restricted-syntax": [
      "warn",
      
      // ────────────────────────────────────────────────────────────────
      // PROHIBITED: Raw Tailwind Typography
      // ────────────────────────────────────────────────────────────────
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
        "selector": "Literal[value=/(?<![a-z-])leading-(tight|snug|normal|loose)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind line height. Use design system: leading-display, leading-heading, leading-body, leading-relaxed, leading-comfortable, leading-none"
      },
      {
        "selector": "Literal[value=/(?<![a-z-])tracking-(tighter|tight|normal|wide|wider|widest)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind letter spacing. Use design system: tracking-label, tracking-kicker, tracking-display"
      },
      
      // ────────────────────────────────────────────────────────────────
      // PROHIBITED: Raw Tailwind Colors (Default Palette)
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "Literal[value=/(?<![a-z-])(bg|text|border|ring|outline|fill|stroke|from|via|to|divide|placeholder|decoration|accent|caret|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|sky|blue|rose)-[0-9]+/]",
        "message": "❌ PROHIBITED: Raw Tailwind color. Use design system semantic colors: bg-surface-*, bg-ink-*, text-on-dark-*, text-on-light-*, primary, secondary, accent, success, warning, error, info"
      },
      
      // ────────────────────────────────────────────────────────────────
      // PROHIBITED: Arbitrary Values (Square Brackets)
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "Literal[value=/\\[#[0-9a-fA-F]{3,8}\\]/]",
        "message": "❌ PROHIBITED: Arbitrary hex color. Use design system color tokens."
      },
      {
        "selector": "Literal[value=/\\[rgb(a)?\\(/]",
        "message": "❌ PROHIBITED: Arbitrary RGB color. Use design system color tokens."
      },
      {
        "selector": "Literal[value=/\\[hsl(a)?\\(/]",
        "message": "❌ PROHIBITED: Arbitrary HSL color. Use design system color tokens."
      },
      {
        "selector": "Literal[value=/(?<![a-z-])(w|h|p|m|gap|space|top|right|bottom|left|inset)-\\[[0-9]+(px|rem|em|vh|vw|%)\\]/]",
        "message": "❌ PROHIBITED: Arbitrary spacing/sizing. Use design system: spacing-*, gap-xs/sm/md/lg/xl, p-button, p-card, p-modal"
      },
      {
        "selector": "Literal[value=/rounded-\\[[0-9]+(px|rem)\\]/]",
        "message": "❌ PROHIBITED: Arbitrary border radius. Use design system: rounded-button (4px), rounded-card (8px), rounded-modal (16px), rounded-badge (2px)"
      },
      {
        "selector": "Literal[value=/shadow-\\[/]",
        "message": "❌ PROHIBITED: Arbitrary shadow. Use design system hard offset shadows: shadow-xs, shadow-sm, shadow-md, shadow-lg, shadow-xl, shadow-primary, shadow-accent"
      },
      {
        "selector": "Literal[value=/z-\\[[0-9]+\\]/]",
        "message": "❌ PROHIBITED: Arbitrary z-index. Use design system: z-base, z-dropdown, z-sticky, z-fixed, z-modal, z-popover, z-tooltip"
      },
      
      // ────────────────────────────────────────────────────────────────
      // PROHIBITED: Raw Tailwind Border Radius (Use Design System)
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "Literal[value=/(?<![a-z-])rounded-(sm|md|lg|xl|2xl|3xl|full)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind border radius. Use design system: rounded-button (4px), rounded-card (8px), rounded-modal (16px), rounded-avatar (full), rounded-badge (2px)"
      },
      
      // ────────────────────────────────────────────────────────────────
      // NOTE: shadow-sm, shadow-md, shadow-lg, shadow-xl are now design system tokens
      // that resolve to hard offset shadows via CSS variables. No longer prohibited.
      // Only shadow-inner remains prohibited as it's not part of the design system.
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "Literal[value=/(?<![a-z-])shadow-inner(?![a-z-])/]",
        "message": "❌ PROHIBITED: Inner shadow not part of design system. Use hard offset shadows: shadow-xs, shadow-sm, shadow-md, shadow-lg, shadow-xl, shadow-primary, shadow-accent"
      },
      
      // ────────────────────────────────────────────────────────────────
      // PROHIBITED: Slow Animations (Use Snappy Durations)
      // Pop Art aesthetic requires snappy, energetic animations
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "Literal[value=/(?<![a-z-])duration-(300|500|700|1000)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Slow animation duration. Pop Art requires SNAPPY animations. Use: duration-instant (50ms), duration-fast (100ms), duration-base (150ms), duration-slow (250ms max)"
      },
      
      // ────────────────────────────────────────────────────────────────
      // PROHIBITED: Thin Borders on Interactive Elements
      // Bold aesthetic requires 2px+ borders on buttons, inputs, cards
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "Literal[value=/(?<![a-z-])border(?![a-z-])/]",
        "message": "⚠️ WARNING: Default border is 1px. For interactive elements (buttons, inputs, cards), use border-2, border-thick, or border-heavy for Bold Pop Art aesthetic."
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
    "packages/config-postcss/",
    // Style guide preview is exempt (it's documentation)
    "docs/design/STYLE-GUIDE-PREVIEW.jsx"
  ],
  overrides: [
    {
      // Design system UI components can use raw Tailwind internally
      // These are the source of truth for the design system
      files: ["packages/ui/src/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-syntax": "off"
      }
    },
    {
      // Config files are exempt
      files: ["*.config.{js,ts,mjs,cjs}", "tailwind.config.*"],
      rules: {
        "no-restricted-syntax": "off"
      }
    },
    {
      // Design documentation is exempt
      files: ["docs/**/*.{js,jsx,ts,tsx}"],
      rules: {
        "no-restricted-syntax": "off"
      }
    }
  ]
};
