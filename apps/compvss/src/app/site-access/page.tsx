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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";
import {
  useAccessPoints,
  useVehiclePasses,
  type VehiclePass,
} from "../../hooks/useSiteAccess";
import { Eye, CheckCircle } from "lucide-react";

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) {
    case "Open": case "Active": return "solid";
    case "Restricted": case "Pending": return "outline";
    default: return "ghost";
  }
};

export default function SiteAccessPage() {
  const { data: accessPoints = [], isLoading } = useAccessPoints();
  const { data: vehiclePasses = [], refetch } = useVehiclePasses();
  const [showAddPassModal, setShowAddPassModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState<VehiclePass | null>(null);

  const openPoints = accessPoints.filter(p => p.status === "Open").length;
  const activeVehicles = accessPoints.reduce((sum, p) => sum + (p.currentVehicles || 0), 0);
  const activePasses = vehiclePasses.filter(p => p.status === "Active").length;

  const columns: ListPageColumn<VehiclePass>[] = [
    {
      key: 'vehicle',
      label: 'Vehicle',
      accessor: 'vehicleType',
      sortable: true,
      render: (_, p) => (
        <Stack gap={1}>
          <Badge variant="outline">{p.vehicleType}</Badge>
          <Body size="sm" className="text-muted-foreground">{p.licensePlate}</Body>
        </Stack>
      ),
    },
    { key: 'company', label: 'Company', accessor: 'company', sortable: true },
    { key: 'driver', label: 'Driver', accessor: 'driver' },
    {
      key: 'accessPoints',
      label: 'Access',
      accessor: (p) => p.accessPoints.join(', '),
      render: (_, p) => (
        <Stack direction="horizontal" gap={1}>
          {p.accessPoints.slice(0, 2).map(ap => <Badge key={ap} variant="outline">{ap}</Badge>)}
        </Stack>
      ),
    },
    {
      key: 'validUntil',
      label: 'Valid Until',
      accessor: 'validUntil',
      sortable: true,
      render: (_, p) => <Body size="sm">{new Date(p.validUntil).toLocaleTimeString()}</Body>,
    },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_, p) => <Badge variant={getStatusVariant(p.status)}>{p.status}</Badge>,
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Expired', label: 'Expired' },
      ],
    },
    {
      key: 'vehicleType',
      label: 'Vehicle Type',
      options: [
        { value: 'Truck', label: 'Truck' },
        { value: 'Van', label: 'Van' },
        { value: 'Car', label: 'Car' },
        { value: 'Bus', label: 'Bus' },
      ],
    },
  ];

  const rowActions: ListPageAction<VehiclePass>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (p) => setSelectedPass(p) },
    { id: 'approve', label: 'Approve', icon: <CheckCircle className="h-4 w-4" />, onClick: () => {}, hidden: (p) => p.status !== 'Pending' },
  ];

  const stats = [
    { label: 'Open Access Points', value: `${openPoints}/${accessPoints.length}` },
    { label: 'Vehicles On Site', value: activeVehicles },
    { label: 'Active Passes', value: activePasses },
    { label: 'Pending Approval', value: vehiclePasses.filter(p => p.status === "Pending").length },
  ];

  return (
    <>
      <ListPage<VehiclePass>
        title="Site Access Management"
        subtitle="Gates, parking, loading docks, and vehicle passes"
        data={vehiclePasses}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRetry={refetch}
        searchPlaceholder="Search passes..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(p) => setSelectedPass(p)}
        createLabel="Issue Vehicle Pass"
        onCreate={() => setShowAddPassModal(true)}
        entityType="site-access"
        onExport={createExportHandler({
          filename: "vehicle-passes",
          getData: () => vehiclePasses.map((p: VehiclePass) => ({
            vehicleType: p.vehicleType,
            licensePlate: p.licensePlate,
            company: p.company,
            driver: p.driver,
            accessPoints: p.accessPoints.join(', '),
            validUntil: p.validUntil,
            status: p.status,
          })),
        })}
        stats={stats}
        emptyMessage="No vehicle passes found"
        emptyAction={{ label: 'Issue Vehicle Pass', onClick: () => setShowAddPassModal(true) }}
        showFavorite
        showSettings
      />

      <Modal open={showAddPassModal} onClose={() => setShowAddPassModal(false)}>
        <ModalHeader><H3>Issue Vehicle Pass</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select>
              <option value="">Vehicle type...</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Car">Car</option>
              <option value="Bus">Bus</option>
            </Select>
            <Input placeholder="License Plate" />
            <Input placeholder="Company" />
            <Input placeholder="Driver Name" />
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Input type="datetime-local" />
              <Input type="datetime-local" />
            </Grid>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddPassModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddPassModal(false)}>Issue Pass</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedPass} onClose={() => setSelectedPass(null)}>
        <ModalHeader><H3>Vehicle Pass Details</H3></ModalHeader>
        <ModalBody>
          {selectedPass && (
            <Stack gap={4}>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Vehicle</Body>
                  <Body>{selectedPass.vehicleType}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">License</Body>
                  <Body>{selectedPass.licensePlate}</Body>
                </Stack>
              </Grid>
              <Stack gap={1}>
                <Body size="sm" className="">Company</Body>
                <Body>{selectedPass.company}</Body>
              </Stack>
              <Stack gap={1}>
                <Body size="sm" className="">Driver</Body>
                <Body>{selectedPass.driver}</Body>
              </Stack>
              <Stack gap={2}>
                <Body size="sm" className="">Access Points</Body>
                <Stack direction="horizontal" gap={2}>{selectedPass.accessPoints.map(ap => <Badge key={ap} variant="outline">{ap}</Badge>)}</Stack>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPass(null)}>Close</Button>
          <Button variant="solid">Print Pass</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
