"use client";

import { useState } from "react";
// Layout provided by route group
import {
  ListPage,
  H3,
  Body,
  Grid,
  Stack,
  Input,
  Select,
  Button,
  Card,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Textarea,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";
import {
  useVIPGuests,
  useAccessZones,
  type VIPGuest,
} from "../../hooks/useVIPManagement";
import { Eye, CheckCircle } from "lucide-react";

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) {
    case "Checked In": return "solid";
    case "Approved": case "Pending": return "outline";
    default: return "ghost";
  }
};

export default function VIPManagementPage() {
  const { data: vipGuests = [], isLoading, refetch } = useVIPGuests();
  const { data: accessZones = [] } = useAccessZones();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<VIPGuest | null>(null);

  const columns: ListPageColumn<VIPGuest>[] = [
    {
      key: 'name',
      label: 'Guest',
      accessor: 'name',
      sortable: true,
      render: (_, g) => (
        <Stack gap={1}>
          <Body className="font-display">{g.name}</Body>
          <Body size="sm" className="text-muted-foreground">{g.email}</Body>
        </Stack>
      ),
    },
    {
      key: 'passType',
      label: 'Pass Type',
      accessor: 'passType',
      sortable: true,
      render: (_, g) => <Badge variant="outline">{g.passType}</Badge>,
    },
    {
      key: 'accessAreas',
      label: 'Access',
      accessor: (g) => g.accessAreas.join(', '),
      render: (_, g) => (
        <Stack direction="horizontal" gap={1}>
          {g.accessAreas.slice(0, 2).map(a => <Badge key={a} variant="outline">{a}</Badge>)}
        </Stack>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_, g) => <Badge variant={getStatusVariant(g.status)}>{g.status}</Badge>,
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Checked In', label: 'Checked In' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Denied', label: 'Denied' },
      ],
    },
    {
      key: 'passType',
      label: 'Pass Type',
      options: [
        { value: 'VIP', label: 'VIP' },
        { value: 'Backstage', label: 'Backstage' },
        { value: 'All Access', label: 'All Access' },
      ],
    },
  ];

  const rowActions: ListPageAction<VIPGuest>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (g) => setSelectedGuest(g) },
    { id: 'checkin', label: 'Check In', icon: <CheckCircle className="h-4 w-4" />, onClick: () => {}, hidden: (g) => g.status === 'Checked In' },
  ];

  const stats = [
    { label: 'Checked In', value: vipGuests.filter(g => g.status === "Checked In").length },
    { label: 'Pending', value: vipGuests.filter(g => g.status === "Pending").length },
    { label: 'Total Guests', value: vipGuests.length },
    { label: 'Zone Occupancy', value: `${accessZones.reduce((s, z) => s + z.currentOccupancy, 0)}/${accessZones.reduce((s, z) => s + z.maxCapacity, 0)}` },
  ];

  return (
    <>
      <ListPage<VIPGuest>
        title="VIP & Backstage Management"
        subtitle="Guest list management and access control"
        data={vipGuests}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRetry={refetch}
        searchPlaceholder="Search guests..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(g) => setSelectedGuest(g)}
        createLabel="Add Guest"
        onCreate={() => setShowAddModal(true)}
        entityType="vip-management"
        onExport={createExportHandler({
          filename: "vip-guests",
          getData: () => vipGuests.map((g: VIPGuest) => ({
            name: g.name,
            email: g.email,
            passType: g.passType,
            accessAreas: g.accessAreas.join(', '),
            status: g.status,
          })),
        })}
        stats={stats}
        emptyMessage="No VIP guests found"
        emptyAction={{ label: 'Add Guest', onClick: () => setShowAddModal(true) }}
        showFavorite
        showSettings
      />

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add VIP Guest</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Full Name" />
            <Input type="email" placeholder="Email" />
            <Select>
              <option value="">Select pass type...</option>
              <option value="VIP">VIP</option>
              <option value="Backstage">Backstage</option>
              <option value="All Access">All Access</option>
            </Select>
            <Textarea placeholder="Notes..." rows={2} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add Guest</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedGuest} onClose={() => setSelectedGuest(null)}>
        <ModalHeader><H3>Guest Details</H3></ModalHeader>
        <ModalBody>
          {selectedGuest && (
            <Stack gap={4}>
              <Body className="font-display">{selectedGuest.name}</Body>
              <Body size="sm" className="">{selectedGuest.email}</Body>
              <Badge variant="outline">{selectedGuest.passType}</Badge>
              <Badge variant={getStatusVariant(selectedGuest.status)}>{selectedGuest.status}</Badge>
              {selectedGuest.notes && <Body>{selectedGuest.notes}</Body>}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedGuest(null)}>Close</Button>
          <Button variant="solid">Edit</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
