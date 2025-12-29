"use client";

import { useState } from "react";
// Layout provided by route group
import { Ambulance, Flame, AlertTriangle, Eye, Phone } from "lucide-react";
import {
  ListPage,
  H3,
  Body,
  Grid,
  Stack,
  Button,
  Card,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";
import {
  useEmergencyContacts,
  useEmergencyProcedures,
  type EmergencyContact,
  type EmergencyProcedure,
} from "../../hooks/useEmergency";

const getStatusVariant = (available: boolean): 'solid' | 'outline' => {
  return available ? 'solid' : 'outline';
};

export default function EmergencyPage() {
  const { data: contacts = [], isLoading, refetch } = useEmergencyContacts();
  const { data: procedures = [] } = useEmergencyProcedures();
  const [selectedProcedure, setSelectedProcedure] = useState<EmergencyProcedure | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);

  const columns: ListPageColumn<EmergencyContact>[] = [
    {
      key: 'name',
      label: 'Contact',
      accessor: 'name',
      sortable: true,
      render: (_, c) => (
        <Stack gap={1}>
          <Body className="font-display">{c.name}</Body>
          <Body size="sm" className="text-muted-foreground">{c.role}</Body>
        </Stack>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      accessor: 'category',
      sortable: true,
      render: (_, c) => <Badge variant="outline">{c.category}</Badge>,
    },
    { key: 'phone', label: 'Phone', accessor: 'phone' },
    { key: 'priority', label: 'Priority', accessor: 'priority', sortable: true },
    {
      key: 'available',
      label: 'Status',
      accessor: (c) => c.available ? 'Available' : 'Unavailable',
      render: (_, c) => <Badge variant={getStatusVariant(c.available)}>{c.available ? 'Available' : 'Unavailable'}</Badge>,
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'category',
      label: 'Category',
      options: [
        { value: 'Production', label: 'Production' },
        { value: 'Medical', label: 'Medical' },
        { value: 'Security', label: 'Security' },
        { value: 'Fire', label: 'Fire' },
        { value: 'Police', label: 'Police' },
        { value: 'Venue', label: 'Venue' },
      ],
    },
    {
      key: 'available',
      label: 'Availability',
      options: [
        { value: 'true', label: 'Available' },
        { value: 'false', label: 'Unavailable' },
      ],
    },
  ];

  const rowActions: ListPageAction<EmergencyContact>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (c) => { setSelectedContact(c); setShowCallModal(true); } },
    { id: 'call', label: 'Call', icon: <Phone className="h-4 w-4" />, onClick: (c) => { setSelectedContact(c); setShowCallModal(true); } },
  ];

  const stats = [
    { label: 'Total Contacts', value: contacts.length },
    { label: 'Available', value: contacts.filter(c => c.available).length },
    { label: 'Procedures', value: procedures.length },
    { label: 'Categories', value: new Set(contacts.map(c => c.category)).size },
  ];

  return (
    <>
      <Alert variant="warning" className="mx-4 mt-4">
        In case of life-threatening emergency, call 911 immediately
      </Alert>

      <Grid cols={3} gap={4} className="mx-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer p-4" onClick={() => setSelectedProcedure(procedures.find(p => p.type === "Medical") || null)}>
          <Stack gap={2} className="text-center">
            <Ambulance className="size-8 mx-auto" />
            <Body className="font-display">MEDICAL</Body>
          </Stack>
        </Card>
        <Card className="cursor-pointer p-4" onClick={() => setSelectedProcedure(procedures.find(p => p.type === "Fire") || null)}>
          <Stack gap={2} className="text-center">
            <Flame className="size-8 mx-auto" />
            <Body className="font-display">FIRE</Body>
          </Stack>
        </Card>
        <Card className="cursor-pointer p-4" onClick={() => setSelectedProcedure(procedures.find(p => p.type === "Evacuation") || null)}>
          <Stack gap={2} className="text-center">
            <AlertTriangle className="size-8 mx-auto" />
            <Body className="font-display">EVACUATION</Body>
          </Stack>
        </Card>
      </Grid>

      <ListPage<EmergencyContact>
        title="Emergency Procedures"
        subtitle="Contact tree, emergency protocols, and response procedures"
        data={contacts}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRetry={refetch}
        searchPlaceholder="Search contacts..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(c) => { setSelectedContact(c); setShowCallModal(true); }}
        entityType="emergency"
        onExport={createExportHandler({
          filename: "emergency-contacts",
          getData: () => contacts.map((c: EmergencyContact) => ({
            name: c.name,
            role: c.role,
            category: c.category,
            phone: c.phone,
            priority: c.priority,
            available: c.available ? 'Yes' : 'No',
          })),
        })}
        stats={stats}
        emptyMessage="No emergency contacts found"
        showFavorite
        showSettings
      />

      {/* Procedure Modal */}
      <Modal open={!!selectedProcedure} onClose={() => setSelectedProcedure(null)}>
        <ModalHeader><H3>{selectedProcedure?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedProcedure && (
            <Stack gap={4}>
              <Badge variant="solid">{selectedProcedure.type} Emergency</Badge>
              <Stack gap={2}>
                <Body className="font-display">Response Steps:</Body>
                {selectedProcedure.steps.map((step, idx) => (
                  <Card key={idx} className="p-3">
                    <Stack direction="horizontal" gap={3}>
                      <Badge variant="solid">{idx + 1}</Badge>
                      <Body>{step}</Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              <Stack gap={2}>
                <Body className="font-display">Key Contacts:</Body>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedProcedure.contacts.map((contact) => (
                    <Badge key={contact} variant="outline">{contact}</Badge>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedProcedure(null)}>Close</Button>
          <Button variant="solid">Print Procedure</Button>
        </ModalFooter>
      </Modal>

      {/* Call Modal */}
      <Modal open={showCallModal} onClose={() => setShowCallModal(false)}>
        <ModalHeader><H3>Contact</H3></ModalHeader>
        <ModalBody>
          {selectedContact && (
            <Stack gap={4} className="text-center">
              <Body className="text-h6-md font-display">{selectedContact.name}</Body>
              <Body size="sm" className="">{selectedContact.role}</Body>
              <Card className="p-4">
                <Body className="text-h5-md">{selectedContact.phone}</Body>
              </Card>
              <Button variant="solid" className="w-full">Call Now</Button>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCallModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
