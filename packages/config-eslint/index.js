/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  GHXSTSHIP SHARED ESLINT CONFIG                                               ║
 * ║  Bold Contemporary Pop Art Adventure Design System                            ║
 * ╠═══════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                               ║
 * ║  This is the shared base config. The root .eslintrc.js extends this           ║
 * ║  with full design system enforcement rules.                                   ║
 * ║                                                                               ║
 * ║  AESTHETIC PILLARS:                                                           ║
 * ║  • BOLD: Thick borders (2-4px), heavy font weights                            ║
 * ║  • CONTEMPORARY: Sharp corners on actions, rounded on containers              ║
 * ║  • POP ART: Hard offset shadows, halftone patterns                            ║
 * ║  • ADVENTURE: Bounce animations, dynamic transforms                           ║
 * ║                                                                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:tailwindcss/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'tailwindcss'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  settings: {
    tailwindcss: {
      callees: ['cn', 'clsx', 'cva', 'twMerge'],
      whitelist: [
        // Design system tokens - see root .eslintrc.js for full list
        'text-display-.*', 'text-h[1-6]-.*', 'text-body-.*', 'text-mono-.*',
        'font-display', 'font-heading', 'font-body', 'font-mono', 'font-code',
        'bg-surface-.*', 'bg-ink-.*', 'bg-primary.*', 'bg-secondary.*', 'bg-accent.*',
        'text-primary.*', 'text-secondary.*', 'text-muted.*',
        'border-primary.*', 'border-secondary.*', 'border-muted.*',
        'rounded-button', 'rounded-input', 'rounded-card', 'rounded-modal', 'rounded-badge', 'rounded-avatar',
        'shadow-xs', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-primary', 'shadow-accent',
        'border-thin', 'border-thick', 'border-heavy',
        'duration-instant', 'duration-fast', 'duration-base', 'duration-slow',
        'ease-bounce', 'ease-snap', 'ease-spring',
        'animate-pop-in', 'animate-slide-up-bounce', 'animate-shake', 'animate-comic-appear',
        'bg-halftone.*', 'bg-stripes.*', 'bg-grid.*', 'bg-benday.*'
      ]
    }
  },
  rules: {
    'react/jsx-key': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'tailwindcss/no-custom-classname': 'warn',
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-contradicting-classname': 'error'
  }
};
