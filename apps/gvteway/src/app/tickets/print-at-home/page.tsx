"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "@ghxstship/ui";

interface PrintTicket {
  id: string;
  orderId: string;
  eventName: string;
  ticketType: string;
  purchaserName: string;
  purchaseDate: string;
  printCount: number;
  lastPrinted?: string;
  status: "Available" | "Printed" | "Used" | "Expired";
}

const mockTickets: PrintTicket[] = [
  { id: "TKT-001", orderId: "ORD-12345", eventName: "Summer Music Festival 2025", ticketType: "General Admission", purchaserName: "John Smith", purchaseDate: "2024-11-20", printCount: 2, lastPrinted: "2024-11-22", status: "Printed" },
  { id: "TKT-002", orderId: "ORD-12345", eventName: "Summer Music Festival 2025", ticketType: "General Admission", purchaserName: "John Smith", purchaseDate: "2024-11-20", printCount: 0, status: "Available" },
  { id: "TKT-003", orderId: "ORD-12346", eventName: "New Year Gala", ticketType: "VIP", purchaserName: "Sarah Johnson", purchaseDate: "2024-11-18", printCount: 1, lastPrinted: "2024-11-19", status: "Printed" },
  { id: "TKT-004", orderId: "ORD-12347", eventName: "Tech Conference 2025", ticketType: "Full Access", purchaserName: "Mike Davis", purchaseDate: "2024-11-15", printCount: 0, status: "Available" },
];

export default function PrintAtHomePage() {
  const router = useRouter();
  const [selectedTicket, setSelectedTicket] = useState<PrintTicket | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const printedCount = mockTickets.filter(t => t.printCount > 0).length;
  const totalPrints = mockTickets.reduce((s, t) => s + t.printCount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "text-success-600";
      case "Printed": return "text-info-600";
      case "Used": return "text-ink-600";
      case "Expired": return "text-error-600";
      default: return "text-ink-600";
    }
  };

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>PRINT-AT-HOME TICKETS</H1>
            <Body className="text-ink-600">Secure printable tickets with security features</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Tickets" value={mockTickets.length} className="border-2 border-black" />
            <StatCard label="Printed" value={printedCount} className="border-2 border-black" />
            <StatCard label="Total Prints" value={totalPrints} className="border-2 border-black" />
            <StatCard label="Pending" value={mockTickets.filter(t => t.printCount === 0).length} className="border-2 border-black" />
          </Grid>

          <Card className="border-2 border-black p-6">
            <Stack gap={4}>
              <H3>Ticket Security Features</H3>
              <Grid cols={4} gap={4}>
                {[
                  { icon: "🔐", name: "Unique QR Code", desc: "One-time scan validation" },
                  { icon: "🔒", name: "Watermark", desc: "Purchaser name embedded" },
                  { icon: "🛡️", name: "Holographic Pattern", desc: "Anti-counterfeit design" },
                  { icon: "📋", name: "Barcode Backup", desc: "Secondary validation" },
                ].map((feature, idx) => (
                  <Card key={idx} className="p-4 border border-ink-200 text-center">
                    <Stack gap={2}>
                      <Label className="text-h5-md">{feature.icon}</Label>
                      <Label className="font-bold">{feature.name}</Label>
                      <Label className="text-ink-500">{feature.desc}</Label>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          </Card>

          <Stack direction="horizontal" className="justify-between">
            <Input type="search" placeholder="Search by order ID or name..." className="border-2 border-black w-64" />
            <Button variant="outline" onClick={() => setShowSettingsModal(true)}>Print Settings</Button>
          </Stack>

          <Stack gap={4}>
            {mockTickets.map((ticket) => (
              <Card key={ticket.id} className="border-2 border-black p-6">
                <Grid cols={6} gap={4} className="items-center">
                  <Stack gap={1}>
                    <Body className="font-bold">{ticket.eventName}</Body>
                    <Badge variant="outline">{ticket.ticketType}</Badge>
                  </Stack>
                  <Stack gap={1}>
                    <Label className="text-ink-500">Order</Label>
                    <Label className="font-mono">{ticket.orderId}</Label>
                  </Stack>
                  <Stack gap={1}>
                    <Label className="text-ink-500">Purchaser</Label>
                    <Label>{ticket.purchaserName}</Label>
                  </Stack>
                  <Stack gap={1}>
                    <Label className="text-ink-500">Print Count</Label>
                    <Label className="font-mono">{ticket.printCount}</Label>
                  </Stack>
                  <Label className={getStatusColor(ticket.status)}>{ticket.status}</Label>
                  <Stack direction="horizontal" gap={2}>
                    <Button variant="outline" size="sm" onClick={() => setSelectedTicket(ticket)}>Preview</Button>
                    <Button variant="solid" size="sm">Print</Button>
                  </Stack>
                </Grid>
              </Card>
            ))}
          </Stack>

          <Button variant="outline" onClick={() => router.push("/tickets")}>Back to Tickets</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedTicket} onClose={() => setSelectedTicket(null)}>
        <ModalHeader><H3>Ticket Preview</H3></ModalHeader>
        <ModalBody>
          {selectedTicket && (
            <Stack gap={4}>
              <Card className="p-6 border-2 border-black bg-ink-50">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between">
                    <Stack gap={1}>
                      <H3>{selectedTicket.eventName}</H3>
                      <Badge variant="outline">{selectedTicket.ticketType}</Badge>
                    </Stack>
                    <Card className="w-24 h-24 bg-black flex items-center justify-center">
                      <Label className="text-white text-mono-xs">QR CODE</Label>
                    </Card>
                  </Stack>
                  <Grid cols={2} gap={4}>
                    <Stack gap={1}><Label className="text-ink-500">Ticket ID</Label><Label className="font-mono">{selectedTicket.id}</Label></Stack>
                    <Stack gap={1}><Label className="text-ink-500">Order</Label><Label className="font-mono">{selectedTicket.orderId}</Label></Stack>
                  </Grid>
                  <Stack gap={1}><Label className="text-ink-500">Attendee</Label><Label className="font-bold">{selectedTicket.purchaserName}</Label></Stack>
                  <Card className="p-2 bg-ink-200 text-center">
                    <Label className="font-mono text-mono-xs">||||||||||||||||||||||||</Label>
                  </Card>
                  <Label className="text-ink-600 text-center">This ticket contains security features to prevent counterfeiting</Label>
                </Stack>
              </Card>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-500">Purchase Date</Label><Label>{selectedTicket.purchaseDate}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-500">Times Printed</Label><Label>{selectedTicket.printCount}</Label></Stack>
              </Grid>
              {selectedTicket.lastPrinted && (
                <Stack gap={1}><Label className="text-ink-500">Last Printed</Label><Label>{selectedTicket.lastPrinted}</Label></Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTicket(null)}>Close</Button>
          <Button variant="outline">Download PDF</Button>
          <Button variant="solid">Print Ticket</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showSettingsModal} onClose={() => setShowSettingsModal(false)}>
        <ModalHeader><H3>Print Settings</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Stack gap={2}>
              <Label className="font-bold">Security Features</Label>
              <Stack gap={1}>
                {["Include QR code", "Include barcode", "Add watermark with purchaser name", "Include holographic pattern", "Add event logo"].map((opt, idx) => (
                  <Stack key={idx} direction="horizontal" gap={2}>
                    <Input type="checkbox" defaultChecked className="w-4 h-4" />
                    <Label>{opt}</Label>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            <Stack gap={2}>
              <Label className="font-bold">Print Limits</Label>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label className="text-ink-500">Max prints per ticket</Label>
                  <Input type="number" defaultValue={3} className="border-2 border-black" />
                </Stack>
                <Stack gap={1}>
                  <Label className="text-ink-500">Reprint cooldown (hours)</Label>
                  <Input type="number" defaultValue={24} className="border-2 border-black" />
                </Stack>
              </Grid>
            </Stack>
            <Stack gap={2}>
              <Label className="font-bold">Paper Size</Label>
              <Select className="border-2 border-black">
                <option value="letter">Letter (8.5 x 11)</option>
                <option value="a4">A4</option>
                <option value="ticket">Ticket Size (4 x 6)</option>
              </Select>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSettingsModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowSettingsModal(false)}>Save Settings</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
