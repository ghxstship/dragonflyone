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

interface PaymentTerminal {
  id: string;
  name: string;
  location: string;
  type: 'fixed' | 'mobile' | 'kiosk';
  status: 'online' | 'offline' | 'processing' | 'error';
  supported_methods: string[];
  last_transaction?: string;
  transactions_today: number;
  revenue_today: number;
  battery_level?: number;
}

interface Transaction {
  id: string;
  terminal_id: string;
  terminal_name: string;
  amount: number;
  tip_amount?: number;
  payment_method: 'tap' | 'chip' | 'swipe' | 'nfc' | 'qr' | 'wristband';
  card_type?: string;
  card_last_four?: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  timestamp: string;
  order_id?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'contactless' | 'chip' | 'swipe' | 'mobile' | 'wristband';
  icon: string;
  enabled: boolean;
  fee_percent: number;
  processing_time: string;
}

const mockTerminals: PaymentTerminal[] = [
  { id: 'TRM-001', name: 'Main Bar Terminal 1', location: 'Main Bar', type: 'fixed', status: 'online', supported_methods: ['tap', 'chip', 'swipe', 'nfc'], last_transaction: '2024-11-24T14:30:00Z', transactions_today: 245, revenue_today: 4850.50 },
  { id: 'TRM-002', name: 'Main Bar Terminal 2', location: 'Main Bar', type: 'fixed', status: 'online', supported_methods: ['tap', 'chip', 'swipe', 'nfc'], last_transaction: '2024-11-24T14:28:00Z', transactions_today: 198, revenue_today: 3920.25 },
  { id: 'TRM-003', name: 'Merch Booth A', location: 'Merchandise', type: 'fixed', status: 'online', supported_methods: ['tap', 'chip', 'swipe', 'nfc'], last_transaction: '2024-11-24T14:25:00Z', transactions_today: 156, revenue_today: 8750.00 },
  { id: 'TRM-004', name: 'Mobile Server 1', location: 'Floor', type: 'mobile', status: 'online', supported_methods: ['tap', 'nfc'], last_transaction: '2024-11-24T14:32:00Z', transactions_today: 89, revenue_today: 1780.75, battery_level: 78 },
  { id: 'TRM-005', name: 'Mobile Server 2', location: 'Floor', type: 'mobile', status: 'processing', supported_methods: ['tap', 'nfc'], transactions_today: 67, revenue_today: 1340.00, battery_level: 45 },
  { id: 'TRM-006', name: 'Self-Service Kiosk 1', location: 'Entrance', type: 'kiosk', status: 'online', supported_methods: ['tap', 'chip', 'nfc', 'qr'], last_transaction: '2024-11-24T14:29:00Z', transactions_today: 312, revenue_today: 6240.00 },
  { id: 'TRM-007', name: 'VIP Bar Terminal', location: 'VIP Area', type: 'fixed', status: 'offline', supported_methods: ['tap', 'chip', 'swipe', 'nfc'], transactions_today: 0, revenue_today: 0 },
];

const mockTransactions: Transaction[] = [
  { id: 'TXN-001', terminal_id: 'TRM-001', terminal_name: 'Main Bar Terminal 1', amount: 24.50, tip_amount: 5.00, payment_method: 'tap', card_type: 'Visa', card_last_four: '4242', status: 'completed', timestamp: '2024-11-24T14:30:00Z' },
  { id: 'TXN-002', terminal_id: 'TRM-003', terminal_name: 'Merch Booth A', amount: 85.00, payment_method: 'chip', card_type: 'Mastercard', card_last_four: '5555', status: 'completed', timestamp: '2024-11-24T14:28:00Z' },
  { id: 'TXN-003', terminal_id: 'TRM-004', terminal_name: 'Mobile Server 1', amount: 18.00, tip_amount: 4.00, payment_method: 'nfc', card_type: 'Apple Pay', status: 'completed', timestamp: '2024-11-24T14:25:00Z' },
  { id: 'TXN-004', terminal_id: 'TRM-006', terminal_name: 'Self-Service Kiosk 1', amount: 45.00, payment_method: 'qr', status: 'completed', timestamp: '2024-11-24T14:22:00Z' },
  { id: 'TXN-005', terminal_id: 'TRM-002', terminal_name: 'Main Bar Terminal 2', amount: 32.00, payment_method: 'swipe', card_type: 'Amex', card_last_four: '3782', status: 'failed', timestamp: '2024-11-24T14:20:00Z' },
];

const mockPaymentMethods: PaymentMethod[] = [
  { id: 'PM-001', name: 'Contactless (Tap)', type: 'contactless', icon: '📶', enabled: true, fee_percent: 2.6, processing_time: '< 2 sec' },
  { id: 'PM-002', name: 'Chip (EMV)', type: 'chip', icon: '💳', enabled: true, fee_percent: 2.4, processing_time: '3-5 sec' },
  { id: 'PM-003', name: 'Magnetic Swipe', type: 'swipe', icon: '📇', enabled: true, fee_percent: 2.9, processing_time: '2-3 sec' },
  { id: 'PM-004', name: 'Apple Pay / Google Pay', type: 'mobile', icon: '📱', enabled: true, fee_percent: 2.6, processing_time: '< 2 sec' },
  { id: 'PM-005', name: 'RFID Wristband', type: 'wristband', icon: '⌚', enabled: true, fee_percent: 1.5, processing_time: '< 1 sec' },
];

export default function CashlessPaymentPage() {
  const router = useRouter();
  const [terminals, setTerminals] = useState<PaymentTerminal[]>(mockTerminals);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [activeTab, setActiveTab] = useState('terminals');
  const [selectedTerminal, setSelectedTerminal] = useState<PaymentTerminal | null>(null);
  const [filter, setFilter] = useState({ status: '', location: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggleMethod = (methodId: string) => {
    setPaymentMethods(paymentMethods.map(m =>
      m.id === methodId ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      online: 'bg-green-500 text-white',
      offline: 'bg-red-500 text-white',
      processing: 'bg-yellow-500 text-black',
      error: 'bg-red-600 text-white',
      completed: 'bg-green-500 text-white',
      pending: 'bg-yellow-500 text-black',
      failed: 'bg-red-500 text-white',
      refunded: 'bg-gray-500 text-white',
    };
    return <Badge className={colors[status] || ''}>{status}</Badge>;
  };

  const getMethodIcon = (method: string) => {
    const icons: Record<string, string> = {
      tap: '📶',
      chip: '💳',
      swipe: '📇',
      nfc: '📱',
      qr: '📷',
      wristband: '⌚',
    };
    return icons[method] || '💳';
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
    <Section className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack direction="horizontal" className="justify-between items-start">
            <Stack gap={2}>
              <H1>CASHLESS PAYMENTS</H1>
              <Body className="text-gray-600">Manage payment terminals and cashless transactions</Body>
            </Stack>
            <Stack direction="horizontal" gap={2}>
              <Button variant="outline" onClick={() => router.push('/admin/pos')}>
                POS Dashboard
              </Button>
              <Button variant="solid">
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

          <Grid cols={4} gap={6}>
            <StatCard label="Online Terminals" value={`${onlineTerminals}/${terminals.length}`} className="border-2 border-green-500" />
            <StatCard label="Today's Revenue" value={`$${totalRevenue.toLocaleString()}`} className="border-2 border-black" />
            <StatCard label="Transactions" value={totalTransactions} className="border-2 border-black" />
            <StatCard label="Avg Transaction" value={`$${(totalRevenue / totalTransactions).toFixed(2)}`} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === 'terminals'} onClick={() => setActiveTab('terminals')}>
                Terminals
              </Tab>
              <Tab active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')}>
                Transactions
              </Tab>
              <Tab active={activeTab === 'methods'} onClick={() => setActiveTab('methods')}>
                Payment Methods
              </Tab>
              <Tab active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
                Settings
              </Tab>
            </TabsList>
          </Tabs>

          {activeTab === 'terminals' && (
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

              <Grid cols={3} gap={4}>
                {filteredTerminals.map(terminal => (
                  <Card key={terminal.id} className={`p-4 border-2 ${terminal.status === 'online' ? 'border-green-300' : terminal.status === 'offline' ? 'border-red-300' : 'border-gray-200'}`}>
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <Body className="font-bold">{terminal.name}</Body>
                          <Label className="text-gray-500">{terminal.location}</Label>
                        </Stack>
                        {getStatusBadge(terminal.status)}
                      </Stack>

                      <Stack direction="horizontal" gap={2}>
                        <Badge variant="outline" className="capitalize">{terminal.type}</Badge>
                        {terminal.battery_level !== undefined && (
                          <Badge variant="outline" className={terminal.battery_level < 20 ? 'text-red-500' : ''}>
                            🔋 {terminal.battery_level}%
                          </Badge>
                        )}
                      </Stack>

                      <Stack gap={1}>
                        <Label className="text-gray-500">Supported Methods</Label>
                        <Stack direction="horizontal" gap={1}>
                          {terminal.supported_methods.map(method => (
                            <Label key={method} className="text-lg">{getMethodIcon(method)}</Label>
                          ))}
                        </Stack>
                      </Stack>

                      <Grid cols={2} gap={4}>
                        <Stack gap={1}>
                          <Label className="text-gray-500">Transactions</Label>
                          <Body className="font-bold">{terminal.transactions_today}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Label className="text-gray-500">Revenue</Label>
                          <Body className="font-bold text-green-600">${terminal.revenue_today.toLocaleString()}</Body>
                        </Stack>
                      </Grid>

                      <Stack direction="horizontal" gap={2}>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTerminal(terminal)}>
                          Details
                        </Button>
                        {terminal.status === 'offline' && (
                          <Button variant="solid" size="sm">Reconnect</Button>
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          )}

          {activeTab === 'transactions' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Terminal</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Card</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(txn => (
                  <TableRow key={txn.id}>
                    <TableCell>
                      <Label className="font-mono">{new Date(txn.timestamp).toLocaleTimeString()}</Label>
                    </TableCell>
                    <TableCell>
                      <Body>{txn.terminal_name}</Body>
                    </TableCell>
                    <TableCell>
                      <Body className="font-bold">${txn.amount.toFixed(2)}</Body>
                    </TableCell>
                    <TableCell>
                      {txn.tip_amount ? (
                        <Body className="text-green-600">+${txn.tip_amount.toFixed(2)}</Body>
                      ) : (
                        <Label className="text-gray-400">-</Label>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="horizontal" gap={2}>
                        <Label className="text-lg">{getMethodIcon(txn.payment_method)}</Label>
                        <Label className="capitalize">{txn.payment_method}</Label>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {txn.card_type ? (
                        <Stack gap={1}>
                          <Label>{txn.card_type}</Label>
                          {txn.card_last_four && (
                            <Label className="text-gray-400 font-mono">****{txn.card_last_four}</Label>
                          )}
                        </Stack>
                      ) : (
                        <Label className="text-gray-400">-</Label>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(txn.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeTab === 'methods' && (
            <Stack gap={4}>
              {paymentMethods.map(method => (
                <Card key={method.id} className={`p-4 border-2 ${method.enabled ? 'border-green-300' : 'border-gray-200 opacity-60'}`}>
                  <Grid cols={6} gap={4} className="items-center">
                    <Stack direction="horizontal" gap={3}>
                      <Label className="text-3xl">{method.icon}</Label>
                      <Stack gap={1}>
                        <Body className="font-bold">{method.name}</Body>
                        <Badge variant="outline" className="capitalize">{method.type}</Badge>
                      </Stack>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-gray-500">Processing Fee</Label>
                      <Body className="font-bold">{method.fee_percent}%</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-gray-500">Speed</Label>
                      <Body>{method.processing_time}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-gray-500">Status</Label>
                      <Badge className={method.enabled ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                        {method.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </Stack>
                    <Stack direction="horizontal" gap={2} className="col-span-2 justify-end">
                      <Button variant="ghost" size="sm">Configure</Button>
                      <Button
                        variant={method.enabled ? 'outline' : 'solid'}
                        size="sm"
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

          {activeTab === 'settings' && (
            <Grid cols={2} gap={6}>
              <Card className="p-6 border-2 border-black">
                <Stack gap={4}>
                  <H3>Processing Settings</H3>
                  <Field label="Default Tip Options">
                    <Input defaultValue="15%, 18%, 20%, 25%" />
                  </Field>
                  <Field label="Minimum Transaction Amount">
                    <Input type="number" defaultValue="1.00" />
                  </Field>
                  <Field label="Maximum Transaction Amount">
                    <Input type="number" defaultValue="10000.00" />
                  </Field>
                  <Field label="Offline Transaction Limit">
                    <Input type="number" defaultValue="50.00" />
                  </Field>
                  <Button variant="solid">Save Settings</Button>
                </Stack>
              </Card>
              <Card className="p-6 border-2 border-black">
                <Stack gap={4}>
                  <H3>Security Settings</H3>
                  <Field label="Require PIN for transactions over">
                    <Input type="number" defaultValue="100.00" />
                  </Field>
                  <Field label="Auto-logout timeout (minutes)">
                    <Input type="number" defaultValue="5" />
                  </Field>
                  <Stack gap={2}>
                    <Label>Fraud Detection</Label>
                    <Stack direction="horizontal" gap={2}>
                      <Badge className="bg-green-500 text-white">Enabled</Badge>
                      <Button variant="ghost" size="sm">Configure</Button>
                    </Stack>
                  </Stack>
                  <Button variant="solid">Save Settings</Button>
                </Stack>
              </Card>
            </Grid>
          )}

          <Button variant="outline" onClick={() => router.push('/admin')}>
            Back to Admin
          </Button>
        </Stack>
      </Container>

      <Modal open={!!selectedTerminal} onClose={() => setSelectedTerminal(null)}>
        <ModalHeader><H3>Terminal Details</H3></ModalHeader>
        <ModalBody>
          {selectedTerminal && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Body className="font-bold text-xl">{selectedTerminal.name}</Body>
                {getStatusBadge(selectedTerminal.status)}
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label className="text-gray-500">Location</Label>
                  <Body>{selectedTerminal.location}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-gray-500">Type</Label>
                  <Badge variant="outline" className="capitalize">{selectedTerminal.type}</Badge>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-gray-500">Transactions Today</Label>
                  <Body className="font-bold">{selectedTerminal.transactions_today}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-gray-500">Revenue Today</Label>
                  <Body className="font-bold text-green-600">${selectedTerminal.revenue_today.toLocaleString()}</Body>
                </Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="text-gray-500">Supported Payment Methods</Label>
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
                  <Label className="text-gray-500">Last Transaction</Label>
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
    </Section>
  );
}
