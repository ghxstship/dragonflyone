'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useTabState } from '@ghxstship/config/hooks';
import { CreditCard, Smartphone, Watch, QrCode, Wifi, RotateCcw, Power } from 'lucide-react';
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
  DEMO_PAYMENT_TERMINALS,
  DEMO_POS_TRANSACTIONS,
  DEMO_PAYMENT_METHODS,
  type DemoPaymentTerminal as PaymentTerminal,
  type DemoTransaction as Transaction,
  type DemoPaymentMethod as PaymentMethod,
} from '@/lib/demo-data';

const mockTerminals = DEMO_PAYMENT_TERMINALS;
const mockTransactions = DEMO_POS_TRANSACTIONS;
const mockPaymentMethods = DEMO_PAYMENT_METHODS;

function CashlessPaymentPageContent() {
  const router = useRouter();
  const [terminals, setTerminals] = useState<PaymentTerminal[]>(mockTerminals);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'terminals',
    validTabs: ['terminals', 'transactions', 'methods', 'settings'],
  });
  const [selectedTerminal, setSelectedTerminal] = useState<PaymentTerminal | null>(null);
  const [filter, setFilter] = useState({ status: '', location: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggleMethod = (methodId: string) => {
    setPaymentMethods(paymentMethods.map(m =>
      m.id === methodId ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const handleTerminalStatusChange = (terminalId: string, newStatus: 'online' | 'offline' | 'processing' | 'error') => {
    setTerminals(terminals.map(t =>
      t.id === terminalId ? { ...t, status: newStatus } : t
    ));
    setSuccess(`Terminal ${terminalId} status updated to ${newStatus}`);
  };

  const handleRefundTransaction = (transactionId: string) => {
    setTransactions(transactions.map(t =>
      t.id === transactionId ? { ...t, status: 'refunded' } : t
    ));
    setSuccess(`Transaction ${transactionId} refunded`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'solid' | 'outline' | 'ghost'> = {
      online: 'solid',
      offline: 'outline',
      processing: 'outline',
      error: 'solid',
      completed: 'solid',
      pending: 'outline',
      failed: 'solid',
      refunded: 'ghost',
    };
    return <Badge variant={variants[status] || 'ghost'}>{status}</Badge>;
  };

  const getMethodIcon = (method: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      tap: <Wifi className="size-4" />,
      chip: <CreditCard className="size-4" />,
      swipe: <CreditCard className="size-4" />,
      nfc: <Smartphone className="size-4" />,
      qr: <QrCode className="size-4" />,
      wristband: <Watch className="size-4" />,
    };
    return iconMap[method] || <CreditCard className="size-4" />;
  };

  const filteredTerminals = terminals.filter(t => {
    const matchesStatus = !filter.status || t.status === filter.status;
    const matchesLocation = !filter.location || t.location === filter.location;
    return matchesStatus && matchesLocation;
  });

  const totalRevenue = terminals.reduce((sum, t) => sum + t.revenue_today, 0);
  const totalTransactions = terminals.reduce((sum, t) => sum + t.transactions_today, 0);
  const onlineTerminals = terminals.filter(t => t.status === 'online').length;
  const locations = [...new Set(terminals.map(t => t.location))];

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Admin</Kicker>
                <H2 size="lg" className="text-white">Cashless Payments</H2>
                <Body className="text-on-dark-muted">Manage payment terminals and cashless transactions</Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Button variant="outlineInk" onClick={() => router.push('/admin/pos')}>
                  POS Dashboard
                </Button>
                <Button variant="solid" inverted>
                  Add Terminal
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

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Online Terminals" value={`${onlineTerminals}/${terminals.length}`} inverted />
              <StatCard label="Today's Revenue" value={`$${totalRevenue.toLocaleString()}`} inverted />
              <StatCard label="Transactions" value={totalTransactions.toString()} inverted />
              <StatCard label="Avg Transaction" value={`$${(totalRevenue / totalTransactions).toFixed(2)}`} inverted />
            </Grid>

          <Tabs>
            <TabsList>
              <Tab active={isActive('terminals')} onClick={() => setActiveTab('terminals')}>
                Terminals
              </Tab>
              <Tab active={isActive('transactions')} onClick={() => setActiveTab('transactions')}>
                Transactions
              </Tab>
              <Tab active={isActive('methods')} onClick={() => setActiveTab('methods')}>
                Payment Methods
              </Tab>
              <Tab active={isActive('settings')} onClick={() => setActiveTab('settings')}>
                Settings
              </Tab>
            </TabsList>
          </Tabs>

          {isActive('terminals') && (
            <Stack gap={6}>
              <Stack direction="horizontal" gap={4}>
                <Field label="" className="w-48">
                  <Select
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  >
                    <option value="">All Statuses</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="processing">Processing</option>
                  </Select>
                </Field>
                <Field label="" className="w-48">
                  <Select
                    value={filter.location}
                    onChange={(e) => setFilter({ ...filter, location: e.target.value })}
                  >
                    <option value="">All Locations</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </Select>
                </Field>
              </Stack>

              <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                {filteredTerminals.map(terminal => (
                  <Card key={terminal.id} inverted className={`p-4 ${terminal.status === 'online' ? 'ring-2 ring-success' : ''}`}>
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Stack gap={1}>
                          <Body className="font-display text-white">{terminal.name}</Body>
                          <Label className="text-on-dark-muted">{terminal.location}</Label>
                        </Stack>
                        {getStatusBadge(terminal.status)}
                      </Stack>

                      <Stack direction="horizontal" gap={2}>
                        <Badge variant="outline" className="capitalize">{terminal.type}</Badge>
                        {terminal.battery_level !== undefined && (
                          <Badge variant="outline">
                            🔋 {terminal.battery_level}%
                          </Badge>
                        )}
                      </Stack>

                      <Stack gap={1}>
                        <Label className="text-on-dark-muted">Supported Methods</Label>
                        <Stack direction="horizontal" gap={1}>
                          {terminal.supported_methods.map(method => (
                            <Label key={method}>{getMethodIcon(method)}</Label>
                          ))}
                        </Stack>
                      </Stack>

                      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                        <Stack gap={1}>
                          <Label className="text-on-dark-muted">Transactions</Label>
                          <Body className="font-display text-white">{terminal.transactions_today}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Label className="text-on-dark-muted">Revenue</Label>
                          <Body className="font-display text-success">${terminal.revenue_today.toLocaleString()}</Body>
                        </Stack>
                      </Grid>

                      <Stack direction="horizontal" gap={2}>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTerminal(terminal)}>
                          Details
                        </Button>
                        {terminal.status === 'offline' && (
                          <Button 
                            variant="solid" 
                            size="sm" 
                            inverted
                            onClick={() => handleTerminalStatusChange(terminal.id, 'online')}
                          >
                            <Power className="size-4 mr-1" /> Reconnect
                          </Button>
                        )}
                        {terminal.status === 'online' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTerminalStatusChange(terminal.id, 'offline')}
                          >
                            <Power className="size-4 mr-1" /> Disconnect
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          )}

          {isActive('transactions') && (
            <Card inverted className="overflow-hidden">
              <Table variant="dark">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead className="text-on-dark-muted">Time</TableHead>
                    <TableHead className="text-on-dark-muted">Terminal</TableHead>
                    <TableHead className="text-on-dark-muted">Amount</TableHead>
                    <TableHead className="text-on-dark-muted">Tip</TableHead>
                    <TableHead className="text-on-dark-muted">Method</TableHead>
                    <TableHead className="text-on-dark-muted">Card</TableHead>
                    <TableHead className="text-on-dark-muted">Status</TableHead>
                    <TableHead className="text-on-dark-muted">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(txn => (
                    <TableRow key={txn.id} className="border-b border-ink-700">
                      <TableCell>
                        <Label className="font-mono text-white">{new Date(txn.timestamp).toLocaleTimeString()}</Label>
                      </TableCell>
                      <TableCell>
                        <Body className="text-white">{txn.terminal_name}</Body>
                      </TableCell>
                      <TableCell>
                        <Body className="font-display text-white">${txn.amount.toFixed(2)}</Body>
                      </TableCell>
                      <TableCell>
                        {txn.tip_amount ? (
                          <Body className="text-success">+${txn.tip_amount.toFixed(2)}</Body>
                        ) : (
                          <Label className="text-on-dark-disabled">-</Label>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Label>{getMethodIcon(txn.payment_method)}</Label>
                          <Label className="capitalize text-white">{txn.payment_method}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {txn.card_type ? (
                          <Stack gap={1}>
                            <Label className="text-white">{txn.card_type}</Label>
                            {txn.card_last_four && (
                              <Label className="font-mono text-on-dark-disabled">****{txn.card_last_four}</Label>
                            )}
                          </Stack>
                        ) : (
                          <Label className="text-on-dark-disabled">-</Label>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(txn.status)}
                      </TableCell>
                      <TableCell>
                        {txn.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRefundTransaction(txn.id)}
                          >
                            <RotateCcw className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {isActive('methods') && (
            <Stack gap={4}>
              {paymentMethods.map(method => (
                <Card key={method.id} inverted className={`p-4 ${method.enabled ? '' : 'opacity-60'}`}>
                  <Grid cols={6} gap={4} className="items-center">
                    <Stack direction="horizontal" gap={3}>
                      <Label className="text-h4-md">{method.icon}</Label>
                      <Stack gap={1}>
                        <Body className="font-display text-white">{method.name}</Body>
                        <Badge variant="outline" className="capitalize">{method.type}</Badge>
                      </Stack>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-on-dark-muted">Processing Fee</Label>
                      <Body className="font-display text-white">{method.fee_percent}%</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-on-dark-muted">Speed</Label>
                      <Body className="text-on-dark-muted">{method.processing_time}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-on-dark-muted">Status</Label>
                      <Badge variant={method.enabled ? 'solid' : 'outline'}>
                        {method.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </Stack>
                    <Stack direction="horizontal" gap={2} className="col-span-2 justify-end">
                      <Button variant="ghost" size="sm">Configure</Button>
                      <Button
                        variant={method.enabled ? 'outlineInk' : 'solid'}
                        size="sm"
                        inverted={!method.enabled}
                        onClick={() => handleToggleMethod(method.id)}
                      >
                        {method.enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </Stack>
                  </Grid>
                </Card>
              ))}
            </Stack>
          )}

          {isActive('settings') && (
            <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
              <Card inverted className="p-6">
                <Stack gap={4}>
                  <H3 className="text-white">Processing Settings</H3>
                  <Field label="Default Tip Options" inverted>
                    <Input defaultValue="15%, 18%, 20%, 25%" inverted />
                  </Field>
                  <Field label="Minimum Transaction Amount" inverted>
                    <Input type="number" defaultValue="1.00" inverted />
                  </Field>
                  <Field label="Maximum Transaction Amount" inverted>
                    <Input type="number" defaultValue="10000.00" inverted />
                  </Field>
                  <Field label="Offline Transaction Limit" inverted>
                    <Input type="number" defaultValue="50.00" inverted />
                  </Field>
                  <Button variant="solid" inverted>Save Settings</Button>
                </Stack>
              </Card>
              <Card inverted className="p-6">
                <Stack gap={4}>
                  <H3 className="text-white">Security Settings</H3>
                  <Field label="Require PIN for transactions over" inverted>
                    <Input type="number" defaultValue="100.00" inverted />
                  </Field>
                  <Field label="Auto-logout timeout (minutes)" inverted>
                    <Input type="number" defaultValue="5" inverted />
                  </Field>
                  <Stack gap={2}>
                    <Label className="text-on-dark-muted">Fraud Detection</Label>
                    <Stack direction="horizontal" gap={2}>
                      <Badge variant="solid">Enabled</Badge>
                      <Button variant="ghost" size="sm">Configure</Button>
                    </Stack>
                  </Stack>
                  <Button variant="solid" inverted>Save Settings</Button>
                </Stack>
              </Card>
            </Grid>
          )}

          <Button variant="outlineInk" onClick={() => router.push('/admin')}>
            Back to Admin
          </Button>
          </Stack>

      <Modal open={!!selectedTerminal} onClose={() => setSelectedTerminal(null)}>
        <ModalHeader><H3>Terminal Details</H3></ModalHeader>
        <ModalBody>
          {selectedTerminal && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Body className="font-weight-bold text-h6-md">{selectedTerminal.name}</Body>
                {getStatusBadge(selectedTerminal.status)}
              </Stack>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Label className="text-ink-500">Location</Label>
                  <Body>{selectedTerminal.location}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-ink-500">Type</Label>
                  <Badge variant="outline" className="capitalize">{selectedTerminal.type}</Badge>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-ink-500">Transactions Today</Label>
                  <Body className="font-weight-bold">{selectedTerminal.transactions_today}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-ink-500">Revenue Today</Label>
                  <Body className="font-weight-bold text-success-600">${selectedTerminal.revenue_today.toLocaleString()}</Body>
                </Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="text-ink-500">Supported Payment Methods</Label>
                <Stack direction="horizontal" gap={2}>
                  {selectedTerminal.supported_methods.map(method => (
                    <Badge key={method} variant="outline">
                      {getMethodIcon(method)} {method}
                    </Badge>
                  ))}
                </Stack>
              </Stack>
              {selectedTerminal.last_transaction && (
                <Stack gap={1}>
                  <Label className="text-ink-500">Last Transaction</Label>
                  <Body>{new Date(selectedTerminal.last_transaction).toLocaleString()}</Body>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTerminal(null)}>Close</Button>
          <Button variant="solid">View Transactions</Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}

export default function CashlessPaymentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <CashlessPaymentPageContent />
    </Suspense>
  );
}
