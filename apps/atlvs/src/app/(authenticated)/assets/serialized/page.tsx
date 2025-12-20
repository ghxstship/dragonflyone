'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import {
  Container,
  H3,
  Body,
  Label,
  Grid,
  Stack,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Card,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Alert,
  StatCard,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';


import { useSerializedComponents, type SerializedComponent } from '@ghxstship/config';
import { DEMO_SERIALIZED_COMPONENTS } from '../../../../lib/demo-data';

const componentTypes = ['All', 'Lamp', 'Driver', 'Chain Assembly', 'Power Supply', 'Gobo Wheel', 'Motor', 'Lens', 'Fan'];

export default function SerializedComponentsPage() {
  const router = useRouter();
  const [selectedComponent, setSelectedComponent] = useState<SerializedComponent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Real API integration with demo fallback
  const { components: apiData, isLoading, createComponentAsync, refetch } = useSerializedComponents();
  const components: SerializedComponent[] = apiData.length > 0 ? apiData : (DEMO_SERIALIZED_COMPONENTS as unknown as SerializedComponent[]);

  const filteredComponents = components.filter((c) => {
    const matchesType = typeFilter === 'All' || c.componentType === typeFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch =
      c.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.parentAssetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const activeCount = components.filter((c) => c.status === 'Active').length;
  const inRepairCount = components.filter((c) => c.status === 'In Repair').length;
  const warrantyExpiringSoon = components.filter((c) => {
    if (!c.warrantyExpiry) return false;
    const expiry = new Date(c.warrantyExpiry);
    const now = new Date();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return expiry.getTime() - now.getTime() < thirtyDays && expiry > now;
  }).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-success-400';
      case 'Replaced':
        return 'text-ink-400';
      case 'Failed':
        return 'text-error-400';
      case 'In Repair':
        return 'text-warning-400';
      default:
        return 'text-ink-400';
    }
  };

  if (isLoading) {
    return (
      <AtlvsAppLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">Loading serialized components...</div>
        </div>
      </AtlvsAppLayout>
    );
  }

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="Serialized Component Tracking"
        subtitle="Track individual components within assets by serial number"


        primaryAction={{ label: 'Add Component', onClick: () => setShowAddModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={8}>

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Components" value={components.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active" value={activeCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="In Repair" value={inRepairCount} trend={inRepairCount > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Warranty Expiring" value={warrantyExpiringSoon} trend={warrantyExpiringSoon > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {warrantyExpiringSoon > 0 && (
            <Alert variant="warning">{warrantyExpiringSoon} component(s) have warranties expiring within 30 days</Alert>
          )}

          <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
            <Input
              type="search"
              placeholder="Search serial numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-ink-700 bg-black text-white"
            />
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border-ink-700 bg-black text-white">
              {componentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border-ink-700 bg-black text-white">
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Replaced">Replaced</option>
              <option value="Failed">Failed</option>
              <option value="In Repair">In Repair</option>
            </Select>
            <Button variant="outlineWhite" onClick={() => setShowAddModal(true)}>
              Add Component
            </Button>
          </Grid>

          <Table variant="dark" className="border-2 border-ink-800">
            <TableHeader>
              <TableRow className="bg-ink-900">
                <TableHead className="text-ink-400">Serial Number</TableHead>
                <TableHead className="text-ink-400">Parent Asset</TableHead>
                <TableHead className="text-ink-400">Type</TableHead>
                <TableHead className="text-ink-400">Manufacturer</TableHead>
                <TableHead className="text-ink-400">Install Date</TableHead>
                <TableHead className="text-ink-400">Warranty</TableHead>
                <TableHead className="text-ink-400">Status</TableHead>
                <TableHead className="text-ink-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComponents.map((component) => (
                <TableRow key={component.id} className="border-ink-800">
                  <TableCell>
                    <Label className="font-mono text-white">{component.serialNumber}</Label>
                  </TableCell>
                  <TableCell>
                    <Stack gap={1}>
                      <Label className="text-white">{component.parentAssetName}</Label>
                      <Label size="xs" className="text-ink-500">
                        {component.parentAssetId}
                      </Label>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{component.componentType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Stack gap={0}>
                      <Label className="text-white">{component.manufacturer}</Label>
                      <Label size="xs" className="text-ink-500">
                        {component.model}
                      </Label>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Label className="text-ink-300">{component.installDate}</Label>
                  </TableCell>
                  <TableCell>
                    {component.warrantyExpiry ? (
                      <Label className={new Date(component.warrantyExpiry) < new Date() ? 'text-error-400' : 'text-ink-300'}>
                        {component.warrantyExpiry}
                      </Label>
                    ) : (
                      <Label className="text-ink-500">N/A</Label>
                    )}
                  </TableCell>
                  <TableCell>
                    <Label className={getStatusColor(component.status)}>{component.status}</Label>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedComponent(component)}>
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="border-ink-700 text-ink-400">
              Export Report
            </Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/assets')}>
              Asset Registry
            </Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/')}>
              Dashboard
            </Button>
          </Grid>

      <Modal open={!!selectedComponent} onClose={() => setSelectedComponent(null)}>
        <ModalHeader>
          <H3>Component Details</H3>
        </ModalHeader>
        <ModalBody>
          {selectedComponent && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label className="text-ink-400">Serial Number</Label>
                <Label className="font-mono text-white text-body-md">{selectedComponent.serialNumber}</Label>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedComponent.componentType}</Badge>
                <Label className={getStatusColor(selectedComponent.status)}>{selectedComponent.status}</Label>
              </Stack>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Parent Asset
                  </Label>
                  <Label className="text-white">{selectedComponent.parentAssetName}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Location
                  </Label>
                  <Label className="text-white">{selectedComponent.location}</Label>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Manufacturer
                  </Label>
                  <Label className="text-white">{selectedComponent.manufacturer}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Model
                  </Label>
                  <Label className="text-white">{selectedComponent.model}</Label>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Install Date
                  </Label>
                  <Label className="text-white">{selectedComponent.installDate}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Warranty Expiry
                  </Label>
                  <Label className={selectedComponent.warrantyExpiry && new Date(selectedComponent.warrantyExpiry) < new Date() ? 'text-error-400' : 'text-white'}>
                    {selectedComponent.warrantyExpiry || 'N/A'}
                  </Label>
                </Stack>
              </Grid>
              {selectedComponent.lastInspection && (
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Last Inspection
                  </Label>
                  <Label className="text-white">{selectedComponent.lastInspection}</Label>
                </Stack>
              )}
              {selectedComponent.notes && (
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Notes
                  </Label>
                  <Body className="text-ink-300">{selectedComponent.notes}</Body>
                </Stack>
              )}
              <Stack gap={2}>
                <Label className="text-ink-400">History</Label>
                {selectedComponent.history.map((h, idx) => (
                  <Card key={idx} className="p-3 bg-ink-800 border-2 border-ink-700">
                    <Stack direction="horizontal" className="justify-between">
                      <Stack gap={1}>
                        <Label className="text-white">{h.action}</Label>
                        <Label size="xs" className="text-ink-500">
                          {h.performedBy}
                        </Label>
                        {h.notes && <Label size="xs" className="text-ink-400">{h.notes}</Label>}
                      </Stack>
                      <Label className="text-ink-400">{h.date}</Label>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedComponent(null)}>
            Close
          </Button>
          <Button variant="outline">Log Inspection</Button>
          <Button variant="solid">Edit Component</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader>
          <H3>Add Serialized Component</H3>
        </ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Serial Number" className="border-ink-700 bg-black text-white" />
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Parent Asset...</option>
              <option value="AST-001">Robe MegaPointe #1</option>
              <option value="AST-002">Meyer Sound LEO-M #3</option>
              <option value="AST-003">ROE CB5 Panel Rack #12</option>
            </Select>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Component Type...</option>
              {componentTypes.slice(1).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Input placeholder="Manufacturer" className="border-ink-700 bg-black text-white" />
              <Input placeholder="Model" className="border-ink-700 bg-black text-white" />
            </Grid>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Stack gap={2}>
                <Label>Install Date</Label>
                <Input type="date" className="border-ink-700 bg-black text-white" />
              </Stack>
              <Stack gap={2}>
                <Label>Warranty Expiry</Label>
                <Input type="date" className="border-ink-700 bg-black text-white" />
              </Stack>
            </Grid>
            <Textarea placeholder="Notes..." className="border-ink-700 bg-black text-white" rows={3} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="solid" onClick={async () => {
            try {
              await createComponentAsync({
                serial_number: `SN-${Date.now()}`,
                component_type: 'Lamp',
                parent_asset_id: 'AST-001',
                manufacturer: 'Generic',
                model: 'Standard',
                install_date: new Date().toISOString().split('T')[0],
                location: 'Warehouse',
              });
              refetch();
              setShowAddModal(false);
            } catch (err) {
              console.error('Failed to create component:', err);
            }
          }}>
            Add Component
          </Button>
        </ModalFooter>
      </Modal>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
