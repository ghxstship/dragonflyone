"use client";

/**
 * Integrations Settings Page
 * Connect third-party services and APIs
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { Plug, Check, X, List, Key } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Input,
  StatCard,
  DetailPage,
  Section,
  SectionHeader,
  useNotifications,
} from "@ghxstship/ui";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "crm" | "calendar" | "payment" | "communication" | "storage";
  connected: boolean;
  connected_at?: string;
}

const DEMO_INTEGRATIONS: Integration[] = [
  { id: "1", name: "Salesforce", description: "Sync contacts and deals", icon: "☁️", category: "crm", connected: true, connected_at: "2024-11-15" },
  { id: "2", name: "Google Calendar", description: "Sync events and schedules", icon: "📅", category: "calendar", connected: true, connected_at: "2024-10-01" },
  { id: "3", name: "Stripe", description: "Process payments", icon: "💳", category: "payment", connected: false },
  { id: "4", name: "Slack", description: "Team notifications", icon: "💬", category: "communication", connected: true, connected_at: "2024-12-01" },
  { id: "5", name: "Dropbox", description: "File storage and sharing", icon: "📦", category: "storage", connected: false },
  { id: "6", name: "HubSpot", description: "Marketing automation", icon: "🎯", category: "crm", connected: false },
  { id: "7", name: "Zoom", description: "Video conferencing", icon: "📹", category: "communication", connected: false },
  { id: "8", name: "QuickBooks", description: "Accounting and invoicing", icon: "📊", category: "payment", connected: false },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "crm", label: "CRM" },
  { id: "calendar", label: "Calendar" },
  { id: "payment", label: "Payment" },
  { id: "communication", label: "Communication" },
  { id: "storage", label: "Storage" },
];

export default function IntegrationsSettingsPage() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();

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
      addNotification({ type: "success", title: "Connected", message: `${showConnect?.name} connected successfully` });
      setShowConnect(null);
      setApiKey("");
    },
    onError: () => {
      addNotification({ type: "error", title: "Error", message: "Failed to connect integration" });
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
      addNotification({ type: "success", title: "Disconnected", message: "Integration disconnected" });
    },
    onError: () => {
      addNotification({ type: "error", title: "Error", message: "Failed to disconnect integration" });
    },
  });

  const filteredIntegrations = selectedCategory === "all" ? integrations : integrations.filter((i: Integration) => i.category === selectedCategory);
  const connectedCount = integrations.filter((i: Integration) => i.connected).length;

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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

          <div className="flex gap-2 mb-6 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Button key={cat.id} variant={selectedCategory === cat.id ? "solid" : "outline"} size="sm" onClick={() => setSelectedCategory(cat.id)}>
                {cat.label}
              </Button>
            ))}
          </div>

          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            {filteredIntegrations.map((integration: Integration) => (
              <Card key={integration.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="font-weight-bold">{integration.icon}</div>
                    <div>
                      <Body className="font-weight-medium">{integration.name}</Body>
                      <Body size="sm" className="text-grey-400">{integration.description}</Body>
                      {integration.connected && integration.connected_at && (
                        <Body size="sm" className="text-grey-500 mt-1">Connected {formatDate(integration.connected_at)}</Body>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.connected ? (
                      <>
                        <Badge variant="success">Connected</Badge>
                        {canManageIntegrations && (
                          <Button variant="ghost" size="sm" onClick={() => disconnectMutation.mutate(integration.id)} disabled={disconnectMutation.isPending}>
                            <X className="size-4" />
                          </Button>
                        )}
                      </>
                    ) : (
                      canManageIntegrations && (
                        <Button variant="outline" size="sm" onClick={() => setShowConnect(integration)}>Connect</Button>
                      )
                    )}
                  </div>
                </div>
              </Card>
            ))}
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
            <Key className="size-12 text-grey-600 mx-auto mb-4" />
            <Body className="font-weight-medium font-weight-medium mb-2">No API Keys</Body>
            <Body className="text-grey-400 mb-4">Create API keys for custom integrations</Body>
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

      <Modal open={!!showConnect} onClose={() => { setShowConnect(null); setApiKey(""); }}>
        <ModalHeader><Body className="font-weight-bold font-weight-medium">Connect {showConnect?.name}</Body></ModalHeader>
        <ModalBody>
          <div className="flex items-center gap-3 mb-4">
            <div className="font-weight-bold">{showConnect?.icon}</div>
            <div>
              <Body className="font-weight-medium">{showConnect?.name}</Body>
              <Body size="sm" className="text-grey-400">{showConnect?.description}</Body>
            </div>
          </div>
          <div>
            <Body size="sm" className="text-grey-400 mb-1">API Key</Body>
            <Input type="password" placeholder="Enter your API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            <Body size="sm" className="text-grey-500 mt-2">You can find your API key in your {showConnect?.name} account settings.</Body>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowConnect(null); setApiKey(""); }}>Cancel</Button>
          <Button variant="solid" onClick={() => showConnect && connectMutation.mutate({ integrationId: showConnect.id, apiKey })} disabled={!apiKey || connectMutation.isPending}>
            {connectMutation.isPending ? "Connecting..." : "Connect"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
