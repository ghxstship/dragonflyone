import type { DesignTokens } from "./types.js";

export const generateCSSVariables = (
  tokens: DesignTokens,
  mode: "light" | "dark" = "light"
): string => {
  const colorMode = mode;

  return `
:root {
  /* BRAND COLORS */
  --color-brand-primary: ${tokens.colors.brand.primary};
  --color-brand-primary-hover: ${tokens.colors.brand.primaryHover};
  --color-brand-primary-active: ${tokens.colors.brand.primaryActive};
  --color-brand-primary-subtle: ${tokens.colors.brand.primarySubtle};
  --color-brand-secondary: ${tokens.colors.brand.secondary};
  --color-brand-accent: ${tokens.colors.brand.accent};

  /* SEMANTIC COLORS */
  --color-success: ${tokens.colors.semantic.success.base};
  --color-success-subtle: ${tokens.colors.semantic.success.subtle};
  --color-success-text: ${tokens.colors.semantic.success.text};
  --color-warning: ${tokens.colors.semantic.warning.base};
  --color-warning-subtle: ${tokens.colors.semantic.warning.subtle};
  --color-warning-text: ${tokens.colors.semantic.warning.text};
  --color-error: ${tokens.colors.semantic.error.base};
  --color-error-subtle: ${tokens.colors.semantic.error.subtle};
  --color-error-text: ${tokens.colors.semantic.error.text};
  --color-info: ${tokens.colors.semantic.info.base};
  --color-info-subtle: ${tokens.colors.semantic.info.subtle};
  --color-info-text: ${tokens.colors.semantic.info.text};

  /* NEUTRAL PALETTE */
  ${Object.entries(tokens.colors.neutral)
    .map(([key, value]) => `--color-neutral-${key}: ${value};`)
    .join("\n  ")}

  /* SURFACE COLORS */
  --color-surface-background: ${tokens.colors.surface.background[colorMode]};
  --color-surface-elevated: ${tokens.colors.surface.elevated[colorMode]};
  --color-surface-overlay: ${tokens.colors.surface.overlay[colorMode]};
  --color-surface-sidebar: ${tokens.colors.surface.sidebar[colorMode]};
  --color-surface-card: ${tokens.colors.surface.card[colorMode]};
  --color-surface-input: ${tokens.colors.surface.input[colorMode]};

  /* TEXT COLORS */
  --color-text-primary: ${tokens.colors.text.primary[colorMode]};
  --color-text-secondary: ${tokens.colors.text.secondary[colorMode]};
  --color-text-tertiary: ${tokens.colors.text.tertiary[colorMode]};
  --color-text-disabled: ${tokens.colors.text.disabled[colorMode]};
  --color-text-inverse: ${tokens.colors.text.inverse[colorMode]};
  --color-text-link: ${tokens.colors.text.link[colorMode]};

  /* BORDER COLORS */
  --color-border-default: ${tokens.colors.border.default[colorMode]};
  --color-border-subtle: ${tokens.colors.border.subtle[colorMode]};
  --color-border-strong: ${tokens.colors.border.strong[colorMode]};
  --color-border-focus: ${tokens.colors.border.focus[colorMode]};

  /* STATUS / PRIORITY COLORS */
  --color-status-todo: ${tokens.colors.status.todo};
  --color-status-in-progress: ${tokens.colors.status.inProgress};
  --color-status-review: ${tokens.colors.status.review};
  --color-status-blocked: ${tokens.colors.status.blocked};
  --color-status-complete: ${tokens.colors.status.complete};
  --color-status-archived: ${tokens.colors.status.archived};
  --color-priority-urgent: ${tokens.colors.priority.urgent};
  --color-priority-high: ${tokens.colors.priority.high};
  --color-priority-medium: ${tokens.colors.priority.medium};
  --color-priority-low: ${tokens.colors.priority.low};
  --color-priority-none: ${tokens.colors.priority.none};

  /* TYPOGRAPHY */
  --font-family-primary: ${tokens.typography.fontFamily.primary};
  --font-family-secondary: ${tokens.typography.fontFamily.secondary};
  --font-family-mono: ${tokens.typography.fontFamily.mono};
  ${Object.entries(tokens.typography.fontSize)
    .map(([key, value]) => `--font-size-${key}: ${value};`)
    .join("\n  ")}
  ${Object.entries(tokens.typography.fontWeight)
    .map(([key, value]) => `--font-weight-${key}: ${value};`)
    .join("\n  ")}
  ${Object.entries(tokens.typography.lineHeight)
    .map(([key, value]) => `--line-height-${key}: ${value};`)
    .join("\n  ")}
  ${Object.entries(tokens.typography.letterSpacing)
    .map(([key, value]) => `--letter-spacing-${key}: ${value};`)
    .join("\n  ")}

  /* SPACING */
  ${Object.entries(tokens.spacing)
    .map(([key, value]) => `--spacing-${key}: ${value};`)
    .join("\n  ")}

  /* SHADOWS */
  ${Object.entries(tokens.shadows)
    .map(([key, value]) => `--shadow-${key}: ${value};`)
    .join("\n  ")}

  /* RADIUS */
  ${Object.entries(tokens.radius)
    .map(([key, value]) => `--radius-${key}: ${value};`)
    .join("\n  ")}

  /* MOTION */
  ${Object.entries(tokens.motion.duration)
    .map(([key, value]) => `--duration-${key}: ${value};`)
    .join("\n  ")}
  ${Object.entries(tokens.motion.easing)
    .map(([key, value]) => `--easing-${key}: ${value};`)
    .join("\n  ")}

  /* Z-INDEX */
  ${Object.entries(tokens.zIndex)
    .map(([key, value]) => `--z-${key}: ${value};`)
    .join("\n  ")}

  /* LAYOUT */
  --sidebar-width-collapsed: ${tokens.layout.sidebar.collapsed};
  --sidebar-width-expanded: ${tokens.layout.sidebar.expanded};
  --sidebar-max-width: ${tokens.layout.sidebar.maxWidth};
  --header-height-sm: ${tokens.layout.header.sm};
  --header-height-md: ${tokens.layout.header.md};
  --header-height-lg: ${tokens.layout.header.lg};
}
`;
};
