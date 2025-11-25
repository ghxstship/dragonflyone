'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  H1,
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
  LoadingSpinner,
  StatCard,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ghxstship/ui';

interface ScalpingAlert {
  id: string;
  type: 'bulk_purchase' | 'rapid_checkout' | 'suspicious_pattern' | 'bot_detected' | 'resale_listing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  event_id: string;
  event_name: string;
  details: string;
  ip_address?: string;
  user_id?: string;
  user_email?: string;
  ticket_count: number;
  status: 'pending' | 'investigating' | 'blocked' | 'cleared';
  created_at: string;
}

interface ProtectionRule {
  id: string;
  name: string;
  type: 'purchase_limit' | 'velocity_check' | 'captcha' | 'verification' | 'ip_block' | 'device_fingerprint';
  enabled: boolean;
  threshold?: number;
  action: 'warn' | 'block' | 'require_verification' | 'flag_review';
  description: string;
}

interface BlockedEntity {
  id: string;
  type: 'ip' | 'email' | 'device' | 'payment_method';
  value: string;
  reason: string;
  blocked_at: string;
  expires_at?: string;
}

const mockAlerts: ScalpingAlert[] = [
  { id: 'ALT-001', type: 'bulk_purchase', severity: 'high', event_id: 'EVT-001', event_name: 'Summer Fest 2024', details: 'Attempted purchase of 50 tickets in single transaction', ip_address: '192.168.1.100', user_email: 'suspicious@email.com', ticket_count: 50, status: 'blocked', created_at: '2024-11-24T14:30:00Z' },
  { id: 'ALT-002', type: 'bot_detected', severity: 'critical', event_id: 'EVT-001', event_name: 'Summer Fest 2024', details: 'Automated checkout behavior detected', ip_address: '10.0.0.55', ticket_count: 20, status: 'blocked', created_at: '2024-11-24T14:25:00Z' },
  { id: 'ALT-003', type: 'rapid_checkout', severity: 'medium', event_id: 'EVT-002', event_name: 'Fall Concert', details: 'Multiple purchases from same IP within 2 minutes', ip_address: '172.16.0.88', user_email: 'buyer@email.com', ticket_count: 12, status: 'investigating', created_at: '2024-11-24T13:45:00Z' },
  { id: 'ALT-004', type: 'resale_listing', severity: 'high', event_id: 'EVT-001', event_name: 'Summer Fest 2024', details: 'Tickets listed on secondary market above face value', user_email: 'reseller@email.com', ticket_count: 8, status: 'pending', created_at: '2024-11-24T12:00:00Z' },
  { id: 'ALT-005', type: 'suspicious_pattern', severity: 'low', event_id: 'EVT-003', event_name: 'Winter Gala', details: 'Multiple accounts created from same device', ticket_count: 6, status: 'cleared', created_at: '2024-11-24T10:30:00Z' },
];

const mockRules: ProtectionRule[] = [
  { id: 'RULE-001', name: 'Purchase Limit', type: 'purchase_limit', enabled: true, threshold: 8, action: 'block', description: 'Maximum tickets per transaction' },
  { id: 'RULE-002', name: 'Velocity Check', type: 'velocity_check', enabled: true, threshold: 3, action: 'require_verification', description: 'Max purchases per hour from same IP' },
  { id: 'RULE-003', name: 'CAPTCHA Challenge', type: 'captcha', enabled: true, action: 'require_verification', description: 'Require CAPTCHA for suspicious behavior' },
  { id: 'RULE-004', name: 'ID Verification', type: 'verification', enabled: false, action: 'require_verification', description: 'Require ID verification for high-value purchases' },
  { id: 'RULE-005', name: 'Device Fingerprinting', type: 'device_fingerprint', enabled: true, action: 'flag_review', description: 'Track and flag multiple accounts per device' },
  { id: 'RULE-006', name: 'Known Bot IPs', type: 'ip_block', enabled: true, action: 'block', description: 'Block known bot and proxy IP addresses' },
];

const mockBlocked: BlockedEntity[] = [
  { id: 'BLK-001', type: 'ip', value: '192.168.1.100', reason: 'Bulk purchase attempt', blocked_at: '2024-11-24T14:30:00Z' },
  { id: 'BLK-002', type: 'ip', value: '10.0.0.55', reason: 'Bot activity detected', blocked_at: '2024-11-24T14:25:00Z' },
  { id: 'BLK-003', type: 'email', value: 'scalper@email.com', reason: 'Confirmed scalping activity', blocked_at: '2024-11-20T09:00:00Z' },
];

export default function AntiScalpingPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<ScalpingAlert[]>(mockAlerts);
  const [rules, setRules] = useState<ProtectionRule[]>(mockRules);
  const [blocked, setBlocked] = useState<BlockedEntity[]>(mockBlocked);
  const [activeTab, setActiveTab] = useState('alerts');
  const [selectedAlert, setSelectedAlert] = useState<ScalpingAlert | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [filter, setFilter] = useState({ severity: '', status: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newBlock, setNewBlock] = useState({
    type: 'ip',
    value: '',
    reason: '',
  });

  const handleUpdateAlertStatus = (alertId: string, newStatus: ScalpingAlert['status']) => {
    setAlerts(alerts.map(a =>
      a.id === alertId ? { ...a, status: newStatus } : a
    ));
    setSuccess(`Alert ${newStatus === 'blocked' ? 'blocked' : newStatus === 'cleared' ? 'cleared' : 'updated'}`);
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(rules.map(r =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const handleAddBlock = () => {
    if (!newBlock.value || !newBlock.reason) {
      setError('Please fill in all fields');
      return;
    }

    const block: BlockedEntity = {
      id: `BLK-${Date.now()}`,
      type: newBlock.type as BlockedEntity['type'],
      value: newBlock.value,
      reason: newBlock.reason,
      blocked_at: new Date().toISOString(),
    };

    setBlocked([block, ...blocked]);
    setShowBlockModal(false);
    setNewBlock({ type: 'ip', value: '', reason: '' });
    setSuccess('Entity blocked successfully');
  };

  const handleRemoveBlock = (blockId: string) => {
    setBlocked(blocked.filter(b => b.id !== blockId));
    setSuccess('Block removed');
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-600 text-white',
      high: 'bg-red-500 text-white',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-green-500 text-white',
    };
    return <Badge className={colors[severity] || ''}>{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500 text-black',
      investigating: 'bg-blue-500 text-white',
      blocked: 'bg-red-500 text-white',
      cleared: 'bg-green-500 text-white',
    };
    return <Badge className={colors[status] || ''}>{status}</Badge>;
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

  const filteredAlerts = alerts.filter(a => {
    const matchesSeverity = !filter.severity || a.severity === filter.severity;
    const matchesStatus = !filter.status || a.status === filter.status;
    return matchesSeverity && matchesStatus;
  });

  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'blocked' && a.status !== 'cleared').length;
  const blockedToday = alerts.filter(a => a.status === 'blocked').length;
  const ticketsProtected = alerts.filter(a => a.status === 'blocked').reduce((sum, a) => sum + a.ticket_count, 0);

  return (
    <Section className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack direction="horizontal" className="justify-between items-start">
            <Stack gap={2}>
              <H1>ANTI-SCALPING PROTECTION</H1>
              <Body className="text-gray-600">Monitor and prevent ticket scalping and fraud</Body>
            </Stack>
            <Stack direction="horizontal" gap={2}>
              <Button variant="outline" onClick={() => setShowBlockModal(true)}>
                Block Entity
              </Button>
              <Button variant="solid" onClick={() => router.push('/admin/settings')}>
                Settings
              </Button>
            </Stack>
          </Stack>

          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Grid cols={4} gap={6}>
            <StatCard label="Active Alerts" value={alerts.filter(a => a.status === 'pending' || a.status === 'investigating').length} className="border-2 border-black" />
            <StatCard label="Critical" value={criticalCount} className="border-2 border-red-500" />
            <StatCard label="Blocked Today" value={blockedToday} className="border-2 border-black" />
            <StatCard label="Tickets Protected" value={ticketsProtected} className="border-2 border-green-500" />
          </Grid>

          {criticalCount > 0 && (
            <Alert variant="error">
              ⚠️ {criticalCount} critical alert{criticalCount > 1 ? 's' : ''} requiring immediate attention
            </Alert>
          )}

          <Tabs>
            <TabsList>
              <Tab active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')}>
                Alerts ({alerts.filter(a => a.status === 'pending').length})
              </Tab>
              <Tab active={activeTab === 'rules'} onClick={() => setActiveTab('rules')}>
                Protection Rules
              </Tab>
              <Tab active={activeTab === 'blocked'} onClick={() => setActiveTab('blocked')}>
                Blocked List
              </Tab>
              <Tab active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
                Analytics
              </Tab>
            </TabsList>
          </Tabs>

          {activeTab === 'alerts' && (
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
                {filteredAlerts.map(alert => (
                  <Card key={alert.id} className={`p-4 border-2 ${alert.severity === 'critical' ? 'border-red-500' : alert.severity === 'high' ? 'border-red-300' : 'border-gray-200'}`}>
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={2}>
                        <Stack direction="horizontal" gap={2}>
                          {getSeverityBadge(alert.severity)}
                          {getTypeBadge(alert.type)}
                        </Stack>
                        <Body className="font-bold">{alert.event_name}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Label className="text-gray-500">Details</Label>
                        <Body className="text-sm">{alert.details}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Label className="text-gray-500">Tickets</Label>
                        <Body className="font-bold">{alert.ticket_count}</Body>
                      </Stack>
                      <Stack gap={1}>
                        {getStatusBadge(alert.status)}
                        <Label className="text-xs text-gray-400">
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

          {activeTab === 'rules' && (
            <Stack gap={4}>
              {rules.map(rule => (
                <Card key={rule.id} className={`p-4 border-2 ${rule.enabled ? 'border-green-300' : 'border-gray-200'}`}>
                  <Grid cols={4} gap={4} className="items-center">
                    <Stack gap={1}>
                      <Body className="font-bold">{rule.name}</Body>
                      <Label className="text-gray-500">{rule.description}</Label>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-gray-500">Type</Label>
                      <Badge variant="outline">{rule.type.replace('_', ' ')}</Badge>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-gray-500">Action</Label>
                      <Badge variant={rule.action === 'block' ? 'solid' : 'outline'}>
                        {rule.action.replace('_', ' ')}
                      </Badge>
                      {rule.threshold && (
                        <Label className="text-xs text-gray-400">Threshold: {rule.threshold}</Label>
                      )}
                    </Stack>
                    <Stack direction="horizontal" gap={2} className="justify-end">
                      <Button variant="ghost" size="sm">Configure</Button>
                      <Button
                        variant={rule.enabled ? 'outline' : 'solid'}
                        size="sm"
                        onClick={() => handleToggleRule(rule.id)}
                      >
                        {rule.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </Stack>
                  </Grid>
                </Card>
              ))}
            </Stack>
          )}

          {activeTab === 'blocked' && (
            <Stack gap={4}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Blocked At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blocked.map(block => (
                    <TableRow key={block.id}>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">{block.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Body className="font-mono">{block.value}</Body>
                      </TableCell>
                      <TableCell>{block.reason}</TableCell>
                      <TableCell>
                        <Label className="text-gray-500">
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
            </Stack>
          )}

          {activeTab === 'analytics' && (
            <Grid cols={2} gap={6}>
              <Card className="p-6 border-2 border-black">
                <Stack gap={4}>
                  <H3>Detection Summary</H3>
                  <Stack gap={2}>
                    {['bulk_purchase', 'bot_detected', 'rapid_checkout', 'resale_listing', 'suspicious_pattern'].map(type => (
                      <Stack key={type} direction="horizontal" className="justify-between">
                        <Body className="capitalize">{type.replace('_', ' ')}</Body>
                        <Body className="font-bold">{alerts.filter(a => a.type === type).length}</Body>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
              <Card className="p-6 border-2 border-black">
                <Stack gap={4}>
                  <H3>Protection Effectiveness</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body>Tickets Protected</Body>
                      <Body className="font-bold text-green-600">{ticketsProtected}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body>Scalpers Blocked</Body>
                      <Body className="font-bold">{blocked.length}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body>Detection Rate</Body>
                      <Body className="font-bold">98.5%</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between">
                      <Body>False Positive Rate</Body>
                      <Body className="font-bold text-green-600">0.3%</Body>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          )}

          <Button variant="outline" onClick={() => router.push('/admin')}>
            Back to Admin
          </Button>
        </Stack>
      </Container>

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
              <Body className="font-bold text-xl">{selectedAlert.event_name}</Body>
              <Body>{selectedAlert.details}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label className="text-gray-500">Ticket Count</Label>
                  <Body className="font-bold">{selectedAlert.ticket_count}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-gray-500">Detected At</Label>
                  <Body>{new Date(selectedAlert.created_at).toLocaleString()}</Body>
                </Stack>
                {selectedAlert.ip_address && (
                  <Stack gap={1}>
                    <Label className="text-gray-500">IP Address</Label>
                    <Body className="font-mono">{selectedAlert.ip_address}</Body>
                  </Stack>
                )}
                {selectedAlert.user_email && (
                  <Stack gap={1}>
                    <Label className="text-gray-500">Email</Label>
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
    </Section>
  );
}
