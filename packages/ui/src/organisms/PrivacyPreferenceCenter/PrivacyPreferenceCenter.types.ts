import type { HTMLAttributes, ReactNode } from "react";

export interface ConsentCategory {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  required?: boolean;
  enabled: boolean;
}

export interface PrivacyPreferenceCenterProps extends HTMLAttributes<HTMLDivElement> {
  /** Current consent preferences */
  consents: ConsentCategory[];
  /** Callback when consent is toggled */
  onConsentChange: (id: string, enabled: boolean) => void;
  /** Callback when all changes are saved */
  onSave: () => Promise<void>;
  /** Callback for data export request */
  onExportData?: () => Promise<void>;
  /** Callback for account deletion request */
  onDeleteAccount?: () => void;
  /** Callback to view consent history */
  onViewHistory?: () => void;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Whether there are unsaved changes */
  hasChanges?: boolean;
  /** Last updated timestamp */
  lastUpdated?: string;
  /** User's region for compliance display */
  region?: "gdpr" | "ccpa" | "lgpd" | "pipeda" | "default";
}
