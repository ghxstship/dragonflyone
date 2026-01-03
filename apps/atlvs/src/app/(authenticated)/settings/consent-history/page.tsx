"use client";

/**
 * Consent History Page
 * View consent and agreement history
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { FileText, Check, Clock, List, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, StatCard, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, DetailPage, Section, SectionHeader, Box, Stack } from "@ghxstship/ui";

interface ConsentRecord {
  id: string;
  type: "terms" | "privacy" | "cookies" | "marketing" | "data_processing";
  version: string;
  accepted_at: string;
  ip_address: string;
  user_agent: string;
}

const DEMO_CONSENTS: ConsentRecord[] = [
  { id: "1", type: "terms", version: "2.1", accepted_at: "2024-12-15T10:30:00Z", ip_address: "192.168.1.1", user_agent: "Chrome/120" },
  { id: "2", type: "privacy", version: "3.0", accepted_at: "2024-12-15T10:30:00Z", ip_address: "192.168.1.1", user_agent: "Chrome/120" },
  { id: "3", type: "cookies", version: "1.5", accepted_at: "2024-12-15T10:30:00Z", ip_address: "192.168.1.1", user_agent: "Chrome/120" },
  { id: "4", type: "marketing", version: "1.0", accepted_at: "2024-11-01T14:20:00Z", ip_address: "192.168.1.1", user_agent: "Safari/17" },
  { id: "5", type: "data_processing", version: "2.0", accepted_at: "2024-10-15T09:00:00Z", ip_address: "192.168.1.1", user_agent: "Firefox/119" },
];

const TYPE_LABELS: Record<string, string> = {
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  cookies: "Cookie Policy",
  marketing: "Marketing Communications",
  data_processing: "Data Processing Agreement",
};

export default function ConsentHistoryPage() {
  const router = useRouter();

  const { data: consents = [], isLoading, error, refetch } = useQuery({
    queryKey: ["consent-history"],
    queryFn: async () => {
      const response = await fetch("/api/settings/consent-history");
      if (!response.ok) return DEMO_CONSENTS;
      const data = await response.json();
      return data.consents?.length ? data.consents : DEMO_CONSENTS;
    },
  });

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const stats = {
    total: consents.length,
    recent: consents.filter((c: ConsentRecord) => new Date(c.accepted_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
  };

  const tabs = [
    {
      id: "history",
      label: "History",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 mb-6">
            <StatCard label="Total Consents" value={stats.total.toString()} icon={<Check className="size-5" />} />
            <StatCard label="Last 30 Days" value={stats.recent.toString()} icon={<Clock className="size-5" />} />
          </Grid>

          {consents.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="font-weight-medium text-body-lg mb-2">No Consent Records</Body>
              <Body className="text-text-muted">Your consent history will appear here</Body>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agreement</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Accepted</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consents.map((consent: ConsentRecord) => (
                    <TableRow key={consent.id}>
                      <TableCell>
                        <Box className="flex items-center gap-2">
                          <FileText className="size-4 text-text-muted" />
                          <Body className="font-weight-medium">{TYPE_LABELS[consent.type] || consent.type}</Body>
                        </Box>
                      </TableCell>
                      <TableCell><Badge variant="outline">v{consent.version}</Badge></TableCell>
                      <TableCell><Body size="sm">{formatDate(consent.accepted_at)}</Body></TableCell>
                      <TableCell>
                        <Body size="sm" className="text-text-muted">{consent.ip_address} • {consent.user_agent}</Body>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </Section>
      ),
    },
    {
      id: "policies",
      label: "Current Policies",
      icon: <Shield className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Active Policies" description="View the current versions of our policies" />
          <Stack gap={4} className="mt-4">
            {Object.entries(TYPE_LABELS).map(([key, label]) => {
              const consent = consents.find((c: ConsentRecord) => c.type === key);
              return (
                <Card key={key} className="p-4">
                  <Box className="flex justify-between items-center">
                    <Box className="flex items-center gap-3">
                      <FileText className="size-5 text-text-muted" />
                      <Box>
                        <Body className="font-weight-medium">{label}</Body>
                        {consent && <Body size="sm" className="text-text-muted">Accepted v{consent.version} on {formatDate(consent.accepted_at)}</Body>}
                      </Box>
                    </Box>
                    <Box className="flex items-center gap-2">
                      {consent ? <Badge variant="success">Accepted</Badge> : <Badge variant="warning">Pending</Badge>}
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/legal/${key.replace("_", "-")}`)}>View</Button>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Settings", title: "Consent History", description: "View your consent and agreement history" }}
      backButton={{ label: "Settings", href: "/settings" }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
