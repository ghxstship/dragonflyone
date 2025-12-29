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
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";
import {
  usePunchItems,
  type PunchItem,
} from '@/hooks/usePunchList';
import { Eye, CheckCircle } from "lucide-react";

const getPriorityVariant = (priority: string): 'solid' | 'outline' | 'ghost' => {
  switch (priority) {
    case "Critical": return "solid";
    case "High": return "outline";
    default: return "ghost";
  }
};

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) {
    case "Verified": return "solid";
    case "Resolved": return "outline";
    default: return "ghost";
  }
};

export default function PunchListPage() {
  const { data: punchItems = [], refetch } = usePunchItems();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PunchItem | null>(null);

  const openItems = punchItems.filter(i => i.status === "Open" || i.status === "In Progress");
  const criticalCount = punchItems.filter(i => i.priority === "Critical" && i.status !== "Verified").length;
  const resolvedToday = punchItems.filter(i => i.resolvedDate === new Date().toISOString().split('T')[0]).length;

  const columns: ListPageColumn<PunchItem>[] = [
    {
      key: 'title',
      label: 'Item',
      accessor: 'title',
      sortable: true,
      render: (_, item) => (
        <Stack gap={1}>
          <Body className="font-display">{item.title}</Body>
          <Body size="sm" className="text-muted-foreground">{item.location}</Body>
        </Stack>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      accessor: 'department',
      sortable: true,
      render: (_, item) => <Badge variant="outline">{item.department}</Badge>,
    },
    {
      key: 'priority',
      label: 'Priority',
      accessor: 'priority',
      sortable: true,
      render: (_, item) => <Badge variant={getPriorityVariant(item.priority)}>{item.priority}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_, item) => <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>,
    },
    { key: 'assignedTo', label: 'Assigned To', accessor: (i) => i.assignedTo || 'Unassigned' },
    { key: 'reportedBy', label: 'Reported By', accessor: 'reportedBy' },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'department',
      label: 'Department',
      options: [
        { value: 'Audio', label: 'Audio' },
        { value: 'Lighting', label: 'Lighting' },
        { value: 'Video', label: 'Video' },
        { value: 'Staging', label: 'Staging' },
        { value: 'Rigging', label: 'Rigging' },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { value: 'Critical', label: 'Critical' },
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Open', label: 'Open' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Resolved', label: 'Resolved' },
        { value: 'Verified', label: 'Verified' },
      ],
    },
  ];

  const rowActions: ListPageAction<PunchItem>[] = [
    { id: 'view', label: 'Details', icon: <Eye className="h-4 w-4" />, onClick: (item) => setSelectedItem(item) },
    { id: 'resolve', label: 'Resolve', icon: <CheckCircle className="h-4 w-4" />, onClick: () => {}, hidden: (item) => item.status !== 'In Progress' },
  ];

  const stats = [
    { label: 'Open Items', value: openItems.length },
    { label: 'Critical', value: criticalCount },
    { label: 'Resolved Today', value: resolvedToday },
    { label: 'Total Items', value: punchItems.length },
  ];

  return (
    <>
      <ListPage<PunchItem>
        title="Punch List"
        subtitle="Track and resolve outstanding items before show"
        data={punchItems}
        columns={columns}
        rowKey="id"
        loading={false}
        onRetry={refetch}
        searchPlaceholder="Search items..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(item) => setSelectedItem(item)}
        createLabel="Add Item"
        onCreate={() => setShowAddModal(true)}
        entityType="punch-items"
        onExport={createExportHandler({
          filename: "punch-list",
          getData: () => punchItems.map((item: PunchItem) => ({
            title: item.title,
            location: item.location,
            department: item.department,
            priority: item.priority,
            status: item.status,
            assignedTo: item.assignedTo || '',
            reportedBy: item.reportedBy,
            resolvedDate: item.resolvedDate || '',
          })),
        })}
        stats={stats}
        emptyMessage="No punch list items found"
        emptyAction={{ label: 'Add Item', onClick: () => setShowAddModal(true) }}
        showFavorite
        showSettings
      />

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Punch Item</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Item title" />
            <Textarea placeholder="Description..." rows={2} />
            <Input placeholder="Location" />
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Select>
                <option value="">Department...</option>
                <option value="Audio">Audio</option>
                <option value="Lighting">Lighting</option>
                <option value="Video">Video</option>
                <option value="Staging">Staging</option>
                <option value="Rigging">Rigging</option>
              </Select>
              <Select>
                <option value="">Priority...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </Select>
            </Grid>
            <Select>
              <option value="">Assign to...</option>
              <option value="john">John Martinez</option>
              <option value="sarah">Sarah Chen</option>
              <option value="mike">Mike Thompson</option>
            </Select>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add Item</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedItem} onClose={() => setSelectedItem(null)}>
        <ModalHeader><H3>Punch Item Details</H3></ModalHeader>
        <ModalBody>
          {selectedItem && (
            <Stack gap={4}>
              <Body className="font-display">{selectedItem.title}</Body>
              <Body>{selectedItem.description}</Body>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Location</Body>
                  <Body>{selectedItem.location}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Department</Body>
                  <Badge variant="outline">{selectedItem.department}</Badge>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Priority</Body>
                  <Badge variant={getPriorityVariant(selectedItem.priority)}>{selectedItem.priority}</Badge>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Status</Body>
                  <Badge variant={getStatusVariant(selectedItem.status)}>{selectedItem.status}</Badge>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Reported By</Body>
                  <Body>{selectedItem.reportedBy}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Assigned To</Body>
                  <Body>{selectedItem.assignedTo || "Unassigned"}</Body>
                </Stack>
              </Grid>
              {selectedItem.notes && (
                <Stack gap={1}>
                  <Body size="sm" className="">Notes</Body>
                  <Body>{selectedItem.notes}</Body>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedItem(null)}>Close</Button>
          <Button variant="solid">Update Status</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
