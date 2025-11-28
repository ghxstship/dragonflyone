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
        // ═══════════════════════════════════════════════════════════════
        // TYPOGRAPHY TOKENS (PRESERVED)
        // ═══════════════════════════════════════════════════════════════
        "text-display-.*", "text-h[1-6]-.*", "text-body-.*", "text-mono-.*", "text-micro.*",
        "font-display", "font-heading", "font-body", "font-mono", "font-code",
        "font-weight-.*",
        "leading-display", "leading-heading", "leading-title", "leading-subtitle", 
        "leading-body", "leading-relaxed", "leading-comfortable", "leading-none",
        "tracking-label", "tracking-kicker", "tracking-display",
        
        // ═══════════════════════════════════════════════════════════════
        // COLOR TOKENS (PRESERVED)
        // ═══════════════════════════════════════════════════════════════
        // Brand colors
        "bg-primary.*", "text-primary.*", "border-primary.*",
        "bg-secondary.*", "text-secondary.*", "border-secondary.*",
        "bg-accent.*", "text-accent.*", "border-accent.*",
        "bg-destructive.*", "text-destructive.*", "border-destructive.*",
        // Status colors
        "bg-success.*", "text-success.*", "border-success.*",
        "bg-warning.*", "text-warning.*", "border-warning.*",
        "bg-error.*", "text-error.*", "border-error.*",
        "bg-info.*", "text-info.*", "border-info.*",
        // Surface/semantic colors
        "bg-surface-.*", "bg-ink-.*",
        "text-on-dark-.*", "text-on-light-.*", "text-on-mid-.*",
        "text-tertiary", "text-muted", "text-inverse", "text-link.*",
        "border-muted", "border-focus", "border-inverse",
        // Neutral scale
        "bg-grey-.*", "text-grey-.*", "border-grey-.*",
        "bg-ink-.*", "text-ink-.*", "border-ink-.*",
        "bg-black", "bg-white", "text-black", "text-white", "border-black", "border-white",
        // Accent palette (categories/tags)
        "bg-purple.*", "bg-pink.*", "bg-cyan.*", "bg-teal.*", "bg-violet.*", "bg-indigo.*",
        "text-purple.*", "text-pink.*", "text-cyan.*", "text-teal.*", "text-violet.*", "text-indigo.*",
        "border-purple.*", "border-pink.*", "border-cyan.*", "border-teal.*", "border-violet.*", "border-indigo.*",
        // Foreground/background semantic
        "bg-foreground.*", "text-foreground.*", "border-foreground.*",
        "bg-background.*", "text-background.*", "border-background.*",
        "bg-card.*", "text-card.*", "border-card.*",
        "bg-popover.*", "text-popover.*", "border-popover.*",
        "bg-muted.*", "text-muted.*", "border-muted.*",
        "ring-.*",
        
        // ═══════════════════════════════════════════════════════════════
        // SPACING TOKENS (REBUILT)
        // ═══════════════════════════════════════════════════════════════
        "spacing-.*",
        "gap-xs", "gap-sm", "gap-md", "gap-lg", "gap-xl", "gap-2xl", "gap-3xl",
        "p-button.*", "px-button.*", "py-button.*",
        "p-input.*", "px-input.*", "py-input.*",
        "p-card.*", "p-modal.*", "p-section.*", "p-page.*",
        
        // ═══════════════════════════════════════════════════════════════
        // SIZING TOKENS
        // ═══════════════════════════════════════════════════════════════
        "w-icon-.*", "h-icon-.*", "w-avatar-.*", "h-avatar-.*", 
        "h-input.*", "h-button.*",
        "min-w-card-.*", "min-w-sidebar", "min-w-select",
        "max-w-container-.*", "max-w-prose", "max-w-content",
        "min-h-card", "min-h-calendar-cell", "min-h-panel-.*", "min-h-chat", "min-h-map",
        "max-h-dropdown", "max-h-modal", "max-h-panel-.*", "max-h-chat",
        
        // ═══════════════════════════════════════════════════════════════
        // BORDER RADIUS TOKENS (REBUILT - SHARP TO ROUNDED)
        // ═══════════════════════════════════════════════════════════════
        "rounded-none",           // 0px - Sharp
        "rounded-radius-.*",      // Design system scale
        "rounded-button",         // 4px - Sharp, bold action
        "rounded-input",          // 4px - Matches buttons
        "rounded-card",           // 8px - Panel aesthetic
        "rounded-modal",          // 16px - Contained, prominent
        "rounded-badge",          // 2px - Label-like, sharp
        "rounded-avatar",         // 9999px - Always circular
        "rounded-tooltip",        // 4px - Speech bubble
        "rounded-tag",            // Design system tag
        
        // ═══════════════════════════════════════════════════════════════
        // BORDER WIDTH TOKENS (REBUILT - BOLD DEFAULT)
        // ═══════════════════════════════════════════════════════════════
        "border-none",            // 0px
        "border-thin",            // 1px - Subtle dividers only
        "border-DEFAULT",         // 2px - BOLD DEFAULT
        "border-thick",           // 3px - Emphasis
        "border-heavy",           // 4px - Maximum impact
        "border-2", "border-3", "border-4",  // Explicit widths
        
        // ═══════════════════════════════════════════════════════════════
        // SHADOW TOKENS (REBUILT - HARD OFFSET COMIC STYLE)
        // ═══════════════════════════════════════════════════════════════
        "shadow-none",
        "shadow-xs",              // 2px 2px 0 - Subtle lift
        "shadow-sm",              // 3px 3px 0 - Low elevation
        "shadow-DEFAULT",         // 4px 4px 0 - Default cards
        "shadow-md",              // 4px 4px 0 - Medium
        "shadow-lg",              // 6px 6px 0 - Hover state
        "shadow-xl",              // 8px 8px 0 - Modals
        "shadow-2xl",             // 12px 12px 0 - Maximum
        "shadow-primary",         // 4px 4px 0 primary - Accent
        "shadow-accent",          // 4px 4px 0 accent - Pop art
        "shadow-hover",           // 6px 6px 0 - Elevated
        "shadow-active",          // 1px 1px 0 - Pressed
        "shadow-focus",           // 0 0 0 3px ring
        "shadow-inset",           // Inset shadow
        "shadow-outline.*",       // Outline shadows
        "shadow-hard.*",          // Hard offset shadows
        
        // ═══════════════════════════════════════════════════════════════
        // ANIMATION TOKENS (REBUILT - SNAPPY WITH CHARACTER)
        // ═══════════════════════════════════════════════════════════════
        // Durations
        "duration-instant",       // 50ms
        "duration-fast",          // 100ms
        "duration-DEFAULT",       // 150ms
        "duration-normal",        // 150ms
        "duration-base",          // 150ms
        "duration-slow",          // 250ms
        "duration-slower",        // 400ms
        // Easings
        "ease-DEFAULT",           // Smooth
        "ease-linear",
        "ease-in", "ease-out", "ease-in-out",
        "ease-bounce",            // Overshoot
        "ease-snap",              // Dramatic
        "ease-spring",            // Natural
        // Keyframe animations
        "animate-pop-in",         // Scale + translate entrance
        "animate-slide-up-bounce",// Slide with bounce
        "animate-shake",          // Error shake
        "animate-pulse-shadow",   // Pulsing shadow
        "animate-comic-appear",   // Comic book entrance
        "animate-hard-fade",      // Hard fade
        "animate-scanline",       // Scanline effect
        // Stagger delays
        "stagger-1", "stagger-2", "stagger-3", "stagger-4",
        "stagger-5", "stagger-6", "stagger-7", "stagger-8",
        
        // ═══════════════════════════════════════════════════════════════
        // BACKGROUND PATTERNS (POP ART)
        // ═══════════════════════════════════════════════════════════════
        "bg-halftone.*",          // Halftone dots
        "bg-stripes.*",           // Diagonal stripes
        "bg-grid.*",              // Grid pattern
        "bg-benday.*",            // Ben-Day dots
        "bg-crosshatch.*",        // Cross hatch
        "bg-speed-lines.*",       // Speed lines
        "bg-action-lines.*",      // Radial burst
        
        // ═══════════════════════════════════════════════════════════════
        // Z-INDEX TOKENS
        // ═══════════════════════════════════════════════════════════════
        "z-base", "z-dropdown", "z-sticky", "z-fixed", 
        "z-modal.*", "z-popover", "z-tooltip",
        
        // ═══════════════════════════════════════════════════════════════
        // OPACITY TOKENS
        // ═══════════════════════════════════════════════════════════════
        "opacity-overlay.*", "opacity-disabled", "opacity-muted", "opacity-hover",
        
        // ═══════════════════════════════════════════════════════════════
        // INTERACTIVE STATE TOKENS
        // ═══════════════════════════════════════════════════════════════
        "hover-surface", "active-surface", "focus-ring",
        "ring-focus.*", "ring-error", "ring-success",
        
        // ═══════════════════════════════════════════════════════════════
        // ASPECT RATIOS
        // ═══════════════════════════════════════════════════════════════
        "aspect-square", "aspect-video.*", "aspect-photo.*", 
        "aspect-wide", "aspect-ultrawide", "aspect-golden",
        
        // ═══════════════════════════════════════════════════════════════
        // TRANSFORM UTILITIES (FOR HOVER/ACTIVE STATES)
        // ═══════════════════════════════════════════════════════════════
        "translate-lift",         // -2px, -2px on hover
        "translate-press",        // 1px, 1px on active
        "translate-elevate"       // -1px, -1px subtle
      ]
    }
  },
  rules: {
    // ════════════════════════════════════════════════════════════════════
    // DESIGN SYSTEM ENFORCEMENT - ZERO TOLERANCE
    // ════════════════════════════════════════════════════════════════════
    
    // Tailwind plugin rules
    "tailwindcss/classnames-order": "warn",
    "tailwindcss/no-custom-classname": ["warn", {
      // Allow design system classes that may not be in default Tailwind
      "whitelist": [
        // Typography
        "text-display-.*", "text-h[1-6]-.*", "text-body-.*", "text-mono-.*",
        "font-display", "font-heading", "font-body", "font-mono", "font-code",
        // Colors
        "bg-surface-.*", "bg-ink-.*", "bg-grey-.*",
        "text-on-dark-.*", "text-on-light-.*", "text-on-mid-.*",
        "text-primary", "text-secondary", "text-tertiary", "text-muted",
        "border-primary", "border-secondary", "border-muted",
        // Spacing
        "spacing-.*", "gap-xs", "gap-sm", "gap-md", "gap-lg", "gap-xl",
        // Border radius (design system)
        "rounded-radius-.*", "rounded-button", "rounded-input", "rounded-card",
        "rounded-modal", "rounded-badge", "rounded-avatar", "rounded-tooltip",
        // Shadows (hard offset)
        "shadow-outline.*", "shadow-hard.*", "shadow-primary", "shadow-accent",
        "shadow-hover", "shadow-active", "shadow-focus",
        // Border widths
        "border-thin", "border-thick", "border-heavy",
        // Z-index
        "z-base", "z-dropdown", "z-sticky", "z-fixed", "z-modal.*", "z-popover", "z-tooltip",
        // Durations
        "duration-instant", "duration-fast", "duration-base", "duration-normal", "duration-slow", "duration-slower",
        // Easings
        "ease-bounce", "ease-snap", "ease-spring",
        // Animations
        "animate-pop-in", "animate-slide-up-bounce", "animate-shake",
        "animate-pulse-shadow", "animate-comic-appear", "animate-hard-fade", "animate-scanline",
        // Stagger
        "stagger-[1-8]",
        // Patterns
        "bg-halftone.*", "bg-stripes.*", "bg-grid.*", "bg-benday.*",
        "bg-crosshatch.*", "bg-speed-lines.*", "bg-action-lines.*",
        // Transforms
        "translate-lift", "translate-press", "translate-elevate"
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
        "selector": "Literal[value=/(?<![a-z-])leading-(none|tight|snug|normal|relaxed|loose)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Raw Tailwind line height. Use design system: leading-display, leading-heading, leading-body, leading-relaxed, leading-comfortable"
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
      // PROHIBITED: Soft/Blur Shadows (Use Hard Offset Only)
      // Pop Art aesthetic requires hard offset shadows, not soft blurs
      // ────────────────────────────────────────────────────────────────
      {
        "selector": "Literal[value=/(?<![a-z-])shadow-(sm|md|lg|xl|2xl|inner)(?![a-z-])/]",
        "message": "❌ PROHIBITED: Soft Tailwind shadow. Pop Art requires HARD OFFSET shadows. Use: shadow-xs (2px), shadow-sm (3px), shadow-md (4px), shadow-lg (6px), shadow-xl (8px), shadow-primary, shadow-accent"
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
        "no-restricted-syntax": "off",
        "tailwindcss/no-custom-classname": "off"
      }
    },
    {
      // Design documentation is exempt
      files: ["docs/**/*.{js,jsx,ts,tsx}"],
      rules: {
        "no-restricted-syntax": "off",
        "tailwindcss/no-custom-classname": "off"
      }
    }
  ]
};
