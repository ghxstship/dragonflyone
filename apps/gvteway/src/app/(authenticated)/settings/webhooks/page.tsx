"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
// Layout provided by route group
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert,
  Kicker, MainContent, Container, Checkbox,
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

function WebhooksPageContent() {
  const router = useRouter();
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'endpoints',
    validTabs: ['endpoints', 'activity'],
  });

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

  const { data: webhookDetails } = useWebhookDetails(
    selectedWebhook?.id || null,
    true
  );

  const activeCount = webhooks.filter(w => w.status === 'active').length;
  const totalDeliveries = webhooks.reduce((sum, w) => sum + w.success_count + w.failure_count, 0);
  const successRate = totalDeliveries > 0
    ? ((webhooks.reduce((sum, w) => sum + w.success_count, 0) / totalDeliveries) * 100).toFixed(1)
    : '0';

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'solid' | 'outline' | 'ghost'> = {
      active: 'solid',
      paused: 'outline',
      failed: 'ghost',
      disabled: 'ghost',
    };
    return <Badge variant={variants[status] || 'ghost'}>{status}</Badge>;
  };

  const toggleEvent = (event: WebhookEventType) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
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
    } catch {
      // Error handled by hook
    }
  };

  const handleToggleStatus = async (webhook: WebhookEndpoint) => {
    const newStatus = webhook.status === 'active' ? 'paused' : 'active';
    try {
      await updateWebhook({ id: webhook.id, status: newStatus });
    } catch {
      // Error handled by hook
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (confirm('Are you sure you want to delete this webhook? This action cannot be undone.')) {
      try {
        await deleteWebhook(id);
        setSelectedWebhook(null);
      } catch {
        // Error handled by hook
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

  if (isLoading) {
    return (
      <>
        <MainContent padding="lg">
          <Container>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Webhook className="w-12 h-12 mx-auto mb-4 text-on-dark-muted animate-pulse" />
                <Body className="text-on-dark-muted">Loading webhooks...</Body>
              </div>
            </div>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MainContent padding="lg">
          <Container>
            <Alert variant="error">
              <Body>Failed to load webhooks: {error instanceof Error ? error.message : 'Unknown error'}</Body>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                Retry
              </Button>
            </Alert>
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Settings</Kicker>
              <H2 size="lg" className="text-white">Webhook Manager</H2>
              <Body className="text-on-dark-muted">Configure webhook endpoints to receive real-time event notifications</Body>
            </Stack>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Endpoints" value={webhooks.length.toString()} inverted />
              <StatCard label="Active" value={activeCount.toString()} inverted />
              <StatCard label="Total Deliveries" value={totalDeliveries.toLocaleString()} inverted />
              <StatCard label="Success Rate" value={`${successRate}%`} inverted />
            </Grid>

            <Tabs>
              <TabsList>
                <Tab active={isActive('endpoints')} onClick={() => setActiveTab('endpoints')}>Endpoints</Tab>
                <Tab active={isActive('activity')} onClick={() => setActiveTab('activity')}>Activity Log</Tab>
              </TabsList>

              <TabPanel active={isActive('endpoints')}>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between">
                    <Input type="search" placeholder="Search webhooks..." className="w-64" inverted />
                    <Button variant="solid" inverted onClick={() => setShowCreateModal(true)} icon={<Plus className="size-4" />} iconPosition="left">
                      Create Webhook
                    </Button>
                  </Stack>

                  {webhooks.length === 0 ? (
                    <Card inverted className="p-8 text-center">
                      <Webhook className="w-12 h-12 mx-auto mb-4 text-on-dark-muted" />
                      <H3 className="text-white mb-2">No webhooks configured</H3>
                      <Body className="text-on-dark-muted mb-4">Create your first webhook endpoint to receive event notifications</Body>
                      <Button variant="solid" inverted onClick={() => setShowCreateModal(true)}>Create Webhook</Button>
                    </Card>
                  ) : (
                    <Card inverted className="overflow-hidden">
                      <Table variant="dark">
                        <TableHeader>
                          <TableRow className="bg-ink-900">
                            <TableHead className="text-on-dark-muted">Name</TableHead>
                            <TableHead className="text-on-dark-muted">URL</TableHead>
                            <TableHead className="text-on-dark-muted">Status</TableHead>
                            <TableHead className="text-on-dark-muted">Events</TableHead>
                            <TableHead className="text-on-dark-muted">Success/Fail</TableHead>
                            <TableHead className="text-on-dark-muted">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {webhooks.map((webhook) => (
                            <TableRow key={webhook.id} className="border-b border-ink-700">
                              <TableCell>
                                <Stack gap={1}>
                                  <Body className="font-display text-white">{webhook.name}</Body>
                                  {webhook.description && <Label size="xs" className="text-on-dark-muted">{webhook.description}</Label>}
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Label className="font-mono text-white truncate max-w-[200px]">{webhook.url}</Label>
                              </TableCell>
                              <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                              <TableCell>
                                <Label className="text-white">{webhook.events.length} events</Label>
                              </TableCell>
                              <TableCell>
                                <Stack direction="horizontal" gap={2}>
                                  <Stack direction="horizontal" gap={1} className="items-center">
                                    <CheckCircle className="size-3 text-success-500" />
                                    <Label className="font-mono text-white">{webhook.success_count}</Label>
                                  </Stack>
                                  <Stack direction="horizontal" gap={1} className="items-center">
                                    <XCircle className="size-3 text-error-500" />
                                    <Label className="font-mono text-white">{webhook.failure_count}</Label>
                                  </Stack>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Stack direction="horizontal" gap={2}>
                                  <Button variant="ghost" size="sm" onClick={() => setSelectedWebhook(webhook)} icon={<Eye className="size-4" />} />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleStatus(webhook)}
                                    icon={webhook.status === 'active' ? <Pause className="size-4" /> : <Play className="size-4" />}
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
                </Stack>
              </TabPanel>

              <TabPanel active={isActive('activity')}>
                {webhookDetails?.deliveries && webhookDetails.deliveries.length > 0 ? (
                  <Card inverted className="overflow-hidden">
                    <Table variant="dark">
                      <TableHeader>
                        <TableRow className="bg-ink-900">
                          <TableHead className="text-on-dark-muted">Event</TableHead>
                          <TableHead className="text-on-dark-muted">Status</TableHead>
                          <TableHead className="text-on-dark-muted">Response</TableHead>
                          <TableHead className="text-on-dark-muted">Time</TableHead>
                          <TableHead className="text-on-dark-muted">Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {webhookDetails.deliveries.map((delivery) => (
                          <TableRow key={delivery.id} className="border-b border-ink-700">
                            <TableCell><Label className="text-white">{getEventLabel(delivery.event_type)}</Label></TableCell>
                            <TableCell>
                              {delivery.success ? (
                                <Badge variant="solid">Success</Badge>
                              ) : (
                                <Badge variant="ghost">Failed</Badge>
                              )}
                            </TableCell>
                            <TableCell><Label className="font-mono text-white">{delivery.response_status || '-'}</Label></TableCell>
                            <TableCell><Label className="font-mono text-white">{delivery.response_time_ms ? `${delivery.response_time_ms}ms` : '-'}</Label></TableCell>
                            <TableCell><Label className="text-on-dark-muted">{new Date(delivery.created_at).toLocaleString()}</Label></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                ) : (
                  <Card inverted className="p-8 text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-on-dark-muted" />
                    <H3 className="text-white mb-2">No activity yet</H3>
                    <Body className="text-on-dark-muted">Webhook deliveries will appear here once events are triggered</Body>
                  </Card>
                )}
              </TabPanel>
            </Tabs>

            <Button variant="outlineInk" onClick={() => router.push("/settings")}>Back to Settings</Button>
          </Stack>
        </Container>
      </MainContent>

      {/* Create Webhook Modal */}
      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }}>
        <ModalHeader><H3>Create Webhook Endpoint</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Stack gap={2}>
              <Label>Name</Label>
              <Input
                placeholder="e.g., Order Notifications"
                value={webhookName}
                onChange={(e) => setWebhookName(e.target.value)}
              />
            </Stack>
            <Stack gap={2}>
              <Label>Endpoint URL</Label>
              <Input
                placeholder="https://your-server.com/webhooks"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <Label size="xs" className="text-ink-500">Must be HTTPS</Label>
            </Stack>
            <Stack gap={2}>
              <Label>Description (optional)</Label>
              <Input
                placeholder="Brief description of this webhook"
                value={webhookDescription}
                onChange={(e) => setWebhookDescription(e.target.value)}
              />
            </Stack>
            <Stack gap={2}>
              <Label>Events to Subscribe</Label>
              <Card className="p-4 max-h-[200px] overflow-y-auto">
                <Grid cols={2} gap={2} className="sm:grid-cols-1 lg:grid-cols-2">
                  {ALL_WEBHOOK_EVENTS.map((event) => (
                    <Stack key={event} direction="horizontal" gap={2} className="items-center">
                      <Checkbox
                        checked={selectedEvents.includes(event)}
                        onChange={() => toggleEvent(event)}
                      />
                      <Label size="sm">{getEventLabel(event)}</Label>
                    </Stack>
                  ))}
                </Grid>
              </Card>
              <Label size="xs" className="text-ink-500">{selectedEvents.length} events selected</Label>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }}>Cancel</Button>
          <Button
            variant="solid"
            onClick={handleCreateWebhook}
            disabled={isCreating || !webhookName || !webhookUrl || selectedEvents.length === 0}
          >
            {isCreating ? 'Creating...' : 'Create Webhook'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Secret Display Modal */}
      <Modal open={showSecretModal} onClose={() => setShowSecretModal(false)}>
        <ModalHeader><H3>Webhook Secret</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Alert variant="warning">
              <Body size="sm">This secret will only be shown once. Copy it now and store it securely.</Body>
            </Alert>
            <Stack gap={2}>
              <Label>Signing Secret</Label>
              <Stack direction="horizontal" gap={2}>
                <Input value={newSecret} readOnly className="font-mono" />
                <Button variant="outline" onClick={copySecret} icon={copiedSecret ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}>
                  {copiedSecret ? 'Copied' : 'Copy'}
                </Button>
              </Stack>
              <Label size="xs" className="text-ink-500">Use this secret to verify webhook signatures</Label>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="solid" onClick={() => setShowSecretModal(false)}>Done</Button>
        </ModalFooter>
      </Modal>

      {/* Webhook Details Modal */}
      <Modal open={!!selectedWebhook} onClose={() => setSelectedWebhook(null)}>
        <ModalHeader><H3>Webhook Details</H3></ModalHeader>
        <ModalBody>
          {selectedWebhook && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label size="xs" className="text-ink-500">Name</Label>
                <Body className="font-display">{selectedWebhook.name}</Body>
              </Stack>
              <Stack gap={1}>
                <Label size="xs" className="text-ink-500">URL</Label>
                <Body size="sm" className="font-mono break-all">{selectedWebhook.url}</Body>
              </Stack>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Status</Label>
                  {getStatusBadge(selectedWebhook.status)}
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Retry Count</Label>
                  <Body>{selectedWebhook.retry_count}</Body>
                </Stack>
              </Grid>
              <Stack gap={1}>
                <Label size="xs" className="text-ink-500">Subscribed Events</Label>
                <Stack direction="horizontal" gap={1} className="flex-wrap">
                  {selectedWebhook.events.map((event) => (
                    <Badge key={event} variant="outline">{getEventLabel(event)}</Badge>
                  ))}
                </Stack>
              </Stack>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Successful Deliveries</Label>
                  <Body className="font-mono">{selectedWebhook.success_count}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Failed Deliveries</Label>
                  <Body className="font-mono">{selectedWebhook.failure_count}</Body>
                </Stack>
              </Grid>
              {selectedWebhook.last_triggered_at && (
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Last Triggered</Label>
                  <Body>{new Date(selectedWebhook.last_triggered_at).toLocaleString()}</Body>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedWebhook(null)}>Close</Button>
          {selectedWebhook && (
            <Button variant="outline" onClick={() => { handleDeleteWebhook(selectedWebhook.id); }}>
              Delete Webhook
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
}

export default function WebhooksPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <WebhooksPageContent />
    </Suspense>
  );
}
