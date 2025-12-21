"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AtlvsAppLayout } from "../../../../components/app-layout";
import {
  Stack,
  Body,
  H2,
  H3,
  Label,
  Container,
  Card,
  CardBody,
  Badge,
  Button,
} from "@ghxstship/ui";
import { History, ChevronLeft, ChevronRight, Clock, Check, X, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ConsentHistoryEntry {
  id: string;
  action: string;
  consentType: string;
  previousValue: unknown;
  newValue: unknown;
  source: string;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

interface CurrentConsent {
  consent_type: string;
  is_granted: boolean;
  granted_at: string | null;
  revoked_at: string | null;
  source: string;
  policy_version: string | null;
}

interface ConsentHistoryResponse {
  data: {
    history: ConsentHistoryEntry[];
    currentConsents: CurrentConsent[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const consentTypeLabels: Record<string, string> = {
  marketing_email: "Email Marketing",
  marketing_sms: "SMS Marketing",
  marketing_push: "Push Notifications",
  analytics: "Analytics",
  personalization: "Personalization",
  third_party_sharing: "Third-Party Sharing",
  privacy_policy: "Privacy Policy",
  terms_of_service: "Terms of Service",
  cookie_policy: "Cookie Policy",
};

const actionLabels: Record<string, { label: string; color: "success" | "error" | "warning" | "info" }> = {
  consent_granted: { label: "Granted", color: "success" },
  consent_revoked: { label: "Revoked", color: "error" },
  consent_updated: { label: "Updated", color: "warning" },
  privacy_settings_updated: { label: "Settings Updated", color: "info" },
};

async function fetchConsentHistory(page: number): Promise<ConsentHistoryResponse> {
  const token = localStorage.getItem("auth_token");
  const response = await fetch(`/api/privacy/consent-history?page=${page}&limit=20`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch consent history");
  }

  return response.json();
}

export default function ConsentHistoryPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["consent-history", page],
    queryFn: () => fetchConsentHistory(page),
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AtlvsAppLayout variant="authenticated">
      <Container className="mx-auto max-w-container-3xl px-4 sm:px-6 lg:px-8 py-8">
        <Stack gap={8}>
          {/* Header */}
          <Stack gap={4}>
            <Link
              href="/settings/privacy"
              className="inline-flex items-center gap-2 text-grey-600 hover:text-grey-900 transition-colors"
            >
              <ChevronLeft className="size-4" />
              <Body size="sm">Back to Privacy Settings</Body>
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center border-2 border-primary-600 bg-primary-100 rounded-card">
                <History className="size-6 text-primary-600" />
              </div>
              <div>
                <H2 className="text-ink-950">Consent History</H2>
                <Body size="sm" className="text-grey-600">
                  View a complete history of your privacy consent changes
                </Body>
              </div>
            </div>
          </Stack>

          {/* Current Consents Summary */}
          {data?.data.currentConsents && data.data.currentConsents.length > 0 && (
            <Card className="border-2 border-grey-200">
              <CardBody>
                <Stack gap={4}>
                  <H3 className="text-ink-950">Current Consent Status</H3>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {data.data.currentConsents.map((consent) => (
                      <div
                        key={consent.consent_type}
                        className="flex items-center justify-between p-3 bg-grey-50 border-2 border-grey-200 rounded-card"
                      >
                        <Body size="sm" className="text-grey-700">
                          {consentTypeLabels[consent.consent_type] || consent.consent_type}
                        </Body>
                        {consent.is_granted ? (
                          <Badge variant="success">
                            <Check className="size-3 mr-1" />
                            Granted
                          </Badge>
                        ) : (
                          <Badge variant="error">
                            <X className="size-3 mr-1" />
                            Revoked
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </Stack>
              </CardBody>
            </Card>
          )}

          {/* History List */}
          <Stack gap={4}>
            <div className="flex items-center justify-between">
              <H3 className="text-ink-950">Change History</H3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <Card className="border-2 border-grey-200">
                <CardBody>
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="size-8 text-grey-400 animate-spin" />
                  </div>
                </CardBody>
              </Card>
            ) : error ? (
              <Card className="border-2 border-error-200 bg-error-50">
                <CardBody>
                  <Stack gap={2} className="text-center py-8">
                    <Body className="text-error-700">Failed to load consent history</Body>
                    <Button variant="ghost" size="sm" onClick={() => refetch()}>
                      Try Again
                    </Button>
                  </Stack>
                </CardBody>
              </Card>
            ) : data?.data.history.length === 0 ? (
              <Card className="border-2 border-grey-200">
                <CardBody>
                  <Stack gap={2} className="text-center py-12">
                    <History className="size-12 text-grey-300 mx-auto" />
                    <Body className="text-grey-600">No consent history found</Body>
                    <Body size="sm" className="text-grey-500">
                      Your consent changes will appear here
                    </Body>
                  </Stack>
                </CardBody>
              </Card>
            ) : (
              <Stack gap={3}>
                {data?.data.history.map((entry) => {
                  const actionInfo = actionLabels[entry.action] || {
                    label: entry.action,
                    color: "info" as const,
                  };

                  return (
                    <Card key={entry.id} className="border-2 border-grey-200">
                      <CardBody>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="flex size-10 items-center justify-center border-2 border-grey-200 bg-grey-100 rounded-card shrink-0">
                              <Clock className="size-5 text-grey-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Label size="sm" className="text-ink-950">
                                  {consentTypeLabels[entry.consentType] || entry.consentType}
                                </Label>
                                <Badge variant={actionInfo.color}>{actionInfo.label}</Badge>
                              </div>
                              <Body size="sm" className="text-grey-600 mt-1">
                                {formatDate(entry.timestamp)}
                              </Body>
                              {entry.source && (
                                <Body size="xs" className="text-grey-500 mt-1">
                                  Source: {entry.source}
                                </Body>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}

                {/* Pagination */}
                {data && data.data.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-grey-200">
                    <Body size="sm" className="text-grey-500">
                      Page {data.data.pagination.page} of {data.data.pagination.totalPages}
                    </Body>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="size-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= data.data.pagination.totalPages}
                      >
                        Next
                        <ChevronRight className="size-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </Stack>
            )}
          </Stack>

          {/* Info Card */}
          <Card className="border-2 border-grey-200 bg-grey-50">
            <CardBody>
              <Stack gap={3}>
                <H3 className="text-ink-950">About Consent History</H3>
                <Body size="sm" className="text-grey-700">
                  This page shows a complete record of all changes to your privacy consent preferences. 
                  Under GDPR and other privacy regulations, we are required to maintain records of when 
                  and how you provided or withdrew consent for various data processing activities.
                </Body>
                <Body size="sm" className="text-grey-700">
                  If you have questions about your consent history or need to request a detailed report, 
                  please contact our Data Protection Officer at{" "}
                  <a href="mailto:dpo@ghxstship.com" className="text-primary-600 underline">
                    dpo@ghxstship.com
                  </a>
                  .
                </Body>
              </Stack>
            </CardBody>
          </Card>
        </Stack>
      </Container>
    </AtlvsAppLayout>
  );
}
