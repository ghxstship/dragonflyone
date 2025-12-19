'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalTabState } from '@ghxstship/config/hooks';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  Container,
  H3,
  Body,
  Label,
  Grid,
  Stack,
  StatCard,
  Select,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Tabs,
  TabsList,
  Tab,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  EnterprisePageHeader,
  MainContent,
  Spinner,
  EmptyState,
} from '@ghxstship/ui';
import { useShipments, useCreateShipment, type Shipment } from '../../../hooks/useShipments';

const carriers = ['All', 'XPO Logistics', 'Old Dominion', 'FedEx Freight', 'Estes Express', 'YRC Freight'];

export default function LogisticsPage() {
  const router = useRouter();
  
  // Fetch shipments from API
  const { data: shipmentsData, isLoading, error, refetch } = useShipments();
  const createMutation = useCreateShipment();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useLocalTabState({
    storageKey: 'procurement-logistics-tab',
    defaultTab: 'active',
  });
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showNewShipmentModal, setShowNewShipmentModal] = useState(false);
  const [carrierFilter, setCarrierFilter] = useState('All');
  
  // New shipment form state
  const [newShipment, setNewShipment] = useState({
    origin: '',
    destination: '',
    carrier: '',
    ship_date: '',
    expected_delivery: '',
    items_count: 0,
    weight: 0,
    cost: 0,
  });

  const shipments = shipmentsData?.shipments || [];
  const summary = shipmentsData?.summary || { total: 0, active: 0, in_transit: 0, delayed: 0, total_cost: 0 };

  const filteredShipments = shipments.filter(s => {
    const matchesCarrier = carrierFilter === 'All' || s.carrier === carrierFilter;
    const matchesTab = activeTab === 'all' || (activeTab === 'active' ? s.status !== 'delivered' : s.status === 'delivered');
    return matchesCarrier && matchesTab;
  });
  
  const handleCreateShipment = async () => {
    try {
      await createMutation.mutateAsync({
        ...newShipment,
        items_count: Number(newShipment.items_count),
        weight: Number(newShipment.weight),
        cost: Number(newShipment.cost),
      });
      setShowNewShipmentModal(false);
      setNewShipment({
        origin: '',
        destination: '',
        carrier: '',
        ship_date: '',
        expected_delivery: '',
        items_count: 0,
        weight: 0,
        cost: 0,
      });
    } catch (err) {
      // Error handled by mutation
    }
  };
  
  if (isLoading) {
    return (
      <AtlvsAppLayout>
        <Stack className="flex min-h-[400px] items-center justify-center">
          <Spinner size="lg" />
          <Body className="text-on-dark-muted">Loading shipments...</Body>
        </Stack>
      </AtlvsAppLayout>
    );
  }
  
  if (error) {
    return (
      <AtlvsAppLayout>
        <EmptyState
          title="Failed to load shipments"
          description={error instanceof Error ? error.message : 'An error occurred'}
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      </AtlvsAppLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-success-400';
      case 'in_transit': return 'text-info-400';
      case 'scheduled': return 'text-ink-400';
      case 'delayed': return 'text-error-400';
      default: return 'text-ink-400';
    }
  };
  
  const formatStatus = (status: string) => {
    return status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="Freight & Logistics"
        subtitle="Coordinate shipments and track deliveries"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Active Shipments" value={summary.active} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="In Transit" value={summary.in_transit} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Delayed" value={summary.delayed} trend={summary.delayed > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Freight Cost" value={`$${summary.total_cost.toLocaleString()}`} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {summary.delayed > 0 && (
            <Alert variant="warning">{summary.delayed} shipment(s) are currently delayed</Alert>
          )}

          <Stack direction="horizontal" className="justify-between">
            <Stack direction="horizontal" gap={4}>
              <Tabs>
                <TabsList>
                  <Tab active={isActive('active')} onClick={() => setActiveTab('active')}>Active</Tab>
                  <Tab active={isActive('delivered')} onClick={() => setActiveTab('delivered')}>Delivered</Tab>
                  <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
                </TabsList>
              </Tabs>
              <Select value={carrierFilter} onChange={(e) => setCarrierFilter(e.target.value)} className="border-ink-700 bg-black text-white w-48">
                {carriers.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Stack>
            <Button variant="outlineWhite" onClick={() => setShowNewShipmentModal(true)}>New Shipment</Button>
          </Stack>

          <Table variant="dark" className="border-2 border-ink-800">
            <TableHeader>
              <TableRow className="bg-ink-900">
                <TableHead className="text-ink-400">Shipment</TableHead>
                <TableHead className="text-ink-400">Route</TableHead>
                <TableHead className="text-ink-400">Carrier</TableHead>
                <TableHead className="text-ink-400">Items/Weight</TableHead>
                <TableHead className="text-ink-400">Expected</TableHead>
                <TableHead className="text-ink-400">Cost</TableHead>
                <TableHead className="text-ink-400">Status</TableHead>
                <TableHead className="text-ink-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.map((shipment) => (
                <TableRow key={shipment.id} className={shipment.status === 'delayed' ? 'bg-error-900/10' : ''}>
                  <TableCell>
                    <Stack gap={0}>
                      <Label className="text-white">{shipment.project_name || 'Unassigned'}</Label>
                      <Label size="xs" className="text-ink-500">{shipment.id.substring(0, 8)}</Label>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack gap={0}>
                      <Label className="text-white">{shipment.origin}</Label>
                      <Label size="xs" className="text-ink-500">→ {shipment.destination}</Label>
                    </Stack>
                  </TableCell>
                  <TableCell><Label className="text-ink-300">{shipment.carrier}</Label></TableCell>
                  <TableCell>
                    <Stack gap={0}>
                      <Label className="text-white">{shipment.items_count} items</Label>
                      <Label size="xs" className="text-ink-500">{shipment.weight.toLocaleString()} lbs</Label>
                    </Stack>
                  </TableCell>
                  <TableCell><Label className="font-mono text-white">{shipment.expected_delivery}</Label></TableCell>
                  <TableCell><Label className="font-mono text-white">${shipment.cost.toLocaleString()}</Label></TableCell>
                  <TableCell><Label className={getStatusColor(shipment.status)}>{formatStatus(shipment.status)}</Label></TableCell>
                  <TableCell>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedShipment(shipment)}>Details</Button>
                      {shipment.tracking_number && <Button variant="outline" size="sm">Track</Button>}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

            <Button variant="outline" className="border-grey-700 text-grey-400" onClick={() => router.push('/procurement')}>Back to Procurement</Button>

      <Modal open={!!selectedShipment} onClose={() => setSelectedShipment(null)}>
        <ModalHeader><H3>Shipment Details</H3></ModalHeader>
        <ModalBody>
          {selectedShipment && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label className="text-ink-400">Project</Label>
                <Body className="text-white">{selectedShipment.project_name || 'Unassigned'}</Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedShipment.carrier}</Badge>
                <Label className={getStatusColor(selectedShipment.status)}>{formatStatus(selectedShipment.status)}</Label>
              </Stack>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Label className="text-ink-400">Origin</Label><Label className="text-white">{selectedShipment.origin}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Destination</Label><Label className="text-white">{selectedShipment.destination}</Label></Stack>
              </Grid>
              {selectedShipment.tracking_number && (
                <Stack gap={1}><Label className="text-ink-400">Tracking Number</Label><Label className="font-mono text-white">{selectedShipment.tracking_number}</Label></Stack>
              )}
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Label className="text-ink-400">Ship Date</Label><Label className="font-mono text-white">{selectedShipment.ship_date}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Expected Delivery</Label><Label className="font-mono text-white">{selectedShipment.expected_delivery}</Label></Stack>
              </Grid>
              <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                <Stack gap={1}><Label className="text-ink-400">Items</Label><Label className="font-mono text-white">{selectedShipment.items_count}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Weight</Label><Label className="font-mono text-white">{selectedShipment.weight.toLocaleString()} lbs</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Cost</Label><Label className="font-mono text-white">${selectedShipment.cost.toLocaleString()}</Label></Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedShipment(null)}>Close</Button>
          {selectedShipment?.tracking_number && <Button variant="solid">Track Shipment</Button>}
        </ModalFooter>
      </Modal>

      <Modal open={showNewShipmentModal} onClose={() => setShowNewShipmentModal(false)}>
        <ModalHeader><H3>New Shipment</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Input 
                placeholder="Origin City, State" 
                className="border-ink-700 bg-black text-white" 
                value={newShipment.origin}
                onChange={(e) => setNewShipment(prev => ({ ...prev, origin: e.target.value }))}
              />
              <Input 
                placeholder="Destination City, State" 
                className="border-ink-700 bg-black text-white" 
                value={newShipment.destination}
                onChange={(e) => setNewShipment(prev => ({ ...prev, destination: e.target.value }))}
              />
            </Grid>
            <Select 
              className="border-ink-700 bg-black text-white"
              value={newShipment.carrier}
              onChange={(e) => setNewShipment(prev => ({ ...prev, carrier: e.target.value }))}
            >
              <option value="">Select Carrier...</option>
              {carriers.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Stack gap={2}>
                <Label>Ship Date</Label>
                <Input 
                  type="date" 
                  className="border-ink-700 bg-black text-white" 
                  value={newShipment.ship_date}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, ship_date: e.target.value }))}
                />
              </Stack>
              <Stack gap={2}>
                <Label>Expected Delivery</Label>
                <Input 
                  type="date" 
                  className="border-ink-700 bg-black text-white" 
                  value={newShipment.expected_delivery}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, expected_delivery: e.target.value }))}
                />
              </Stack>
            </Grid>
            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              <Input 
                type="number" 
                placeholder="Items" 
                className="border-ink-700 bg-black text-white" 
                value={newShipment.items_count || ''}
                onChange={(e) => setNewShipment(prev => ({ ...prev, items_count: parseInt(e.target.value) || 0 }))}
              />
              <Input 
                type="number" 
                placeholder="Weight (lbs)" 
                className="border-ink-700 bg-black text-white" 
                value={newShipment.weight || ''}
                onChange={(e) => setNewShipment(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              />
              <Input 
                type="number" 
                placeholder="Cost ($)" 
                className="border-ink-700 bg-black text-white" 
                value={newShipment.cost || ''}
                onChange={(e) => setNewShipment(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
              />
            </Grid>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowNewShipmentModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={handleCreateShipment} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Shipment'}
          </Button>
        </ModalFooter>
      </Modal>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
