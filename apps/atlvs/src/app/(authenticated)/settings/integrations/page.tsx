"use client";

/**
 * Integrations Settings Page
 * Connect third-party services and APIs
 * Uses DetailPage template for consistent layout
 */

import { useState, useCallback } from "react";
import { Plug, Check, X, List, Key } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";
import {
  Badge, Body, Button, Card, Grid, Modal, ModalBody, ModalFooter, ModalHeader, Input, StatCard, DetailPage, Section, SectionHeader, useToast, Box} from "@ghxstship/ui";
import { IntegrationErrorBoundary } from "../../../../components/error-boundaries";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "crm" | "calendar" | "payment" | "communication" | "storage" | "pos" | "ats" | "hr" | "payroll" | "scheduling";
  connected: boolean;
  connected_at?: string;
}

const DEMO_INTEGRATIONS: Integration[] = [
  { id: "1", name: "Salesforce", description: "Sync contacts and deals", icon: "CRM", category: "crm", connected: true, connected_at: "2024-11-15" },
  { id: "2", name: "Google Calendar", description: "Sync events and schedules", icon: "CAL", category: "calendar", connected: true, connected_at: "2024-10-01" },
  { id: "3", name: "Stripe", description: "Process payments", icon: "PAY", category: "payment", connected: false },
  { id: "4", name: "Slack", description: "Team notifications", icon: "MSG", category: "communication", connected: true, connected_at: "2024-12-01" },
  { id: "5", name: "Dropbox", description: "File storage and sharing", icon: "BOX", category: "storage", connected: false },
  { id: "6", name: "HubSpot", description: "Marketing automation", icon: "HUB", category: "crm", connected: false },
  { id: "7", name: "Zoom", description: "Video conferencing", icon: "VID", category: "communication", connected: false },
  { id: "8", name: "QuickBooks", description: "Accounting and invoicing", icon: "QBO", category: "payment", connected: false },
  { id: "9", name: "Toast", description: "Restaurant POS and management", icon: "POS", category: "pos", connected: false },
  { id: "10", name: "Square POS", description: "Point of sale and payments", icon: "SQ", category: "pos", connected: false },
  { id: "11", name: "Clover", description: "Business management and POS", icon: "CLV", category: "pos", connected: false },
  { id: "12", name: "Greenhouse", description: "Structured hiring platform", icon: "GH", category: "ats", connected: false },
  { id: "13", name: "Lever", description: "Talent acquisition suite", icon: "LVR", category: "ats", connected: false },
  { id: "14", name: "JazzHR", description: "Recruiting software for SMB", icon: "JHR", category: "ats", connected: false },
  { id: "15", name: "Indeed", description: "Job posting and hiring", icon: "IND", category: "ats", connected: false },
  { id: "16", name: "BambooHR", description: "HR software for SMB", icon: "BBH", category: "hr", connected: false },
  { id: "17", name: "Workday", description: "Enterprise HR platform", icon: "WD", category: "hr", connected: false },
  { id: "18", name: "HiBob", description: "Modern HR platform", icon: "BOB", category: "hr", connected: false },
  { id: "19", name: "Gusto", description: "Payroll and HR platform", icon: "GST", category: "payroll", connected: false },
  { id: "20", name: "Rippling", description: "HR, IT, and Finance", icon: "RPL", category: "payroll", connected: false },
  { id: "21", name: "Deel", description: "Global payroll and compliance", icon: "DEL", category: "payroll", connected: false },
  { id: "22", name: "Deputy", description: "Workforce management", icon: "DPT", category: "scheduling", connected: false },
  { id: "23", name: "When I Work", description: "Employee scheduling", icon: "WIW", category: "scheduling", connected: false },
  { id: "24", name: "7shifts", description: "Restaurant scheduling", icon: "7S", category: "scheduling", connected: false },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "crm", label: "CRM" },
  { id: "calendar", label: "Calendar" },
  { id: "payment", label: "Payment" },
  { id: "communication", label: "Communication" },
  { id: "storage", label: "Storage" },
  { id: "pos", label: "Point of Sale" },
  { id: "ats", label: "Recruiting" },
  { id: "hr", label: "HR" },
  { id: "payroll", label: "Payroll" },
  { id: "scheduling", label: "Scheduling" },
];

export default function IntegrationsSettingsPage() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuthContext();
  const toast = useToast();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showConnect, setShowConnect] = useState<Integration | null>(null);
  const [apiKey, setApiKey] = useState("");

  const canManageIntegrations = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));

  const { data: integrations = [], isLoading, error, refetch } = useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const response = await fetch("/api/settings/integrations");
      if (!response.ok) return DEMO_INTEGRATIONS;
      const data = await response.json();
      return data.integrations?.length ? data.integrations : DEMO_INTEGRATIONS;
    },
  });

  const connectMutation = useMutation({
    mutationFn: async ({ integrationId, apiKey }: { integrationId: string; apiKey: string }) => {
      const response = await fetch(`/api/settings/integrations/${integrationId}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      if (!response.ok) throw new Error("Failed to connect");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Connected", `${showConnect?.name} connected successfully`);
      setShowConnect(null);
      setApiKey("");
    },
    onError: () => {
      toast.error("Error", "Failed to connect integration");
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const response = await fetch(`/api/settings/integrations/${integrationId}/disconnect`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to disconnect");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast.success("Disconnected", "Integration disconnected");
    },
    onError: () => {
      toast.error("Error", "Failed to disconnect integration");
    },
  });

  const filteredIntegrations = selectedCategory === "all" ? integrations : integrations.filter((i: Integration) => i.category === selectedCategory);
  const connectedCount = integrations.filter((i: Integration) => i.connected).length;

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // Extract inline functions to useCallback for better performance with memoized children
  const handleCloseConnectModal = useCallback(() => {
    setShowConnect(null);
    setApiKey("");
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleConnectIntegration = useCallback((integration: Integration) => {
    setShowConnect(integration);
  }, []);

  const handleDisconnectIntegration = useCallback((integrationId: string) => {
    disconnectMutation.mutate(integrationId);
  }, [disconnectMutation]);

  const handleConnectSubmit = useCallback(() => {
    if (showConnect) {
      connectMutation.mutate({ integrationId: showConnect.id, apiKey });
    }
  }, [showConnect, apiKey, connectMutation]);

  const tabs = [
    {
      id: "integrations",
      label: "Integrations",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mb-6">
            <StatCard label="Total Integrations" value={integrations.length.toString()} icon={<Plug className="size-5" />} />
            <StatCard label="Connected" value={connectedCount.toString()} icon={<Check className="size-5" />} />
            <StatCard label="Available" value={(integrations.length - connectedCount).toString()} icon={<Plug className="size-5" />} />
          </Grid>

          <Box className="flex gap-2 mb-6 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Button key={cat.id} variant={selectedCategory === cat.id ? "solid" : "outline"} size="sm" onClick={() => handleCategoryChange(cat.id)}>
                {cat.label}
              </Button>
            ))}
          </Box>

          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            <IntegrationErrorBoundary>
              {filteredIntegrations.map((integration: Integration) => (
                <Card key={integration.id} className="p-4">
                  <Box className="flex items-start justify-between">
                    <Box className="flex items-start gap-3">
                      <Box className="font-weight-bold">{integration.icon}</Box>
                      <Box>
                        <Body className="font-weight-medium">{integration.name}</Body>
                        <Body size="sm" className="text-text-muted">{integration.description}</Body>
                        {integration.connected && integration.connected_at && (
                          <Body size="sm" className="text-text-disabled mt-1">Connected {formatDate(integration.connected_at)}</Body>
                        )}
                      </Box>
                    </Box>
                    <Box className="flex items-center gap-2">
                      {integration.connected ? (
                        <>
                          <Badge variant="success">Connected</Badge>
                          {canManageIntegrations && (
                            <Button variant="ghost" size="sm" onClick={() => handleDisconnectIntegration(integration.id)} disabled={disconnectMutation.isPending}>
                              <X className="size-4" />
                            </Button>
                          )}
                        </>
                      ) : (
                        canManageIntegrations && (
                          <Button variant="outline" size="sm" onClick={() => handleConnectIntegration(integration)}>Connect</Button>
                        )
                      )}
                    </Box>
                  </Box>
                </Card>
              ))}
            </IntegrationErrorBoundary>
          </Grid>
        </Section>
      ),
    },
    {
      id: "api",
      label: "API Keys",
      icon: <Key className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="API Access" description="Manage API keys for custom integrations" />
          <Card className="p-8 text-center mt-4">
            <Key className="size-12 text-text-disabled mx-auto mb-4" />
            <Body className="font-weight-medium font-weight-medium mb-2">No API Keys</Body>
            <Body className="text-text-muted mb-4">Create API keys for custom integrations</Body>
            {canManageIntegrations && <Button variant="solid">Generate API Key</Button>}
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{ kicker: "Settings", title: "Integrations", description: "Connect third-party services and APIs" }}
        backButton={{ label: "Settings", href: "/settings" }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        tabs={tabs}
      />

      <Modal open={!!showConnect} onClose={handleCloseConnectModal}>
        <ModalHeader><Body className="font-weight-bold font-weight-medium">Connect {showConnect?.name}</Body></ModalHeader>
        <ModalBody>
          <Box className="flex items-center gap-3 mb-4">
            <Box className="font-weight-bold">{showConnect?.icon}</Box>
            <Box>
              <Body className="font-weight-medium">{showConnect?.name}</Body>
              <Body size="sm" className="text-text-muted">{showConnect?.description}</Body>
            </Box>
          </Box>
          <Box>
            <Body size="sm" className="text-text-muted mb-1">API Key</Body>
            <Input type="password" placeholder="Enter your API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            <Body size="sm" className="text-text-disabled mt-2">You can find your API key in your {showConnect?.name} account settings.</Body>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={handleCloseConnectModal}>Cancel</Button>
          <Button variant="solid" onClick={() => showConnect && connectMutation.mutate({ integrationId: showConnect.id, apiKey })} disabled={!apiKey || connectMutation.isPending}>
            {connectMutation.isPending ? "Connecting..." : "Connect"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
