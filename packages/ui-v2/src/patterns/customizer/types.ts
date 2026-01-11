/**
 * White-Label Customizer Types
 * Types for the theme customization interface
 */

import type { ExperienceThemeConfig } from '../../whitelabel/experience-theme';

// Customizer state
export interface CustomizerState {
  config: ExperienceThemeConfig;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  activeTab: 'colors' | 'typography' | 'logo' | 'navigation' | 'domain';
}

// Color preset
export interface ColorPreset {
  id: string;
  name: string;
  primary: string;
  secondary?: string;
  accent?: string;
  preview?: string; // Image preview URL
}

// Font option
export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'serif' | 'sans-serif' | 'display' | 'monospace';
  preview: string; // Font preview text
  weights?: number[];
  googleFont?: boolean;
}

// Logo upload state
export interface LogoUpload {
  file?: File;
  preview?: string;
  url?: string;
  uploading: boolean;
  error?: string;
}

// Navigation link editor
export interface NavLinkEditor {
  id?: string;
  label: string;
  href: string;
  order: number;
  isEditing: boolean;
}

// Template preset
export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  category: 'travel' | 'events' | 'sports' | 'education' | 'general';
  preview: string; // Image preview URL
  config: Partial<ExperienceThemeConfig>;
  isPremium?: boolean;
}

// Customizer actions
export type CustomizerAction =
  | { type: 'SET_PRIMARY_COLOR'; color: string }
  | { type: 'SET_SECONDARY_COLOR'; color: string }
  | { type: 'SET_ACCENT_COLOR'; color: string }
  | { type: 'SET_DISPLAY_FONT'; font: string }
  | { type: 'SET_BODY_FONT'; font: string }
  | { type: 'SET_LOGO'; url: string }
  | { type: 'ADD_NAV_LINK'; link: NavLinkEditor }
  | { type: 'UPDATE_NAV_LINK'; id: string; link: Partial<NavLinkEditor> }
  | { type: 'REMOVE_NAV_LINK'; id: string }
  | { type: 'REORDER_NAV_LINKS'; links: NavLinkEditor[] }
  | { type: 'SET_CUSTOM_DOMAIN'; domain: string }
  | { type: 'APPLY_TEMPLATE'; config: Partial<ExperienceThemeConfig> }
  | { type: 'RESET_TO_DEFAULT' }
  | { type: 'SET_PREVIEW_MODE'; mode: 'desktop' | 'tablet' | 'mobile' }
  | { type: 'SET_ACTIVE_TAB'; tab: CustomizerState['activeTab'] }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; config: ExperienceThemeConfig }
  | { type: 'SAVE_ERROR'; error: string };

// Custom domain verification
export interface DomainVerification {
  domain: string;
  verified: boolean;
  verificationToken?: string;
  dnsRecords?: Array<{
    type: 'A' | 'CNAME' | 'TXT';
    name: string;
    value: string;
  }>;
  sslStatus?: 'pending' | 'active' | 'failed';
}
