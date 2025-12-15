'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useTabState } from '@ghxstship/config/hooks';
import { GvtewayAppLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  StatCard,
  Tabs,
  TabsList,
  Tab,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Kicker,
} from '@ghxstship/ui';

import {
  useAntiScalpingData,
  type ScalpingAlert,
  type ProtectionRule,
  type BlockedEntity,
} from '@/hooks/useAntiScalping';

function AntiScalpingPageContent() {
  const router = useRouter();
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'alerts',
    validTabs: ['alerts', 'rules', 'blocked', 'analytics'],
  });
  const [selectedAlert, setSelectedAlert] = useState<ScalpingAlert | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [filter, setFilter] = useState({ severity: '', status: '' });
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newBlock, setNewBlock] = useState({
    type: 'ip',
    value: '',
    reason: '',
  });

  // Use the hook for real API data with demo data fallback
  const {
    alerts,
    rules,
    blocked,
    isLoading,
    error: hookError,
    updateAlertStatus,
    toggleRule,
    addBlocked,
    removeBlocked,
  } = useAntiScalpingData({ severity: filter.severity || undefined, status: filter.status || undefined });

  const error = localError || (hookError instanceof Error ? hookError.message : null);

  const handleUpdateAlertStatus = async (alertId: string, newStatus: ScalpingAlert['status']) => {
    try {
      await updateAlertStatus({ alertId, status: newStatus });
      setSuccess(`Alert ${newStatus === 'blocked' ? 'blocked' : newStatus === 'cleared' ? 'cleared' : 'updated'}`);
    } catch {
      setLocalError('Failed to update alert status');
    }
  };

  const handleToggleRule = async (ruleId: string, currentEnabled: boolean) => {
    try {
      await toggleRule({ ruleId, enabled: !currentEnabled });
    } catch {
      setLocalError('Failed to toggle rule');
    }
  };

  const handleAddBlock = async () => {
    if (!newBlock.value || !newBlock.reason) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await addBlocked({
        type: newBlock.type,
        value: newBlock.value,
        reason: newBlock.reason,
      });
      setShowBlockModal(false);
      setNewBlock({ type: 'ip', value: '', reason: '' });
      setSuccess('Entity blocked successfully');
    } catch {
      setLocalError('Failed to block entity');
    }
  };

  const handleRemoveBlock = async (blockId: string) => {
    try {
      await removeBlocked(blockId);
      setSuccess('Block removed');
    } catch {
      setLocalError('Failed to remove block');
    }
  };

  if (isLoading) {
    return (
      <GvtewayAppLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Body className="text-on-dark-muted">Loading anti-scalping data...</Body>
        </div>
      </GvtewayAppLayout>
    );
  }

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'solid' | 'outline' | 'ghost'> = {
      critical: 'solid',
      high: 'solid',
      medium: 'outline',
      low: 'ghost',
    };
    return <Badge variant={variants[severity] || 'ghost'}>{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'solid' | 'outline' | 'ghost'> = {
      pending: 'outline',
      investigating: 'outline',
      blocked: 'solid',
      cleared: 'ghost',
    };
    return <Badge variant={variants[status] || 'ghost'}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      bulk_purchase: 'Bulk Purchase',
      rapid_checkout: 'Rapid Checkout',
      suspicious_pattern: 'Suspicious Pattern',
      bot_detected: 'Bot Detected',
      resale_listing: 'Resale Listing',
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  const filteredAlerts = alerts.filter((a: ScalpingAlert) => {
    const matchesSeverity = !filter.severity || a.severity === filter.severity;
    const matchesStatus = !filter.status || a.status === filter.status;
    return matchesSeverity && matchesStatus;
  });

  const criticalCount = alerts.filter((a: ScalpingAlert) => a.severity === 'critical' && a.status !== 'blocked' && a.status !== 'cleared').length;
  const blockedToday = alerts.filter((a: ScalpingAlert) => a.status === 'blocked').length;
  const ticketsProtected = alerts.filter((a: ScalpingAlert) => a.status === 'blocked').reduce((sum: number, a: ScalpingAlert) => sum + a.ticket_count, 0);

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Admin</Kicker>
                <H2 size="lg" className="text-white">Anti-Scalping Protection</H2>
                <Body className="text-on-dark-muted">Monitor and prevent ticket scalping and fraud</Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Button variant="outlineInk" onClick={() => setShowBlockModal(true)}>
                  Block Entity
                </Button>
                <Button variant="solid" inverted onClick={() => router.push('/admin/settings')}>
                  Settings
                </Button>
              </Stack>
            </Stack>

          {error && (
            <Alert variant="error" onClose={() => setLocalError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

            <Grid cols={4} gap={6}>
              <StatCard label="Active Alerts" value={alerts.filter((a: ScalpingAlert) => a.status === 'pending' || a.status === 'investigating').length.toString()} inverted />
              <StatCard label="Critical" value={criticalCount.toString()} inverted />
              <StatCard label="Blocked Today" value={blockedToday.toString()} inverted />
              <StatCard label="Tickets Protected" value={ticketsProtected.toString()} inverted />
            </Grid>

          {criticalCount > 0 && (
            <Alert variant="error">
              ⚠️ {criticalCount} critical alert{criticalCount > 1 ? 's' : ''} requiring immediate attention
            </Alert>
          )}

          <Tabs>
            <TabsList>
              <Tab active={isActive('alerts')} onClick={() => setActiveTab('alerts')}>
                Alerts ({alerts.filter((a: ScalpingAlert) => a.status === 'pending').length})
              </Tab>
              <Tab active={isActive('rules')} onClick={() => setActiveTab('rules')}>
                Protection Rules
              </Tab>
              <Tab active={isActive('blocked')} onClick={() => setActiveTab('blocked')}>
                Blocked List
              </Tab>
              <Tab active={isActive('analytics')} onClick={() => setActiveTab('analytics')}>
                Analytics
              </Tab>
            </TabsList>
          </Tabs>

          {isActive('alerts') && (
            <Stack gap={6}>
              <Stack direction="horizontal" gap={4}>
                <Field label="" className="w-48">
                  <Select
                    value={filter.severity}
                    onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
                  >
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Select>
                </Field>
                <Field label="" className="w-48">
                  <Select
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="blocked">Blocked</option>
                    <option value="cleared">Cleared</option>
                  </Select>
                </Field>
              </Stack>

              <Stack gap={4}>
                {filteredAlerts.map((alert: ScalpingAlert) => (
                  <Card key={alert.id} inverted variant={alert.severity === 'critical' || alert.severity === 'high' ? 'elevated' : 'default'}>
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={2}>
                        <Stack direction="horizontal" gap={2}>
                          {getSeverityBadge(alert.severity)}
                          {getTypeBadge(alert.type)}
                        </Stack>
                        <Body className="font-weight-bold">{alert.event_name}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-on-dark-muted">Details</Label>
                        <Body size="sm" className="text-on-dark-muted">{alert.details}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-on-dark-muted">Tickets</Label>
                        <Body className="font-display text-white">{alert.ticket_count}</Body>
                      </Stack>
                      <Stack gap={1}>
                        {getStatusBadge(alert.status)}
                        <Label size="xs" className="font-mono text-on-dark-disabled">
                          {new Date(alert.created_at).toLocaleString()}
                        </Label>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedAlert(alert)}>
                          Details
                        </Button>
                        {alert.status === 'pending' && (
                          <Button variant="solid" size="sm" onClick={() => handleUpdateAlertStatus(alert.id, 'blocked')}>
                            Block
                          </Button>
                        )}
                      </Stack>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}

          {isActive('rules') && (
            <Stack gap={4}>
              {rules.map((rule: ProtectionRule) => (
                <Card key={rule.id} inverted variant={rule.enabled ? 'elevated' : 'default'}>
                  <Grid cols={4} gap={4} className="items-center">
                    <Stack gap={1}>
                      <Body className="font-display text-white">{rule.name}</Body>
                      <Label size="xs" className="text-on-dark-muted">{rule.description}</Label>
                    </Stack>
                    <Stack gap={1}>
                      <Label size="xs" className="text-on-dark-muted">Type</Label>
                      <Badge variant="outline">{rule.type.replace('_', ' ')}</Badge>
                    </Stack>
                    <Stack gap={1}>
                      <Label size="xs" className="text-on-dark-muted">Action</Label>
                      <Badge variant={rule.action === 'block' ? 'solid' : 'outline'}>
                        {rule.action.replace('_', ' ')}
                      </Badge>
                      {rule.threshold && (
                        <Label size="xs" className="text-on-dark-disabled">Threshold: {rule.threshold}</Label>
                      )}
                    </Stack>
                    <Stack direction="horizontal" gap={2} className="justify-end">
                      <Button variant="ghost" size="sm">Configure</Button>
                      <Button
                        variant={rule.enabled ? 'outline' : 'solid'}
                        size="sm"
                        onClick={() => handleToggleRule(rule.id, rule.enabled)}
                      >
                        {rule.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </Stack>
                  </Grid>
                </Card>
              ))}
            </Stack>
          )}

          {isActive('blocked') && (
            <Stack gap={4}>
              <Card inverted className="overflow-hidden">
                <Table variant="dark">
                  <TableHeader>
                    <TableRow className="bg-ink-900">
                      <TableHead className="text-on-dark-muted">Type</TableHead>
                      <TableHead className="text-on-dark-muted">Value</TableHead>
                      <TableHead className="text-on-dark-muted">Reason</TableHead>
                      <TableHead className="text-on-dark-muted">Blocked At</TableHead>
                      <TableHead className="text-on-dark-muted">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blocked.map((block: BlockedEntity) => (
                      <TableRow key={block.id} className="border-b border-ink-700">
                        <TableCell>
                          <Badge variant="outline" className="uppercase">{block.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Body className="font-mono text-white">{block.value}</Body>
                        </TableCell>
                        <TableCell><Body className="text-on-dark-muted">{block.reason}</Body></TableCell>
                        <TableCell>
                          <Label className="text-on-dark-disabled">
                            {new Date(block.blocked_at).toLocaleString()}
                          </Label>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveBlock(block.id)}>
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </Stack>
          )}

          {isActive('analytics') && (
            <Grid cols={2} gap={6}>
              <Card inverted className="p-6">
                <Stack gap={4}>
                  <H3 className="text-white">Detection Summary</H3>
                  <Stack gap={2}>
                    {['bulk_purchase', 'bot_detected', 'rapid_checkout', 'resale_listing', 'suspicious_pattern'].map(type => (
                      <Stack key={type} direction="horizontal" className="justify-between">
                        <Body className="capitalize text-on-dark-muted">{type.replace('_', ' ')}</Body>
                        <Body className="font-display text-white">{alerts.filter((a: ScalpingAlert) => a.type === type).length}</Body>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
              <Card inverted className="p-6">
                <Stack gap={4}>
                  <H3 className="text-white">Protection Effectiveness</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-on-dark-muted">Tickets Protected</Body>
                      <Body className="font-display text-success">{ticketsProtected}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-on-dark-muted">Scalpers Blocked</Body>
                      <Body className="font-display text-white">{blocked.length}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-on-dark-muted">Detection Rate</Body>
                      <Body className="font-display text-white">98.5%</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-on-dark-muted">False Positive Rate</Body>
                      <Body className="font-display text-success">0.3%</Body>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          )}

          <Button variant="outlineInk" onClick={() => router.push('/admin')}>
            Back to Admin
          </Button>
          </Stack>

      <Modal open={!!selectedAlert} onClose={() => setSelectedAlert(null)}>
        <ModalHeader><H3>Alert Details</H3></ModalHeader>
        <ModalBody>
          {selectedAlert && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                {getSeverityBadge(selectedAlert.severity)}
                {getTypeBadge(selectedAlert.type)}
                {getStatusBadge(selectedAlert.status)}
              </Stack>
              <Body className="font-weight-bold text-h6-md">{selectedAlert.event_name}</Body>
              <Body>{selectedAlert.details}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label className="text-ink-500">Ticket Count</Label>
                  <Body className="font-weight-bold">{selectedAlert.ticket_count}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-ink-500">Detected At</Label>
                  <Body>{new Date(selectedAlert.created_at).toLocaleString()}</Body>
                </Stack>
                {selectedAlert.ip_address && (
                  <Stack gap={1}>
                    <Label className="text-ink-500">IP Address</Label>
                    <Body className="font-mono">{selectedAlert.ip_address}</Body>
                  </Stack>
                )}
                {selectedAlert.user_email && (
                  <Stack gap={1}>
                    <Label className="text-ink-500">Email</Label>
                    <Body>{selectedAlert.user_email}</Body>
                  </Stack>
                )}
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedAlert(null)}>Close</Button>
          {selectedAlert?.status === 'pending' && (
            <>
              <Button variant="outline" onClick={() => { handleUpdateAlertStatus(selectedAlert.id, 'cleared'); setSelectedAlert(null); }}>
                Clear
              </Button>
              <Button variant="solid" onClick={() => { handleUpdateAlertStatus(selectedAlert.id, 'blocked'); setSelectedAlert(null); }}>
                Block
              </Button>
            </>
          )}
        </ModalFooter>
      </Modal>

      <Modal open={showBlockModal} onClose={() => setShowBlockModal(false)}>
        <ModalHeader><H3>Block Entity</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Field label="Type">
              <Select
                value={newBlock.type}
                onChange={(e) => setNewBlock({ ...newBlock, type: e.target.value })}
              >
                <option value="ip">IP Address</option>
                <option value="email">Email</option>
                <option value="device">Device ID</option>
                <option value="payment_method">Payment Method</option>
              </Select>
            </Field>
            <Field label="Value">
              <Input
                value={newBlock.value}
                onChange={(e) => setNewBlock({ ...newBlock, value: e.target.value })}
                placeholder={newBlock.type === 'ip' ? '192.168.1.1' : newBlock.type === 'email' ? 'email@example.com' : 'Enter value...'}
              />
            </Field>
            <Field label="Reason">
              <Textarea
                value={newBlock.reason}
                onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
                placeholder="Reason for blocking..."
                rows={2}
              />
            </Field>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowBlockModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={handleAddBlock}>Block</Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}

export default function AntiScalpingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <AntiScalpingPageContent />
    </Suspense>
  );
}
