'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';
import {
  Container, H3, Body, Label, Grid, Stack, StatCard, Select, Input,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section, Card, Tabs, TabsList, Tab, Badge, PageLayout, SectionHeader,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert, ProgressBar,
} from '@ghxstship/ui';

interface Shipment {
  id: string;
  projectId: string;
  projectName: string;
  origin: string;
  destination: string;
  carrier: string;
  trackingNumber?: string;
  shipDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  status: 'Scheduled' | 'In Transit' | 'Delivered' | 'Delayed';
  items: number;
  weight: number;
  cost: number;
}

const mockShipments: Shipment[] = [
  { id: 'SHP-001', projectId: 'PROJ-089', projectName: 'Summer Fest 2024', origin: 'Los Angeles, CA', destination: 'Las Vegas, NV', carrier: 'XPO Logistics', trackingNumber: 'XPO123456789', shipDate: '2024-11-22', expectedDelivery: '2024-11-24', status: 'In Transit', items: 45, weight: 12500, cost: 3500 },
  { id: 'SHP-002', projectId: 'PROJ-089', projectName: 'Summer Fest 2024', origin: 'Nashville, TN', destination: 'Las Vegas, NV', carrier: 'Old Dominion', trackingNumber: 'OD987654321', shipDate: '2024-11-21', expectedDelivery: '2024-11-25', status: 'In Transit', items: 28, weight: 8200, cost: 4200 },
  { id: 'SHP-003', projectId: 'PROJ-090', projectName: 'Corporate Gala', origin: 'New York, NY', destination: 'Chicago, IL', carrier: 'FedEx Freight', shipDate: '2024-11-28', expectedDelivery: '2024-11-30', status: 'Scheduled', items: 15, weight: 3500, cost: 1800 },
  { id: 'SHP-004', projectId: 'PROJ-088', projectName: 'Fall Festival', origin: 'Atlanta, GA', destination: 'Miami, FL', carrier: 'Estes Express', trackingNumber: 'EST456789012', shipDate: '2024-11-18', expectedDelivery: '2024-11-20', actualDelivery: '2024-11-20', status: 'Delivered', items: 32, weight: 9800, cost: 2900 },
  { id: 'SHP-005', projectId: 'PROJ-089', projectName: 'Summer Fest 2024', origin: 'Dallas, TX', destination: 'Las Vegas, NV', carrier: 'YRC Freight', trackingNumber: 'YRC789012345', shipDate: '2024-11-20', expectedDelivery: '2024-11-23', status: 'Delayed', items: 22, weight: 6500, cost: 2800 },
];

const carriers = ['All', 'XPO Logistics', 'Old Dominion', 'FedEx Freight', 'Estes Express', 'YRC Freight'];

export default function LogisticsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showNewShipmentModal, setShowNewShipmentModal] = useState(false);
  const [carrierFilter, setCarrierFilter] = useState('All');

  const activeShipments = mockShipments.filter(s => s.status !== 'Delivered');
  const delayedCount = mockShipments.filter(s => s.status === 'Delayed').length;
  const totalCost = mockShipments.reduce((sum, s) => sum + s.cost, 0);
  const inTransitCount = mockShipments.filter(s => s.status === 'In Transit').length;

  const filteredShipments = mockShipments.filter(s => {
    const matchesCarrier = carrierFilter === 'All' || s.carrier === carrierFilter;
    const matchesTab = activeTab === 'all' || (activeTab === 'active' ? s.status !== 'Delivered' : s.status === 'Delivered');
    return matchesCarrier && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-success-400';
      case 'In Transit': return 'text-info-400';
      case 'Scheduled': return 'text-ink-400';
      case 'Delayed': return 'text-error-400';
      default: return 'text-ink-400';
    }
  };

  return (
    <PageLayout background="black" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <SectionHeader
              kicker="ATLVS"
              title="Freight & Logistics"
              description="Coordinate shipments and track deliveries"
              colorScheme="on-dark"
              gap="lg"
            />

          <Grid cols={4} gap={6}>
            <StatCard label="Active Shipments" value={activeShipments.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="In Transit" value={inTransitCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Delayed" value={delayedCount} trend={delayedCount > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Freight Cost" value={`$${totalCost.toLocaleString()}`} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {delayedCount > 0 && (
            <Alert variant="warning">{delayedCount} shipment(s) are currently delayed</Alert>
          )}

          <Stack direction="horizontal" className="justify-between">
            <Stack direction="horizontal" gap={4}>
              <Tabs>
                <TabsList>
                  <Tab active={activeTab === 'active'} onClick={() => setActiveTab('active')}>Active</Tab>
                  <Tab active={activeTab === 'delivered'} onClick={() => setActiveTab('delivered')}>Delivered</Tab>
                  <Tab active={activeTab === 'all'} onClick={() => setActiveTab('all')}>All</Tab>
                </TabsList>
              </Tabs>
              <Select value={carrierFilter} onChange={(e) => setCarrierFilter(e.target.value)} className="border-ink-700 bg-black text-white w-48">
                {carriers.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Stack>
            <Button variant="outlineWhite" onClick={() => setShowNewShipmentModal(true)}>New Shipment</Button>
          </Stack>

          <Table className="border-2 border-ink-800">
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
                <TableRow key={shipment.id} className={shipment.status === 'Delayed' ? 'bg-error-900/10' : ''}>
                  <TableCell>
                    <Stack gap={0}>
                      <Label className="text-white">{shipment.projectName}</Label>
                      <Label size="xs" className="text-ink-500">{shipment.id}</Label>
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
                      <Label className="text-white">{shipment.items} items</Label>
                      <Label size="xs" className="text-ink-500">{shipment.weight.toLocaleString()} lbs</Label>
                    </Stack>
                  </TableCell>
                  <TableCell><Label className="font-mono text-white">{shipment.expectedDelivery}</Label></TableCell>
                  <TableCell><Label className="font-mono text-white">${shipment.cost.toLocaleString()}</Label></TableCell>
                  <TableCell><Label className={getStatusColor(shipment.status)}>{shipment.status}</Label></TableCell>
                  <TableCell>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedShipment(shipment)}>Details</Button>
                      {shipment.trackingNumber && <Button variant="outline" size="sm">Track</Button>}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

            <Button variant="outline" className="border-grey-700 text-grey-400" onClick={() => router.push('/procurement')}>Back to Procurement</Button>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedShipment} onClose={() => setSelectedShipment(null)}>
        <ModalHeader><H3>Shipment Details</H3></ModalHeader>
        <ModalBody>
          {selectedShipment && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label className="text-ink-400">Project</Label>
                <Body className="text-white">{selectedShipment.projectName}</Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedShipment.carrier}</Badge>
                <Label className={getStatusColor(selectedShipment.status)}>{selectedShipment.status}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Origin</Label><Label className="text-white">{selectedShipment.origin}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Destination</Label><Label className="text-white">{selectedShipment.destination}</Label></Stack>
              </Grid>
              {selectedShipment.trackingNumber && (
                <Stack gap={1}><Label className="text-ink-400">Tracking Number</Label><Label className="font-mono text-white">{selectedShipment.trackingNumber}</Label></Stack>
              )}
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Ship Date</Label><Label className="font-mono text-white">{selectedShipment.shipDate}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Expected Delivery</Label><Label className="font-mono text-white">{selectedShipment.expectedDelivery}</Label></Stack>
              </Grid>
              <Grid cols={3} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Items</Label><Label className="font-mono text-white">{selectedShipment.items}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Weight</Label><Label className="font-mono text-white">{selectedShipment.weight.toLocaleString()} lbs</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Cost</Label><Label className="font-mono text-white">${selectedShipment.cost.toLocaleString()}</Label></Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedShipment(null)}>Close</Button>
          {selectedShipment?.trackingNumber && <Button variant="solid">Track Shipment</Button>}
        </ModalFooter>
      </Modal>

      <Modal open={showNewShipmentModal} onClose={() => setShowNewShipmentModal(false)}>
        <ModalHeader><H3>New Shipment</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Select Project...</option>
              <option value="PROJ-089">Summer Fest 2024</option>
              <option value="PROJ-090">Corporate Gala</option>
            </Select>
            <Grid cols={2} gap={4}>
              <Input placeholder="Origin City, State" className="border-ink-700 bg-black text-white" />
              <Input placeholder="Destination City, State" className="border-ink-700 bg-black text-white" />
            </Grid>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Select Carrier...</option>
              {carriers.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Grid cols={2} gap={4}>
              <Stack gap={2}>
                <Label>Ship Date</Label>
                <Input type="date" className="border-ink-700 bg-black text-white" />
              </Stack>
              <Stack gap={2}>
                <Label>Expected Delivery</Label>
                <Input type="date" className="border-ink-700 bg-black text-white" />
              </Stack>
            </Grid>
            <Grid cols={3} gap={4}>
              <Input type="number" placeholder="Items" className="border-ink-700 bg-black text-white" />
              <Input type="number" placeholder="Weight (lbs)" className="border-ink-700 bg-black text-white" />
              <Input type="number" placeholder="Cost ($)" className="border-ink-700 bg-black text-white" />
            </Grid>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowNewShipmentModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowNewShipmentModal(false)}>Create Shipment</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
