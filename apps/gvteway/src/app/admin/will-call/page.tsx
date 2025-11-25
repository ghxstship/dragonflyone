"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface WillCallTicket {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  eventName: string;
  ticketType: string;
  quantity: number;
  status: "Pending" | "Ready" | "Picked Up" | "No Show";
  notes?: string;
  idRequired: boolean;
  pickedUpAt?: string;
  pickedUpBy?: string;
}

const mockTickets: WillCallTicket[] = [
  { id: "WC-001", orderNumber: "ORD-2024-1234", customerName: "John Smith", email: "john@email.com", phone: "+1 555-0101", eventName: "Summer Fest 2024", ticketType: "VIP", quantity: 2, status: "Ready", idRequired: true },
  { id: "WC-002", orderNumber: "ORD-2024-1235", customerName: "Sarah Johnson", email: "sarah@email.com", eventName: "Summer Fest 2024", ticketType: "GA", quantity: 4, status: "Ready", idRequired: true, notes: "Guest may send alternate pickup" },
  { id: "WC-003", orderNumber: "ORD-2024-1236", customerName: "Mike Davis", email: "mike@email.com", phone: "+1 555-0103", eventName: "Summer Fest 2024", ticketType: "VIP", quantity: 1, status: "Picked Up", idRequired: true, pickedUpAt: "2024-11-24 18:30", pickedUpBy: "Mike Davis" },
  { id: "WC-004", orderNumber: "ORD-2024-1237", customerName: "Emily Chen", email: "emily@email.com", eventName: "Summer Fest 2024", ticketType: "GA", quantity: 2, status: "Pending", idRequired: true },
  { id: "WC-005", orderNumber: "ORD-2024-1238", customerName: "Chris Wilson", email: "chris@email.com", phone: "+1 555-0105", eventName: "Summer Fest 2024", ticketType: "Meet & Greet", quantity: 2, status: "Ready", idRequired: true },
];

export default function WillCallPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ready");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<WillCallTicket | null>(null);
  const [showPickupModal, setShowPickupModal] = useState(false);

  const readyCount = mockTickets.filter(t => t.status === "Ready").length;
  const pickedUpCount = mockTickets.filter(t => t.status === "Picked Up").length;
  const pendingCount = mockTickets.filter(t => t.status === "Pending").length;

  const filteredTickets = mockTickets.filter(t => {
    const matchesSearch = t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || 
                       (activeTab === "ready" && t.status === "Ready") ||
                       (activeTab === "picked-up" && t.status === "Picked Up") ||
                       (activeTab === "pending" && t.status === "Pending");
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Picked Up": return "text-green-600";
      case "Ready": return "text-blue-600";
      case "Pending": return "text-yellow-600";
      case "No Show": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>WILL CALL MANAGEMENT</H1>
            <Body className="text-gray-600">Manage ticket pickups with ID verification</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Ready for Pickup" value={readyCount} className="border-2 border-black" />
            <StatCard label="Picked Up" value={pickedUpCount} trend="up" className="border-2 border-black" />
            <StatCard label="Pending" value={pendingCount} className="border-2 border-black" />
            <StatCard label="Total Tickets" value={mockTickets.reduce((sum, t) => sum + t.quantity, 0)} className="border-2 border-black" />
          </Grid>

          <Grid cols={2} gap={4}>
            <Input type="search" placeholder="Search by name, order #, or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-2 border-black" />
            <Button variant="solid">Scan Order QR</Button>
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "ready"} onClick={() => setActiveTab("ready")}>Ready ({readyCount})</Tab>
              <Tab active={activeTab === "pending"} onClick={() => setActiveTab("pending")}>Pending ({pendingCount})</Tab>
              <Tab active={activeTab === "picked-up"} onClick={() => setActiveTab("picked-up")}>Picked Up</Tab>
              <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
            </TabsList>

            <TabPanel active={true}>
              <Table className="border-2 border-black">
                <TableHeader>
                  <TableRow className="bg-black text-white">
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Tickets</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Label className="font-mono">{ticket.orderNumber}</Label>
                          <Label size="xs" className="text-gray-500">{ticket.eventName}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <Body>{ticket.customerName}</Body>
                          <Label size="xs" className="text-gray-500">{ticket.email}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <Label>{ticket.quantity}x {ticket.ticketType}</Label>
                          {ticket.idRequired && <Badge variant="outline">ID Required</Badge>}
                        </Stack>
                      </TableCell>
                      <TableCell><Label className={getStatusColor(ticket.status)}>{ticket.status}</Label></TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="outline" size="sm" onClick={() => setSelectedTicket(ticket)}>Details</Button>
                          {ticket.status === "Ready" && (
                            <Button variant="solid" size="sm" onClick={() => { setSelectedTicket(ticket); setShowPickupModal(true); }}>Release</Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>
          </Tabs>

          <Button variant="outline" onClick={() => router.push("/admin")}>Back to Admin</Button>
        </Stack>
      </Container>

      <Modal open={showPickupModal} onClose={() => { setShowPickupModal(false); setSelectedTicket(null); }}>
        <ModalHeader><H3>Release Tickets</H3></ModalHeader>
        <ModalBody>
          {selectedTicket && (
            <Stack gap={4}>
              <Card className="p-4 bg-gray-50 border border-gray-200">
                <Stack gap={2}>
                  <Body className="font-bold">{selectedTicket.customerName}</Body>
                  <Label>{selectedTicket.quantity}x {selectedTicket.ticketType}</Label>
                  <Label className="font-mono text-gray-500">{selectedTicket.orderNumber}</Label>
                </Stack>
              </Card>
              <Alert variant="warning">Verify government-issued photo ID before releasing tickets</Alert>
              <Stack gap={2}>
                <Label>ID Verified By</Label>
                <Input placeholder="Staff name" />
              </Stack>
              <Stack gap={2}>
                <Label>Picked Up By (if different from customer)</Label>
                <Input placeholder="Name on ID" defaultValue={selectedTicket.customerName} />
              </Stack>
              {selectedTicket.notes && (
                <Alert variant="info">{selectedTicket.notes}</Alert>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowPickupModal(false); setSelectedTicket(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowPickupModal(false); setSelectedTicket(null); }}>Confirm Release</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedTicket && !showPickupModal} onClose={() => setSelectedTicket(null)}>
        <ModalHeader><H3>Ticket Details</H3></ModalHeader>
        <ModalBody>
          {selectedTicket && (
            <Stack gap={4}>
              <Body className="font-bold text-lg">{selectedTicket.customerName}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Order</Label><Label className="font-mono">{selectedTicket.orderNumber}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Status</Label><Label className={getStatusColor(selectedTicket.status)}>{selectedTicket.status}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Email</Label><Label>{selectedTicket.email}</Label></Stack>
                {selectedTicket.phone && <Stack gap={1}><Label size="xs" className="text-gray-500">Phone</Label><Label>{selectedTicket.phone}</Label></Stack>}
              </Grid>
              <Stack gap={1}><Label size="xs" className="text-gray-500">Tickets</Label><Label>{selectedTicket.quantity}x {selectedTicket.ticketType}</Label></Stack>
              {selectedTicket.pickedUpAt && (
                <Stack gap={1}><Label size="xs" className="text-gray-500">Picked Up</Label><Label>{selectedTicket.pickedUpAt} by {selectedTicket.pickedUpBy}</Label></Stack>
              )}
              {selectedTicket.notes && <Stack gap={1}><Label size="xs" className="text-gray-500">Notes</Label><Body className="text-gray-600">{selectedTicket.notes}</Body></Stack>}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTicket(null)}>Close</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
