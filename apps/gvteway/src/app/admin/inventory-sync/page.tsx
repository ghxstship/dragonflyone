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

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  online_quantity: number;
  physical_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  sync_status: 'synced' | 'pending' | 'conflict' | 'error';
  last_sync: string;
  locations: InventoryLocation[];
}

interface InventoryLocation {
  id: string;
  name: string;
  type: 'warehouse' | 'venue' | 'booth' | 'online';
  quantity: number;
  last_updated: string;
}

interface SyncLog {
  id: string;
  timestamp: string;
  type: 'auto' | 'manual' | 'adjustment';
  items_synced: number;
  conflicts: number;
  status: 'completed' | 'failed' | 'partial';
  duration_ms: number;
}

const mockInventory: InventoryItem[] = [
  { id: 'INV-001', sku: 'TSHIRT-BLK-M', name: 'Tour T-Shirt Black (M)', category: 'Apparel', online_quantity: 150, physical_quantity: 148, reserved_quantity: 12, available_quantity: 136, sync_status: 'synced', last_sync: '2024-11-24T14:30:00Z', locations: [{ id: 'LOC-001', name: 'Main Warehouse', type: 'warehouse', quantity: 100, last_updated: '2024-11-24T14:30:00Z' }, { id: 'LOC-002', name: 'Venue Booth A', type: 'booth', quantity: 48, last_updated: '2024-11-24T14:25:00Z' }] },
  { id: 'INV-002', sku: 'HOODIE-GRY-L', name: 'Tour Hoodie Gray (L)', category: 'Apparel', online_quantity: 75, physical_quantity: 72, reserved_quantity: 5, available_quantity: 67, sync_status: 'conflict', last_sync: '2024-11-24T14:28:00Z', locations: [{ id: 'LOC-001', name: 'Main Warehouse', type: 'warehouse', quantity: 50, last_updated: '2024-11-24T14:28:00Z' }, { id: 'LOC-003', name: 'Venue Booth B', type: 'booth', quantity: 22, last_updated: '2024-11-24T14:20:00Z' }] },
  { id: 'INV-003', sku: 'POSTER-LTD', name: 'Limited Edition Poster', category: 'Collectibles', online_quantity: 200, physical_quantity: 200, reserved_quantity: 45, available_quantity: 155, sync_status: 'synced', last_sync: '2024-11-24T14:32:00Z', locations: [{ id: 'LOC-001', name: 'Main Warehouse', type: 'warehouse', quantity: 200, last_updated: '2024-11-24T14:32:00Z' }] },
  { id: 'INV-004', sku: 'CAP-BLK', name: 'Snapback Cap Black', category: 'Accessories', online_quantity: 85, physical_quantity: 85, reserved_quantity: 8, available_quantity: 77, sync_status: 'synced', last_sync: '2024-11-24T14:30:00Z', locations: [{ id: 'LOC-001', name: 'Main Warehouse', type: 'warehouse', quantity: 60, last_updated: '2024-11-24T14:30:00Z' }, { id: 'LOC-002', name: 'Venue Booth A', type: 'booth', quantity: 25, last_updated: '2024-11-24T14:30:00Z' }] },
  { id: 'INV-005', sku: 'VINYL-ALBUM', name: 'Vinyl Album', category: 'Music', online_quantity: 50, physical_quantity: 48, reserved_quantity: 3, available_quantity: 45, sync_status: 'pending', last_sync: '2024-11-24T14:15:00Z', locations: [{ id: 'LOC-001', name: 'Main Warehouse', type: 'warehouse', quantity: 48, last_updated: '2024-11-24T14:15:00Z' }] },
];

const mockSyncLogs: SyncLog[] = [
  { id: 'LOG-001', timestamp: '2024-11-24T14:30:00Z', type: 'auto', items_synced: 156, conflicts: 0, status: 'completed', duration_ms: 1250 },
  { id: 'LOG-002', timestamp: '2024-11-24T14:00:00Z', type: 'auto', items_synced: 154, conflicts: 2, status: 'partial', duration_ms: 1890 },
  { id: 'LOG-003', timestamp: '2024-11-24T13:30:00Z', type: 'manual', items_synced: 158, conflicts: 0, status: 'completed', duration_ms: 980 },
  { id: 'LOG-004', timestamp: '2024-11-24T13:00:00Z', type: 'auto', items_synced: 155, conflicts: 1, status: 'partial', duration_ms: 1450 },
];

export default function InventorySyncPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(mockSyncLogs);
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState({ status: '', category: '' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    setInventory(inventory.map(item => ({
      ...item,
      sync_status: 'synced' as const,
      last_sync: new Date().toISOString(),
      physical_quantity: item.online_quantity,
    })));
    setSyncLogs([{
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'manual',
      items_synced: inventory.length,
      conflicts: 0,
      status: 'completed',
      duration_ms: 2000,
    }, ...syncLogs]);
    setIsSyncing(false);
    setSuccess('Inventory synchronized successfully');
  };

  const handleResolveConflict = (itemId: string, resolution: 'online' | 'physical') => {
    setInventory(inventory.map(item => {
      if (item.id === itemId) {
        const quantity = resolution === 'online' ? item.online_quantity : item.physical_quantity;
        return {
          ...item,
          online_quantity: quantity,
          physical_quantity: quantity,
          sync_status: 'synced' as const,
          last_sync: new Date().toISOString(),
        };
      }
      return item;
    }));
    setSuccess('Conflict resolved');
  };

  const getSyncStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      synced: 'bg-green-500 text-white',
      pending: 'bg-yellow-500 text-black',
      conflict: 'bg-red-500 text-white',
      error: 'bg-red-600 text-white',
      completed: 'bg-green-500 text-white',
      failed: 'bg-red-500 text-white',
      partial: 'bg-yellow-500 text-black',
    };
    return <Badge className={colors[status] || ''}>{status}</Badge>;
  };

  const filteredInventory = inventory.filter(item => {
    const matchesStatus = !filter.status || item.sync_status === filter.status;
    const matchesCategory = !filter.category || item.category === filter.category;
    return matchesStatus && matchesCategory;
  });

  const categories = [...new Set(inventory.map(i => i.category))];
  const conflictCount = inventory.filter(i => i.sync_status === 'conflict').length;
  const pendingCount = inventory.filter(i => i.sync_status === 'pending').length;
  const totalItems = inventory.reduce((sum, i) => sum + i.available_quantity, 0);

  return (
    <Section className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack direction="horizontal" className="justify-between items-start">
            <Stack gap={2}>
              <H1>INVENTORY SYNCHRONIZATION</H1>
              <Body className="text-gray-600">Real-time inventory sync between online and physical locations</Body>
            </Stack>
            <Stack direction="horizontal" gap={2}>
              <Button variant="outline" onClick={() => router.push('/admin/inventory')}>
                Inventory
              </Button>
              <Button variant="solid" onClick={handleSync} disabled={isSyncing}>
                {isSyncing ? 'Syncing...' : 'Sync Now'}
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
            <StatCard label="Total Items" value={totalItems} className="border-2 border-black" />
            <StatCard label="Synced" value={inventory.filter(i => i.sync_status === 'synced').length} className="border-2 border-green-500" />
            <StatCard label="Conflicts" value={conflictCount} className={`border-2 ${conflictCount > 0 ? 'border-red-500' : 'border-black'}`} />
            <StatCard label="Pending" value={pendingCount} className="border-2 border-yellow-500" />
          </Grid>

          {conflictCount > 0 && (
            <Alert variant="error">
              ⚠️ {conflictCount} inventory conflict{conflictCount > 1 ? 's' : ''} require resolution
            </Alert>
          )}

          <Tabs>
            <TabsList>
              <Tab active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>
                Inventory Status
              </Tab>
              <Tab active={activeTab === 'conflicts'} onClick={() => setActiveTab('conflicts')}>
                Conflicts ({conflictCount})
              </Tab>
              <Tab active={activeTab === 'logs'} onClick={() => setActiveTab('logs')}>
                Sync Logs
              </Tab>
              <Tab active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
                Settings
              </Tab>
            </TabsList>
          </Tabs>

          {activeTab === 'inventory' && (
            <Stack gap={6}>
              <Stack direction="horizontal" gap={4}>
                <Field label="" className="w-48">
                  <Select
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                  >
                    <option value="">All Statuses</option>
                    <option value="synced">Synced</option>
                    <option value="pending">Pending</option>
                    <option value="conflict">Conflict</option>
                  </Select>
                </Field>
                <Field label="" className="w-48">
                  <Select
                    value={filter.category}
                    onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </Field>
              </Stack>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Online</TableHead>
                    <TableHead>Physical</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map(item => (
                    <TableRow key={item.id} className={item.sync_status === 'conflict' ? 'bg-red-50' : ''}>
                      <TableCell>
                        <Label className="font-mono">{item.sku}</Label>
                      </TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <Body>{item.name}</Body>
                          <Badge variant="outline">{item.category}</Badge>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Body className="font-bold">{item.online_quantity}</Body>
                      </TableCell>
                      <TableCell>
                        <Body className={item.online_quantity !== item.physical_quantity ? 'text-red-600 font-bold' : 'font-bold'}>
                          {item.physical_quantity}
                        </Body>
                      </TableCell>
                      <TableCell>
                        <Body className="text-yellow-600">{item.reserved_quantity}</Body>
                      </TableCell>
                      <TableCell>
                        <Body className="font-bold text-green-600">{item.available_quantity}</Body>
                      </TableCell>
                      <TableCell>
                        {getSyncStatusBadge(item.sync_status)}
                      </TableCell>
                      <TableCell>
                        <Label className="text-gray-500">
                          {new Date(item.last_sync).toLocaleTimeString()}
                        </Label>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}>
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}

          {activeTab === 'conflicts' && (
            <Stack gap={4}>
              {inventory.filter(i => i.sync_status === 'conflict').length === 0 ? (
                <Card className="p-8 text-center border-2 border-gray-200">
                  <Body className="text-gray-500">No conflicts to resolve</Body>
                </Card>
              ) : (
                inventory.filter(i => i.sync_status === 'conflict').map(item => (
                  <Card key={item.id} className="p-4 border-2 border-red-300">
                    <Grid cols={4} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-bold">{item.name}</Body>
                        <Label className="font-mono text-gray-500">{item.sku}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label className="text-gray-500">Online Quantity</Label>
                        <Body className="font-bold text-blue-600">{item.online_quantity}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Label className="text-gray-500">Physical Quantity</Label>
                        <Body className="font-bold text-orange-600">{item.physical_quantity}</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm" onClick={() => handleResolveConflict(item.id, 'online')}>
                          Use Online
                        </Button>
                        <Button variant="solid" size="sm" onClick={() => handleResolveConflict(item.id, 'physical')}>
                          Use Physical
                        </Button>
                      </Stack>
                    </Grid>
                  </Card>
                ))
              )}
            </Stack>
          )}

          {activeTab === 'logs' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Items Synced</TableHead>
                  <TableHead>Conflicts</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Label>{new Date(log.timestamp).toLocaleString()}</Label>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{log.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Body className="font-bold">{log.items_synced}</Body>
                    </TableCell>
                    <TableCell>
                      <Body className={log.conflicts > 0 ? 'text-red-600' : ''}>{log.conflicts}</Body>
                    </TableCell>
                    <TableCell>
                      <Label className="text-gray-500">{log.duration_ms}ms</Label>
                    </TableCell>
                    <TableCell>
                      {getSyncStatusBadge(log.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeTab === 'settings' && (
            <Grid cols={2} gap={6}>
              <Card className="p-6 border-2 border-black">
                <Stack gap={4}>
                  <H3>Auto-Sync Settings</H3>
                  <Field label="Sync Interval">
                    <Select defaultValue="30">
                      <option value="5">Every 5 minutes</option>
                      <option value="15">Every 15 minutes</option>
                      <option value="30">Every 30 minutes</option>
                      <option value="60">Every hour</option>
                    </Select>
                  </Field>
                  <Field label="Conflict Resolution">
                    <Select defaultValue="manual">
                      <option value="manual">Manual Review</option>
                      <option value="online">Prefer Online</option>
                      <option value="physical">Prefer Physical</option>
                    </Select>
                  </Field>
                  <Stack gap={2}>
                    <Label>Auto-Sync Status</Label>
                    <Badge className="bg-green-500 text-white w-fit">Enabled</Badge>
                  </Stack>
                  <Button variant="solid">Save Settings</Button>
                </Stack>
              </Card>
              <Card className="p-6 border-2 border-black">
                <Stack gap={4}>
                  <H3>Notifications</H3>
                  <Stack gap={2}>
                    <Label>Alert on Conflicts</Label>
                    <Badge className="bg-green-500 text-white w-fit">Enabled</Badge>
                  </Stack>
                  <Stack gap={2}>
                    <Label>Low Stock Alerts</Label>
                    <Badge className="bg-green-500 text-white w-fit">Enabled</Badge>
                  </Stack>
                  <Field label="Low Stock Threshold">
                    <Input type="number" defaultValue="10" />
                  </Field>
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

      <Modal open={!!selectedItem} onClose={() => setSelectedItem(null)}>
        <ModalHeader><H3>Inventory Details</H3></ModalHeader>
        <ModalBody>
          {selectedItem && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Body className="font-bold text-xl">{selectedItem.name}</Body>
                <Label className="font-mono text-gray-500">{selectedItem.sku}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label className="text-gray-500">Online Quantity</Label>
                  <Body className="font-bold">{selectedItem.online_quantity}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-gray-500">Physical Quantity</Label>
                  <Body className="font-bold">{selectedItem.physical_quantity}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-gray-500">Reserved</Label>
                  <Body className="font-bold text-yellow-600">{selectedItem.reserved_quantity}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-gray-500">Available</Label>
                  <Body className="font-bold text-green-600">{selectedItem.available_quantity}</Body>
                </Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="text-gray-500">Locations</Label>
                {selectedItem.locations.map(loc => (
                  <Card key={loc.id} className="p-3 border">
                    <Stack direction="horizontal" className="justify-between">
                      <Stack gap={1}>
                        <Body>{loc.name}</Body>
                        <Badge variant="outline" className="capitalize">{loc.type}</Badge>
                      </Stack>
                      <Stack gap={1} className="text-right">
                        <Body className="font-bold">{loc.quantity}</Body>
                        <Label className="text-xs text-gray-400">
                          {new Date(loc.last_updated).toLocaleTimeString()}
                        </Label>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedItem(null)}>Close</Button>
          <Button variant="solid">Adjust Inventory</Button>
        </ModalFooter>
      </Modal>
    </Section>
  );
}
