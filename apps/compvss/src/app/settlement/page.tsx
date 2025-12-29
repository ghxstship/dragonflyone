"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";
import {
  useSettlements,
  type Settlement,
} from '../../hooks/useSettlement';
import { Eye, CheckCircle, Send } from "lucide-react";

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) {
    case "Finalized": return "solid";
    case "Approved": return "outline";
    default: return "ghost";
  }
};

export default function SettlementPage() {
  const router = useRouter();
  const { data: settlements = [], refetch } = useSettlements();
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  const pendingCount = settlements.filter(s => s.status === "Pending Review" || s.status === "Draft").length;
  const totalProfit = settlements.reduce((sum, s) => sum + s.grossProfit, 0);
  const avgMargin = settlements.length > 0 ? (settlements.reduce((sum, s) => sum + s.marginPct, 0) / settlements.length).toFixed(1) : '0';

  const columns: ListPageColumn<Settlement>[] = [
    {
      key: 'projectName',
      label: 'Project',
      accessor: 'projectName',
      sortable: true,
      render: (_, s) => (
        <Stack gap={1}>
          <Body className="font-display">{s.projectName}</Body>
          <Body size="sm" className="text-muted-foreground">Event: {s.eventDate}</Body>
        </Stack>
      ),
    },
    {
      key: 'contractValue',
      label: 'Contract',
      accessor: 'contractValue',
      sortable: true,
      render: (_, s) => <Body className="font-mono">${s.contractValue.toLocaleString()}</Body>,
    },
    {
      key: 'actualCosts',
      label: 'Costs',
      accessor: 'actualCosts',
      sortable: true,
      render: (_, s) => <Body className="font-mono">${s.actualCosts.toLocaleString()}</Body>,
    },
    {
      key: 'grossProfit',
      label: 'Profit',
      accessor: 'grossProfit',
      sortable: true,
      render: (_, s) => <Body className="font-mono">${s.grossProfit.toLocaleString()}</Body>,
    },
    {
      key: 'marginPct',
      label: 'Margin',
      accessor: 'marginPct',
      sortable: true,
      render: (_, s) => <Body>{s.marginPct}%</Body>,
    },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_, s) => <Badge variant={getStatusVariant(s.status)}>{s.status}</Badge>,
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Draft', label: 'Draft' },
        { value: 'Pending Review', label: 'Pending Review' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Finalized', label: 'Finalized' },
      ],
    },
  ];

  const rowActions: ListPageAction<Settlement>[] = [
    { id: 'view', label: 'Details', icon: <Eye className="h-4 w-4" />, onClick: (s) => setSelectedSettlement(s) },
    { id: 'submit', label: 'Submit', icon: <Send className="h-4 w-4" />, onClick: () => {}, hidden: (s) => s.status !== 'Draft' },
    { id: 'finalize', label: 'Finalize', icon: <CheckCircle className="h-4 w-4" />, onClick: () => {}, hidden: (s) => s.status !== 'Approved' },
  ];

  const stats = [
    { label: 'Pending Settlements', value: pendingCount },
    { label: 'Total Profit (MTD)', value: `$${(totalProfit / 1000).toFixed(0)}K` },
    { label: 'Avg Margin', value: `${avgMargin}%` },
    { label: 'Finalized This Month', value: settlements.filter(s => s.status === "Finalized").length },
  ];

  return (
    <>
      <ListPage<Settlement>
        title="Post-Production Settlement"
        subtitle="Financial closeout and settlement for completed projects"
        data={settlements}
        columns={columns}
        rowKey="id"
        loading={false}
        onRetry={refetch}
        searchPlaceholder="Search settlements..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(s) => setSelectedSettlement(s)}
        createLabel="Create Settlement"
        onCreate={() => router.push('/settlement/new')}
        entityType="settlements"
        onExport={createExportHandler({
          filename: "settlements",
          getData: () => settlements.map((s: Settlement) => ({
            projectName: s.projectName,
            eventDate: s.eventDate,
            contractValue: s.contractValue,
            actualCosts: s.actualCosts,
            grossProfit: s.grossProfit,
            marginPct: s.marginPct,
            status: s.status,
          })),
        })}
        stats={stats}
        emptyMessage="No settlements found"
        emptyAction={{ label: 'Create Settlement', onClick: () => router.push('/settlement/new') }}
        showFavorite
        showSettings
      />

      <Modal open={!!selectedSettlement} onClose={() => setSelectedSettlement(null)}>
        <ModalHeader><H3>Settlement Details</H3></ModalHeader>
        <ModalBody>
          {selectedSettlement && (
            <Stack gap={4}>
              <Body className="font-display">{selectedSettlement.projectName}</Body>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Event Date</Body>
                  <Body>{selectedSettlement.eventDate}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Status</Body>
                  <Badge variant={getStatusVariant(selectedSettlement.status)}>{selectedSettlement.status}</Badge>
                </Stack>
              </Grid>

              <H3 className="mt-4">Revenue</H3>
              <Grid cols={2} gap={2} className="sm:grid-cols-1 lg:grid-cols-2">
                {selectedSettlement.ticketRevenue && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body size="sm" className="">Ticket Revenue</Body>
                    <Body>${selectedSettlement.ticketRevenue.toLocaleString()}</Body>
                  </Stack>
                )}
                {selectedSettlement.merchRevenue && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body size="sm" className="">Merch Revenue</Body>
                    <Body>${selectedSettlement.merchRevenue.toLocaleString()}</Body>
                  </Stack>
                )}
                {selectedSettlement.sponsorRevenue && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body size="sm" className="">Sponsor Revenue</Body>
                    <Body>${selectedSettlement.sponsorRevenue.toLocaleString()}</Body>
                  </Stack>
                )}
              </Grid>

              <H3 className="mt-4">Costs</H3>
              <Grid cols={2} gap={2} className="sm:grid-cols-1 lg:grid-cols-2">
                {selectedSettlement.artistGuarantee && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body size="sm" className="">Artist Guarantee</Body>
                    <Body>${selectedSettlement.artistGuarantee.toLocaleString()}</Body>
                  </Stack>
                )}
                {selectedSettlement.artistBackend && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body size="sm" className="">Artist Backend</Body>
                    <Body>${selectedSettlement.artistBackend.toLocaleString()}</Body>
                  </Stack>
                )}
                {selectedSettlement.venueRent && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body size="sm" className="">Venue Rent</Body>
                    <Body>${selectedSettlement.venueRent.toLocaleString()}</Body>
                  </Stack>
                )}
                {selectedSettlement.productionCosts && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body size="sm" className="">Production</Body>
                    <Body>${selectedSettlement.productionCosts.toLocaleString()}</Body>
                  </Stack>
                )}
                {selectedSettlement.laborCosts && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body size="sm" className="">Labor</Body>
                    <Body>${selectedSettlement.laborCosts.toLocaleString()}</Body>
                  </Stack>
                )}
                {selectedSettlement.otherCosts && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body size="sm" className="">Other</Body>
                    <Body>${selectedSettlement.otherCosts.toLocaleString()}</Body>
                  </Stack>
                )}
              </Grid>

              <Card className="mt-4 p-4">
                <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                  <Stack gap={1}>
                    <Body size="sm" className="">Total Revenue</Body>
                    <Body className="font-display">${selectedSettlement.contractValue.toLocaleString()}</Body>
                  </Stack>
                  <Stack gap={1}>
                    <Body size="sm" className="">Total Costs</Body>
                    <Body className="font-display">${selectedSettlement.actualCosts.toLocaleString()}</Body>
                  </Stack>
                  <Stack gap={1}>
                    <Body size="sm" className="">Net Profit</Body>
                    <Body className="font-display">${selectedSettlement.grossProfit.toLocaleString()}</Body>
                  </Stack>
                </Grid>
              </Card>

              {selectedSettlement.approvedBy && (
                <Stack gap={1} className="mt-4">
                  <Body size="sm" className="">Approved By</Body>
                  <Body>{selectedSettlement.approvedBy} on {selectedSettlement.approvedAt}</Body>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSettlement(null)}>Close</Button>
          <Button variant="outline" onClick={() => { setShowAdjustmentModal(true); }}>Add Adjustment</Button>
          <Button variant="solid">Export PDF</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAdjustmentModal} onClose={() => setShowAdjustmentModal(false)}>
        <ModalHeader><H3>Add Adjustment</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Description" />
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Input type="number" placeholder="Amount" />
              <Select>
                <option value="Credit">Credit (+)</option>
                <option value="Debit">Debit (-)</option>
              </Select>
            </Grid>
            <Select>
              <option value="">Category...</option>
              <option value="Revenue">Revenue</option>
              <option value="Labor">Labor</option>
              <option value="Production">Production</option>
              <option value="Venue">Venue</option>
              <option value="Other">Other</option>
            </Select>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAdjustmentModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAdjustmentModal(false)}>Add Adjustment</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
