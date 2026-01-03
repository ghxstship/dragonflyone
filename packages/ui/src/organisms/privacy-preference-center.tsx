"use client";

import { forwardRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { Button } from "../atoms/button.js";
import { Body, H2, H3, Label } from "../atoms/typography.js";
import { Stack } from "../foundations/layout.js";
import { Switch } from "../atoms/switch.js";
import { Card, CardBody } from "../molecules/card.js";
import { 
  Shield, 
  Mail, 
  Bell, 
  BarChart3, 
  Users, 
  Cookie,
  Download,
  Trash2,
  History,
  ChevronRight,
  Check,
  Loader2
} from "lucide-react";

export interface ConsentCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
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

const regionLabels: Record<string, { name: string; rights: string[] }> = {
  gdpr: {
    name: "European Union (GDPR)",
    rights: [
      "Right to access your data",
      "Right to rectification",
      "Right to erasure ('right to be forgotten')",
      "Right to data portability",
      "Right to object to processing",
      "Right to withdraw consent",
    ],
  },
  ccpa: {
    name: "California (CCPA/CPRA)",
    rights: [
      "Right to know what data is collected",
      "Right to delete your data",
      "Right to opt-out of sale/sharing",
      "Right to non-discrimination",
      "Right to correct inaccurate data",
      "Right to limit use of sensitive data",
    ],
  },
  lgpd: {
    name: "Brazil (LGPD)",
    rights: [
      "Right to confirmation of processing",
      "Right to access your data",
      "Right to correction of incomplete data",
      "Right to anonymization or deletion",
      "Right to data portability",
      "Right to revoke consent",
    ],
  },
  pipeda: {
    name: "Canada (PIPEDA)",
    rights: [
      "Right to access your data",
      "Right to challenge accuracy",
      "Right to know how data is used",
      "Right to withdraw consent",
      "Right to complain to Privacy Commissioner",
    ],
  },
  default: {
    name: "Your Privacy Rights",
    rights: [
      "Right to access your data",
      "Right to correct your data",
      "Right to delete your data",
      "Right to export your data",
      "Right to withdraw consent",
    ],
  },
};

/**
 * PrivacyPreferenceCenter - Comprehensive privacy management UI
 * 
 * Features:
 * - Granular consent toggles by category
 * - Region-aware rights display
 * - Data export and deletion actions
 * - Consent history access
 * - Bold Contemporary Pop Art Adventure design
 */
export const PrivacyPreferenceCenter = forwardRef<HTMLDivElement, PrivacyPreferenceCenterProps>(
  function PrivacyPreferenceCenter({
    consents,
    onConsentChange,
    onSave,
    onExportData,
    onDeleteAccount,
    onViewHistory,
    isSaving = false,
    hasChanges = false,
    lastUpdated,
    region = "default",
    className,
    ...props
  }, ref) {
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    const regionInfo = regionLabels[region] || regionLabels.default;

    const handleExport = async () => {
      if (!onExportData) return;
      setIsExporting(true);
      setExportSuccess(false);
      try {
        await onExportData();
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      } finally {
        setIsExporting(false);
      }
    };

    return (
      <div ref={ref} className={className} {...props}>
        <Stack gap={8}>
          {/* Header */}
          <Stack gap={4}>
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center border-2 border-primary-600 bg-primary-100 rounded-card">
                <Shield className="size-6 text-primary-600" />
              </div>
              <div>
                <H2 className="text-on-light-primary">Privacy Preference Center</H2>
                <Body size="sm" className="text-on-dark-disabled">
                  Manage how your data is collected and used
                </Body>
              </div>
            </div>
            {lastUpdated && (
              <Body size="xs" className="text-on-dark-disabled">
                Last updated: {lastUpdated}
              </Body>
            )}
          </Stack>

          {/* Your Rights Section */}
          <Card className="border-2 border-primary-200 bg-primary-50">
            <CardBody>
              <Stack gap={4}>
                <H3 className="text-on-light-primary">{regionInfo.name}</H3>
                <Body size="sm" className="text-on-dark-disabled">
                  Under applicable privacy laws, you have the following rights:
                </Body>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {regionInfo.rights.map((right, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="size-4 text-primary-600 mt-0.5 shrink-0" />
                      <Body size="sm" className="text-on-dark-disabled">{right}</Body>
                    </li>
                  ))}
                </ul>
              </Stack>
            </CardBody>
          </Card>

          {/* Consent Categories */}
          <Stack gap={4}>
            <H3 className="text-on-light-primary">Data Collection Preferences</H3>
            <Body size="sm" className="text-on-dark-disabled">
              Choose which types of data processing you consent to. Required items cannot be disabled 
              as they are necessary for the service to function.
            </Body>

            <Stack gap={3}>
              {consents.map((consent) => (
                <Card key={consent.id} className="border-2 border-border">
                  <CardBody>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center border-2 border-border bg-muted rounded-card shrink-0">
                          {consent.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Label size="sm" className="text-on-light-primary">{consent.name}</Label>
                            {consent.required && (
                              <span className="px-2 py-0.5 bg-muted text-on-dark-disabled rounded-badge text-xs">
                                Required
                              </span>
                            )}
                          </div>
                          <Body size="sm" className="text-on-dark-disabled mt-1">
                            {consent.description}
                          </Body>
                        </div>
                      </div>
                      <Switch
                        checked={consent.enabled}
                        onChange={(e) => onConsentChange(consent.id, e.target.checked)}
                        disabled={consent.required}
                        aria-label={`Toggle ${consent.name}`}
                      />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </Stack>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Body size="sm" className="text-on-dark-disabled">
                {hasChanges ? "You have unsaved changes" : "All changes saved"}
              </Body>
              <Button
                variant="solid"
                size="md"
                onClick={onSave}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </div>
          </Stack>

          {/* Data Actions */}
          <Stack gap={4}>
            <H3 className="text-on-light-primary">Your Data</H3>
            <Body size="sm" className="text-on-dark-disabled">
              Exercise your data rights with the actions below.
            </Body>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Export Data */}
              {onExportData && (
                <Card className="border-2 border-border hover:border-primary-300 transition-colors cursor-pointer">
                  <CardBody>
                    <button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center border-2 border-primary-200 bg-primary-50 rounded-card">
                            {exportSuccess ? (
                              <Check className="size-5 text-success-600" />
                            ) : isExporting ? (
                              <Loader2 className="size-5 text-primary-600 animate-spin" />
                            ) : (
                              <Download className="size-5 text-primary-600" />
                            )}
                          </div>
                          <div>
                            <Label size="sm" className="text-on-light-primary">Export My Data</Label>
                            <Body size="xs" className="text-on-dark-disabled">
                              Download a copy of your data
                            </Body>
                          </div>
                        </div>
                        <ChevronRight className="size-5 text-on-dark-muted" />
                      </div>
                    </button>
                  </CardBody>
                </Card>
              )}

              {/* View History */}
              {onViewHistory && (
                <Card className="border-2 border-border hover:border-primary-300 transition-colors cursor-pointer">
                  <CardBody>
                    <button onClick={onViewHistory} className="w-full text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center border-2 border-border bg-muted rounded-card">
                            <History className="size-5 text-on-dark-disabled" />
                          </div>
                          <div>
                            <Label size="sm" className="text-on-light-primary">Consent History</Label>
                            <Body size="xs" className="text-on-dark-disabled">
                              View your consent changes
                            </Body>
                          </div>
                        </div>
                        <ChevronRight className="size-5 text-on-dark-muted" />
                      </div>
                    </button>
                  </CardBody>
                </Card>
              )}

              {/* Delete Account */}
              {onDeleteAccount && (
                <Card className="border-2 border-error-200 hover:border-error-300 transition-colors cursor-pointer sm:col-span-2">
                  <CardBody>
                    <button onClick={onDeleteAccount} className="w-full text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center border-2 border-error-200 bg-error-50 rounded-card">
                            <Trash2 className="size-5 text-error-600" />
                          </div>
                          <div>
                            <Label size="sm" className="text-error-700">Delete My Account</Label>
                            <Body size="xs" className="text-on-dark-disabled">
                              Permanently delete your account and all data
                            </Body>
                          </div>
                        </div>
                        <ChevronRight className="size-5 text-on-dark-muted" />
                      </div>
                    </button>
                  </CardBody>
                </Card>
              )}
            </div>
          </Stack>

          {/* Contact Information */}
          <Card className="border-2 border-border bg-muted/50">
            <CardBody>
              <Stack gap={3}>
                <H3 className="text-on-light-primary">Questions About Your Privacy?</H3>
                <Body size="sm" className="text-on-dark-disabled">
                  If you have questions about how we handle your data or want to exercise your rights, 
                  please contact our Data Protection Officer:
                </Body>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <Label size="xs" className="text-on-dark-disabled">EMAIL</Label>
                    <Body size="sm" className="text-primary-600">
                      <a href="mailto:dpo@ghxstship.com" className="underline">dpo@ghxstship.com</a>
                    </Body>
                  </div>
                  <div>
                    <Label size="xs" className="text-on-dark-disabled">PRIVACY TEAM</Label>
                    <Body size="sm" className="text-primary-600">
                      <a href="mailto:privacy@ghxstship.com" className="underline">privacy@ghxstship.com</a>
                    </Body>
                  </div>
                </div>
              </Stack>
            </CardBody>
          </Card>
        </Stack>
      </div>
    );
  }
);

/**
 * Default consent categories for the privacy preference center
 */
export const defaultConsentCategories: ConsentCategory[] = [
  {
    id: "essential",
    name: "Essential Services",
    description: "Required for the platform to function. Includes authentication, security, and core features.",
    icon: <Shield className="size-5 text-on-dark-disabled" />,
    required: true,
    enabled: true,
  },
  {
    id: "marketing_email",
    name: "Email Marketing",
    description: "Receive promotional emails about events, offers, and platform updates.",
    icon: <Mail className="size-5 text-on-dark-disabled" />,
    required: false,
    enabled: false,
  },
  {
    id: "marketing_push",
    name: "Push Notifications",
    description: "Receive push notifications about events and updates on your devices.",
    icon: <Bell className="size-5 text-on-dark-disabled" />,
    required: false,
    enabled: false,
  },
  {
    id: "analytics",
    name: "Analytics & Performance",
    description: "Help us improve by allowing anonymous usage analytics and performance monitoring.",
    icon: <BarChart3 className="size-5 text-on-dark-disabled" />,
    required: false,
    enabled: false,
  },
  {
    id: "personalization",
    name: "Personalization",
    description: "Allow us to personalize your experience based on your preferences and activity.",
    icon: <Users className="size-5 text-on-dark-disabled" />,
    required: false,
    enabled: false,
  },
  {
    id: "cookies",
    name: "Non-Essential Cookies",
    description: "Allow third-party cookies for advertising and social media features.",
    icon: <Cookie className="size-5 text-on-dark-disabled" />,
    required: false,
    enabled: false,
  },
];

export default PrivacyPreferenceCenter;
