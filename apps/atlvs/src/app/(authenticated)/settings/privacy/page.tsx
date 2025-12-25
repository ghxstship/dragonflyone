"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Layout provided by route group
import {
  Alert,
  Body,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  EmptyState,
  H2,
  H3,
  Label,
  Spinner,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';
import { 
  Shield, 
  Download, 
  Trash2, 
  Cookie, 
  Mail, 
  Bell, 
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface ConsentRecord {
  consent_type: string;
  is_granted: boolean;
  granted_at: string | null;
  revoked_at: string | null;
  source: string;
}

interface DataSubjectRequest {
  id: string;
  request_type: string;
  status: string;
  created_at: string;
  deadline_at: string;
}

const CONSENT_TYPES = [
  {
    key: "marketing_email",
    label: "Marketing Emails",
    description: "Receive promotional emails about events, offers, and updates",
    icon: Mail,
    category: "marketing",
  },
  {
    key: "marketing_sms",
    label: "Marketing SMS",
    description: "Receive promotional text messages about events and offers",
    icon: Bell,
    category: "marketing",
  },
  {
    key: "marketing_push",
    label: "Push Notifications",
    description: "Receive push notifications for marketing and promotions",
    icon: Bell,
    category: "marketing",
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "Allow us to collect usage data to improve our services",
    icon: BarChart3,
    category: "analytics",
  },
  {
    key: "personalization",
    label: "Personalization",
    description: "Allow personalized recommendations based on your activity",
    icon: Users,
    category: "analytics",
  },
  {
    key: "third_party_sharing",
    label: "Third-Party Sharing",
    description: "Allow sharing data with trusted partners for enhanced services",
    icon: Users,
    category: "sharing",
  },
];

export default function PrivacySettingsPage() {
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  // Fetch current consent records
  const { data: consents, isLoading: loadingConsents, error: consentsError } = useQuery({
    queryKey: ["privacy-consents"],
    queryFn: async () => {
      const response = await fetch("/api/privacy/consent", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch consents");
      const result = await response.json();
      return result.data as ConsentRecord[];
    },
  });

  // Fetch DSR history
  const { data: dsrHistory, isLoading: loadingDSR, error: dsrError } = useQuery({
    queryKey: ["privacy-dsr-history"],
    queryFn: async () => {
      const response = await fetch("/api/privacy/dsr?my_requests=true", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch DSR history");
      const result = await response.json();
      return result.data as DataSubjectRequest[];
    },
  });

  // Update consent mutation
  const updateConsentMutation = useMutation({
    mutationFn: async ({ consent_type, is_granted }: { consent_type: string; is_granted: boolean }) => {
      const response = await fetch("/api/privacy/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
        body: JSON.stringify({
          consent_type,
          is_granted,
          source: "privacy_settings",
          legal_basis: "consent",
        }),
      });
      if (!response.ok) throw new Error("Failed to update consent");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy-consents"] });
    },
  });

  // Create DSR mutation
  const createDSRMutation = useMutation({
    mutationFn: async ({ request_type }: { request_type: string }) => {
      const response = await fetch("/api/privacy/dsr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
        body: JSON.stringify({
          request_type,
          verification_method: "account_login",
        }),
      });
      if (!response.ok) throw new Error("Failed to create request");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy-dsr-history"] });
      setShowDeleteConfirm(false);
      setShowExportConfirm(false);
    },
  });

  const getConsentValue = (consentType: string): boolean => {
    const consent = consents?.find((c) => c.consent_type === consentType);
    return consent?.is_granted ?? false;
  };

  const handleConsentChange = (consentType: string, value: boolean) => {
    updateConsentMutation.mutate({ consent_type: consentType, is_granted: value });
  };

  const handleDataExport = () => {
    createDSRMutation.mutate({ request_type: "portability" });
  };

  const handleAccountDeletion = () => {
    createDSRMutation.mutate({ request_type: "erasure" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
      pending: { color: "bg-warning-100 text-warning-800", icon: Clock },
      verified: { color: "bg-info-100 text-info-800", icon: Clock },
      in_progress: { color: "bg-info-100 text-info-800", icon: Clock },
      completed: { color: "bg-success-100 text-success-800", icon: CheckCircle },
      rejected: { color: "bg-error-100 text-error-800", icon: AlertTriangle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Text className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        <Icon className="size-3" />
        {status.replace("_", " ").toUpperCase()}
      </Text>
    );
  };

  return (
    <>
      <Container className="py-8 max-w-container-3xl">
        <Stack gap={8}>
          {/* Header */}
          <Stack gap={4}>
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center border-2 border-black bg-primary-100">
                <Shield className="size-6 text-primary-600" />
              </div>
              <div>
                <H2 className="text-ink-950">Privacy Settings</H2>
                <Body className="text-grey-600">
                  Manage your privacy preferences and data rights
                </Body>
              </div>
            </div>
          </Stack>

          {/* Consent Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Cookie className="size-5 text-grey-600" />
                <H3 className="text-ink-950">Consent Preferences</H3>
              </div>
              <Body size="sm" className="text-grey-600 mt-1">
                Control how we use your data. You can change these settings at any time.
              </Body>
            </CardHeader>
            <CardBody>
              {loadingConsents ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : consentsError ? (
                <EmptyState
                  title="Error Loading Consents"
                  description="Failed to load your consent preferences. Please try again."
                  action={{ label: 'Retry', onClick: () => window.location.reload() }}
                />
              ) : (
                <Stack gap={6}>
                  {/* Marketing Consents */}
                  <div>
                    <Label size="sm" className="text-grey-500 mb-3 block">
                      MARKETING COMMUNICATIONS
                    </Label>
                    <Stack gap={4}>
                      {CONSENT_TYPES.filter((c) => c.category === "marketing").map((consent) => {
                        const Icon = consent.icon;
                        return (
                          <div
                            key={consent.key}
                            className="flex items-start justify-between gap-4 pb-4 border-b border-grey-200 last:border-0 last:pb-0"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex size-10 items-center justify-center border-2 border-grey-200 bg-grey-50 rounded-button">
                                <Icon className="size-5 text-grey-600" />
                              </div>
                              <div>
                                <Body className="font-weight-medium text-grey-900">{consent.label}</Body>
                                <Body size="sm" className="text-grey-600">
                                  {consent.description}
                                </Body>
                              </div>
                            </div>
                            <Switch
                              checked={getConsentValue(consent.key)}
                              onChange={(e) => handleConsentChange(consent.key, e.target.checked)}
                              disabled={updateConsentMutation.isPending}
                            />
                          </div>
                        );
                      })}
                    </Stack>
                  </div>

                  {/* Analytics Consents */}
                  <div>
                    <Label size="sm" className="text-grey-500 mb-3 block">
                      ANALYTICS & PERSONALIZATION
                    </Label>
                    <Stack gap={4}>
                      {CONSENT_TYPES.filter((c) => c.category === "analytics").map((consent) => {
                        const Icon = consent.icon;
                        return (
                          <div
                            key={consent.key}
                            className="flex items-start justify-between gap-4 pb-4 border-b border-grey-200 last:border-0 last:pb-0"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex size-10 items-center justify-center border-2 border-grey-200 bg-grey-50 rounded-button">
                                <Icon className="size-5 text-grey-600" />
                              </div>
                              <div>
                                <Body className="font-weight-medium text-grey-900">{consent.label}</Body>
                                <Body size="sm" className="text-grey-600">
                                  {consent.description}
                                </Body>
                              </div>
                            </div>
                            <Switch
                              checked={getConsentValue(consent.key)}
                              onChange={(e) => handleConsentChange(consent.key, e.target.checked)}
                              disabled={updateConsentMutation.isPending}
                            />
                          </div>
                        );
                      })}
                    </Stack>
                  </div>

                  {/* Data Sharing Consents */}
                  <div>
                    <Label size="sm" className="text-grey-500 mb-3 block">
                      DATA SHARING
                    </Label>
                    <Stack gap={4}>
                      {CONSENT_TYPES.filter((c) => c.category === "sharing").map((consent) => {
                        const Icon = consent.icon;
                        return (
                          <div
                            key={consent.key}
                            className="flex items-start justify-between gap-4 pb-4 border-b border-grey-200 last:border-0 last:pb-0"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex size-10 items-center justify-center border-2 border-grey-200 bg-grey-50 rounded-button">
                                <Icon className="size-5 text-grey-600" />
                              </div>
                              <div>
                                <Body className="font-weight-medium text-grey-900">{consent.label}</Body>
                                <Body size="sm" className="text-grey-600">
                                  {consent.description}
                                </Body>
                              </div>
                            </div>
                            <Switch
                              checked={getConsentValue(consent.key)}
                              onChange={(e) => handleConsentChange(consent.key, e.target.checked)}
                              disabled={updateConsentMutation.isPending}
                            />
                          </div>
                        );
                      })}
                    </Stack>
                  </div>
                </Stack>
              )}
            </CardBody>
          </Card>

          {/* Data Rights */}
          <Card>
            <CardHeader>
              <H3 className="text-ink-950">Your Data Rights</H3>
              <Body size="sm" className="text-grey-600 mt-1">
                Exercise your rights under GDPR, CCPA, and other privacy regulations.
              </Body>
            </CardHeader>
            <CardBody>
              <Stack gap={4}>
                {/* Data Export */}
                <div className="flex items-start justify-between gap-4 p-4 border-2 border-grey-200 rounded-card">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center border-2 border-primary-200 bg-primary-50 rounded-button">
                      <Download className="size-5 text-primary-600" />
                    </div>
                    <div>
                      <Body className="font-weight-medium text-grey-900">Export Your Data</Body>
                      <Body size="sm" className="text-grey-600">
                        Download a copy of all your personal data in machine-readable format (JSON).
                        This includes your profile, activity, and preferences.
                      </Body>
                    </div>
                  </div>
                  {!showExportConfirm ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExportConfirm(true)}
                    >
                      Request Export
                    </Button>
                  ) : (
                    <Stack gap={2} className="items-end">
                      <Body size="sm" className="text-grey-600">
                        This will create a data export request. You&apos;ll receive an email when ready.
                      </Body>
                      <Stack direction="horizontal" gap={2}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowExportConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="solid"
                          size="sm"
                          onClick={handleDataExport}
                          disabled={createDSRMutation.isPending}
                        >
                          {createDSRMutation.isPending ? "Requesting..." : "Confirm Export"}
                        </Button>
                      </Stack>
                    </Stack>
                  )}
                </div>

                {/* Account Deletion */}
                <div className="flex items-start justify-between gap-4 p-4 border-2 border-error-200 rounded-card bg-error-50">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center border-2 border-error-200 bg-error-100 rounded-button">
                      <Trash2 className="size-5 text-error-600" />
                    </div>
                    <div>
                      <Body className="font-weight-medium text-grey-900">Delete Your Account</Body>
                      <Body size="sm" className="text-grey-600">
                        Permanently delete your account and all associated data. This action cannot be undone.
                        Some data may be retained for legal compliance.
                      </Body>
                    </div>
                  </div>
                  {!showDeleteConfirm ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete Account
                    </Button>
                  ) : (
                    <Stack gap={2} className="items-end">
                      <Alert variant="warning" className="text-body-sm">
                        This will permanently delete your account within 30 days.
                      </Alert>
                      <Stack direction="horizontal" gap={2}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleAccountDeletion}
                          disabled={createDSRMutation.isPending}
                        >
                          {createDSRMutation.isPending ? "Requesting..." : "Confirm Deletion"}
                        </Button>
                      </Stack>
                    </Stack>
                  )}
                </div>
              </Stack>
            </CardBody>
          </Card>

          {/* Request History */}
          <Card>
            <CardHeader>
              <H3 className="text-ink-950">Request History</H3>
              <Body size="sm" className="text-grey-600 mt-1">
                Track the status of your data subject requests.
              </Body>
            </CardHeader>
            <CardBody>
              {loadingDSR ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : dsrError ? (
                <EmptyState
                  title="Error Loading Requests"
                  description="Failed to load your request history. Please try again."
                  action={{ label: 'Retry', onClick: () => window.location.reload() }}
                />
              ) : dsrHistory && dsrHistory.length > 0 ? (
                <div className="border-2 border-grey-200 rounded-card overflow-hidden">
                  <Table className="w-full">
                    <TableHeader className="bg-grey-50">
                      <TableRow>
                        <TableHead className="text-left p-3 text-body-sm font-weight-medium text-grey-700">Request Type</TableHead>
                        <TableHead className="text-left p-3 text-body-sm font-weight-medium text-grey-700">Status</TableHead>
                        <TableHead className="text-left p-3 text-body-sm font-weight-medium text-grey-700">Submitted</TableHead>
                        <TableHead className="text-left p-3 text-body-sm font-weight-medium text-grey-700">Deadline</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-grey-200">
                      {dsrHistory.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="p-3 text-body-sm text-grey-900 capitalize">
                            {request.request_type.replace("_", " ")}
                          </TableCell>
                          <TableCell className="p-3">{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="p-3 text-body-sm text-grey-600">
                            {formatDate(request.created_at)}
                          </TableCell>
                          <TableCell className="p-3 text-body-sm text-grey-600">
                            {formatDate(request.deadline_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="size-12 text-grey-300 mx-auto mb-3" />
                  <Body className="text-grey-600">No data requests yet</Body>
                  <Body size="sm" className="text-grey-500">
                    Your data export and deletion requests will appear here.
                  </Body>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Legal Links */}
          <div className="flex flex-wrap gap-4 justify-center text-body-sm">
            <Link href="/legal/privacy" className="text-primary-600 hover:text-primary-800 underline">
              Privacy Policy
            </Link>
            <Text className="text-grey-400">•</Text>
            <Link href="/legal/cookies" className="text-primary-600 hover:text-primary-800 underline">
              Cookie Policy
            </Link>
            <Text className="text-grey-400">•</Text>
            <Link href="/legal/terms" className="text-primary-600 hover:text-primary-800 underline">
              Terms of Service
            </Link>
            <Text className="text-grey-400">•</Text>
            <Link href="mailto:privacy@ghxstship.com" className="text-primary-600 hover:text-primary-800 underline">
              Contact Privacy Team
            </Link>
          </div>
        </Stack>
      </Container>
    </>
  );
}
