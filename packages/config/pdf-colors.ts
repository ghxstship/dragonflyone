/**
 * PDF Color Constants
 * 
 * Centralized hex color values for PDF generation.
 * PDFs require inline CSS and cannot use CSS variables,
 * so we maintain these as constants that map to our design tokens.
 * 
 * These values should match the corresponding CSS variables in globals.css
 */

// Brand Colors
export const PDF_COLORS = {
  // Primary brand colors
  brandPink: '#FF006E',      // --brand-pink: 333 100% 43%
  brandCyan: '#00F5D4',      // --brand-cyan (teal variant)
  brandYellow: '#FEE440',    // --brand-yellow
  brandPurple: '#9B5DE5',    // --brand-purple
  brandBlue: '#00BBF9',      // --brand-blue
  
  // Text colors
  textPrimary: '#1a1a1a',    // --color-text-primary (dark mode)
  textSecondary: '#666666',  // --color-text-secondary
  textMuted: '#999999',      // --color-text-muted
  
  // Surface colors
  surfacePrimary: '#ffffff', // --color-surface-primary (light)
  surfaceElevated: '#f5f5f5', // --color-surface-elevated
  
  // Border colors
  borderDefault: '#e5e5e5',  // --color-border-default
  borderInput: '#cccccc',    // --color-border-input
  borderStrong: '#1a1a1a',   // --color-border-strong
  
  // Semantic colors
  success: '#22c55e',        // --success
  warning: '#f59e0b',        // --warning
  error: '#ef4444',          // --error
  info: '#3b82f6',           // --info
  
  // Credential colors (for experience generator)
  credentialAllAccess: '#FF006E',
  credentialProduction: '#9B5DE5',
  credentialTechnical: '#00F5D4',
  credentialPerformer: '#FEE440',
  credentialOperations: '#00BBF9',
  credentialGuestServices: '#F15BB5',
  credentialVendor: '#9B9B9B',
  credentialVIP: '#FFD700',
  credentialMedia: '#FF6B6B',
  credentialGeneral: '#FFFFFF',
} as const;

// Experience generator default color palette
export const DEFAULT_COLOR_PALETTE = [
  PDF_COLORS.textPrimary,    // #1A1A2E (dark)
  PDF_COLORS.brandPink,      // #FF006E
  PDF_COLORS.brandCyan,      // #00F5D4
  PDF_COLORS.brandYellow,    // #FEE440
  PDF_COLORS.brandPurple,    // #9B5DE5
];

// Credential type color mapping
export const CREDENTIAL_COLORS: Record<string, string> = {
  'AA': PDF_COLORS.credentialAllAccess,
  'PROD': PDF_COLORS.credentialProduction,
  'TECH': PDF_COLORS.credentialTechnical,
  'PERF': PDF_COLORS.credentialPerformer,
  'OPS': PDF_COLORS.credentialOperations,
  'GS': PDF_COLORS.credentialGuestServices,
  'VND': PDF_COLORS.credentialVendor,
  'VIP': PDF_COLORS.credentialVIP,
  'MED': PDF_COLORS.credentialMedia,
  'GEN': PDF_COLORS.credentialGeneral,
};
