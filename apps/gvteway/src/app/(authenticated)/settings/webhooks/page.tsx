"use client";

/**
 * GVTEWAY Webhooks Page
 * Configure webhook endpoints to receive real-time event notifications
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import {
  Body,
  Button,
  Card,
  Grid,
  StatCard,
  Input,
  Badge,
  Stack,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Modal,
  Checkbox,
  useToast,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";
import { Webhook, Plus, Trash2, Play, Pause, Eye, Copy, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  useWebhooksData,
  useWebhookDetails,
  type WebhookEndpoint,
  type WebhookEventType,
  ALL_WEBHOOK_EVENTS,
  getEventLabel,
} from "@/hooks/useWebhooks";

export default function WebhooksPage() {
  const toast = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [newSecret, setNewSecret] = useState("");
  const [copiedSecret, setCopiedSecret] = useState(false);

  const [webhookName, setWebhookName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookDescription, setWebhookDescription] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<WebhookEventType[]>([]);

  const {
    webhooks,
    isLoading,
    error,
    refetch,
    createWebhook,
    isCreating,
    updateWebhook,
    deleteWebhook,
  } = useWebhooksData();

  const { data: webhookDetails } = useWebhookDetails(selectedWebhook?.id || null, true);

  const activeCount = webhooks.filter((w) => w.status === "active").length;
  const totalDeliveries = webhooks.reduce((sum, w) => sum + w.success_count + w.failure_count, 0);
  const successRate = totalDeliveries > 0
    ? ((webhooks.reduce((sum, w) => sum + w.success_count, 0) / totalDeliveries) * 100).toFixed(1)
    : "0";

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "error" | "outline"> = {
      active: "success",
      paused: "warning",
      failed: "error",
      disabled: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status.toUpperCase()}</Badge>;
  };

  const toggleEvent = (event: WebhookEventType) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const handleCreateWebhook = async () => {
    if (!webhookName || !webhookUrl || selectedEvents.length === 0) return;
    try {
      const result = await createWebhook({
        name: webhookName,
        url: webhookUrl,
        description: webhookDescription || undefined,
        events: selectedEvents,
      });
      setNewSecret(result.secret);
      setShowCreateModal(false);
      setShowSecretModal(true);
      resetForm();
      toast.success("Created", "Webhook created successfully");
    } catch (err) {
      toast.error("Error", err instanceof Error ? err.message : "Failed to create webhook");
    }
  };

  const handleToggleStatus = async (webhook: WebhookEndpoint) => {
    const newStatus = webhook.status === "active" ? "paused" : "active";
    try {
      await updateWebhook({ id: webhook.id, status: newStatus });
      toast.success("Updated", `Webhook ${newStatus}`);
    } catch (err) {
      toast.error("Error", err instanceof Error ? err.message : "Failed to update webhook");
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (confirm("Are you sure you want to delete this webhook? This action cannot be undone.")) {
      try {
        await deleteWebhook(id);
        setSelectedWebhook(null);
        toast.success("Deleted", "Webhook deleted");
      } catch (err) {
        toast.error("Error", err instanceof Error ? err.message : "Failed to delete webhook");
      }
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(newSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const resetForm = () => {
    setWebhookName("");
    setWebhookUrl("");
    setWebhookDescription("");
    setSelectedEvents([]);
  };

  const headerActions = (
    <Button
      variant="solid"
      onClick={() => setShowCreateModal(true)}
      icon={<Plus className="size-4" />}
      iconPosition="left"
    >
      Create Webhook
    </Button>
  );

  const tabs = [
    {
      id: "endpoints",
      label: "Endpoints",
      icon: <Webhook className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Total Endpoints" value={webhooks.length.toString()} />
            <StatCard label="Active" value={activeCount.toString()} />
            <StatCard label="Total Deliveries" value={totalDeliveries.toLocaleString()} />
            <StatCard label="Success Rate" value={`${successRate}%`} />
          </Grid>

          {webhooks.length === 0 ? (
            <Stack className="text-center py-12 items-center">
              <Webhook className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-text-muted mb-4">No webhooks configured</Body>
              <Button variant="solid" onClick={() => setShowCreateModal(true)}>
                Create Webhook
              </Button>
            </Stack>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Success/Fail</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <Stack gap={0}>
                          <Body className="font-weight-medium text-text-primary">{webhook.name}</Body>
                          {webhook.description && (
                            <Body size="sm" className="text-text-muted">{webhook.description}</Body>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="font-mono text-text-primary truncate max-w-[200px]">
                          {webhook.url}
                        </Body>
                      </TableCell>
                      <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                      <TableCell>
                        <Body size="sm" className="text-text-primary">{webhook.events.length} events</Body>
                      </TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={3} className="items-center">
                          <Stack direction="horizontal" gap={1} className="items-center">
                            <CheckCircle className="size-3 text-success" />
                            <Body size="sm" className="font-mono text-text-primary">{webhook.success_count}</Body>
                          </Stack>
                          <Stack direction="horizontal" gap={1} className="items-center">
                            <XCircle className="size-3 text-error" />
                            <Body size="sm" className="font-mono text-text-primary">{webhook.failure_count}</Body>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedWebhook(webhook)} icon={<Eye className="size-4" />} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(webhook)}
                            icon={webhook.status === "active" ? <Pause className="size-4" /> : <Play className="size-4" />}
                          />
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteWebhook(webhook.id)} icon={<Trash2 className="size-4" />} />
                        </Stack>
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
      id: "activity",
      label: "Activity Log",
      icon: <Clock className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Recent Deliveries" description="Webhook delivery history" />
          {webhookDetails?.deliveries && webhookDetails.deliveries.length > 0 ? (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookDetails.deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        <Body size="sm" className="text-text-primary">{getEventLabel(delivery.event_type)}</Body>
                      </TableCell>
                      <TableCell>
                        {delivery.success ? (
                          <Badge variant="success">Success</Badge>
                        ) : (
                          <Badge variant="error">Failed</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="font-mono text-text-primary">{delivery.response_status || "-"}</Body>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="font-mono text-text-primary">
                          {delivery.response_time_ms ? `${delivery.response_time_ms}ms` : "-"}
                        </Body>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="text-text-muted">
                          {new Date(delivery.created_at).toLocaleString()}
                        </Body>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <Stack className="text-center py-12 items-center">
              <Clock className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-text-muted">No activity yet</Body>
              <Body size="sm" className="text-text-disabled mt-2">
                Webhook deliveries will appear here once events are triggered
              </Body>
            </Stack>
          )}
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{
          kicker: "Settings",
          title: "Webhook Manager",
          description: "Configure webhook endpoints to receive real-time event notifications",
        }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        tabs={tabs}
        actions={headerActions}
        backButton={{
          label: "Settings",
          href: "/settings",
        }}
      />

      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Create Webhook Endpoint">
        <Stack gap={4}>
          <Stack gap={2}>
            <Body size="sm" className="text-text-muted">Name</Body>
            <Input placeholder="e.g., Order Notifications" value={webhookName} onChange={(e) => setWebhookName(e.target.value)} />
          </Stack>
          <Stack gap={2}>
            <Body size="sm" className="text-text-muted">Endpoint URL</Body>
            <Input placeholder="https://your-server.com/webhooks" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
            <Body size="sm" className="text-text-disabled">Must be HTTPS</Body>
          </Stack>
          <Stack gap={2}>
            <Body size="sm" className="text-text-muted">Description (optional)</Body>
            <Input placeholder="Brief description" value={webhookDescription} onChange={(e) => setWebhookDescription(e.target.value)} />
          </Stack>
          <Stack gap={2}>
            <Body size="sm" className="text-text-muted">Events to Subscribe</Body>
            <Card className="p-4 max-h-[200px] overflow-y-auto">
              <Grid cols={2} gap={2} className="grid-cols-1 lg:grid-cols-2">
                {ALL_WEBHOOK_EVENTS.map((event) => (
                  <Stack key={event} direction="horizontal" gap={2} className="items-center">
                    <Checkbox checked={selectedEvents.includes(event)} onChange={() => toggleEvent(event)} />
                    <Body size="sm">{getEventLabel(event)}</Body>
                  </Stack>
                ))}
              </Grid>
            </Card>
            <Body size="sm" className="text-text-disabled">{selectedEvents.length} events selected</Body>
          </Stack>
          <Stack direction="horizontal" gap={4}>
            <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }}>Cancel</Button>
            <Button variant="solid" onClick={handleCreateWebhook} disabled={isCreating || !webhookName || !webhookUrl || selectedEvents.length === 0}>
              {isCreating ? "Creating..." : "Create Webhook"}
            </Button>
          </Stack>
        </Stack>
      </Modal>

      <Modal open={showSecretModal} onClose={() => setShowSecretModal(false)} title="Webhook Secret">
        <Stack gap={4}>
          <Card className="p-4 bg-warning-900 border-warning-500">
            <Body size="sm" className="text-warning-100">This secret will only be shown once. Copy it now and store it securely.</Body>
          </Card>
          <Stack gap={2}>
            <Body size="sm" className="text-text-muted">Signing Secret</Body>
            <Stack direction="horizontal" gap={2}>
              <Input value={newSecret} readOnly className="font-mono" />
              <Button variant="outline" onClick={copySecret} icon={copiedSecret ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}>
                {copiedSecret ? "Copied" : "Copy"}
              </Button>
            </Stack>
            <Body size="sm" className="text-text-disabled">Use this secret to verify webhook signatures</Body>
          </Stack>
          <Button variant="solid" onClick={() => setShowSecretModal(false)}>Done</Button>
        </Stack>
      </Modal>

      <Modal open={!!selectedWebhook} onClose={() => setSelectedWebhook(null)} title="Webhook Details">
        {selectedWebhook && (
          <Stack gap={4}>
            <Stack gap={1}>
              <Body size="sm" className="text-text-muted">Name</Body>
              <Body className="font-weight-medium text-text-primary">{selectedWebhook.name}</Body>
            </Stack>
            <Stack gap={1}>
              <Body size="sm" className="text-text-muted">URL</Body>
              <Body size="sm" className="font-mono text-text-primary break-all">{selectedWebhook.url}</Body>
            </Stack>
            <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2">
              <Stack gap={1}>
                <Body size="sm" className="text-text-muted">Status</Body>
                {getStatusBadge(selectedWebhook.status)}
              </Stack>
              <Stack gap={1}>
                <Body size="sm" className="text-text-muted">Retry Count</Body>
                <Body className="text-text-primary">{selectedWebhook.retry_count}</Body>
              </Stack>
            </Grid>
            <Stack gap={1}>
              <Body size="sm" className="text-text-muted">Subscribed Events</Body>
              <Stack direction="horizontal" className="flex-wrap gap-1 mt-1">
                {selectedWebhook.events.map((event) => (
                  <Badge key={event} variant="outline">{getEventLabel(event)}</Badge>
                ))}
              </Stack>
            </Stack>
            <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2">
              <Stack gap={1}>
                <Body size="sm" className="text-text-muted">Successful Deliveries</Body>
                <Body className="font-mono text-text-primary">{selectedWebhook.success_count}</Body>
              </Stack>
              <Stack gap={1}>
                <Body size="sm" className="text-text-muted">Failed Deliveries</Body>
                <Body className="font-mono text-text-primary">{selectedWebhook.failure_count}</Body>
              </Stack>
            </Grid>
            {selectedWebhook.last_triggered_at && (
              <Stack gap={1}>
                <Body size="sm" className="text-text-muted">Last Triggered</Body>
                <Body className="text-text-primary">{new Date(selectedWebhook.last_triggered_at).toLocaleString()}</Body>
              </Stack>
            )}
            <Stack direction="horizontal" gap={4}>
              <Button variant="outline" onClick={() => setSelectedWebhook(null)}>Close</Button>
              <Button variant="outline" onClick={() => handleDeleteWebhook(selectedWebhook.id)}>Delete Webhook</Button>
            </Stack>
          </Stack>
        )}
      </Modal>
    </>
  );
}
