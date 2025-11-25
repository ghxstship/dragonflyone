"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface RFIDWristband {
  id: string;
  wristbandId: string;
  guestName: string;
  email: string;
  ticketType: string;
  balance: number;
  status: "Active" | "Inactive" | "Lost" | "Replaced";
  registeredAt: string;
  lastUsed?: string;
  transactions: number;
}

interface Transaction {
  id: string;
  wristbandId: string;
  type: "Purchase" | "Top-Up" | "Refund";
  amount: number;
  vendor: string;
  timestamp: string;
  items?: string;
}

const mockWristbands: RFIDWristband[] = [
  { id: "WB-001", wristbandId: "RFID-A1B2C3", guestName: "John Smith", email: "john@email.com", ticketType: "VIP", balance: 125.50, status: "Active", registeredAt: "2024-11-24T14:00:00Z", lastUsed: "2024-11-24T20:15:00Z", transactions: 8 },
  { id: "WB-002", wristbandId: "RFID-D4E5F6", guestName: "Sarah Johnson", email: "sarah@email.com", ticketType: "GA", balance: 45.00, status: "Active", registeredAt: "2024-11-24T15:30:00Z", lastUsed: "2024-11-24T19:45:00Z", transactions: 3 },
  { id: "WB-003", wristbandId: "RFID-G7H8I9", guestName: "Mike Davis", email: "mike@email.com", ticketType: "VIP", balance: 0, status: "Active", registeredAt: "2024-11-24T13:00:00Z", lastUsed: "2024-11-24T21:00:00Z", transactions: 12 },
  { id: "WB-004", wristbandId: "RFID-J1K2L3", guestName: "Emily Chen", email: "emily@email.com", ticketType: "GA", balance: 75.25, status: "Lost", registeredAt: "2024-11-24T16:00:00Z", transactions: 2 },
];

const mockTransactions: Transaction[] = [
  { id: "TXN-001", wristbandId: "RFID-A1B2C3", type: "Top-Up", amount: 100, vendor: "Top-Up Station", timestamp: "2024-11-24T14:05:00Z" },
  { id: "TXN-002", wristbandId: "RFID-A1B2C3", type: "Purchase", amount: -15.50, vendor: "Main Bar", timestamp: "2024-11-24T18:30:00Z", items: "2x Beer" },
  { id: "TXN-003", wristbandId: "RFID-A1B2C3", type: "Purchase", amount: -25.00, vendor: "Merch Booth", timestamp: "2024-11-24T19:15:00Z", items: "Event T-Shirt" },
  { id: "TXN-004", wristbandId: "RFID-D4E5F6", type: "Top-Up", amount: 50, vendor: "Top-Up Station", timestamp: "2024-11-24T15:35:00Z" },
  { id: "TXN-005", wristbandId: "RFID-D4E5F6", type: "Purchase", amount: -5.00, vendor: "Food Court", timestamp: "2024-11-24T17:00:00Z", items: "Nachos" },
];

export default function RFIDPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const [activeTab, setActiveTab] = useState("wristbands");
  const [selectedWristband, setSelectedWristband] = useState<RFIDWristband | null>(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const totalBalance = mockWristbands.reduce((sum, w) => sum + w.balance, 0);
  const activeWristbands = mockWristbands.filter(w => w.status === "Active").length;
  const totalTransactions = mockWristbands.reduce((sum, w) => sum + w.transactions, 0);

  const filteredWristbands = mockWristbands.filter(w =>
    w.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.wristbandId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-green-600";
      case "Inactive": return "text-gray-600";
      case "Lost": return "text-red-600";
      case "Replaced": return "text-yellow-600";
      default: return "text-gray-600";
    }
  };

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>RFID WRISTBANDS</H1>
            <Body className="text-gray-600">Cashless payment and access control system</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Active Wristbands" value={activeWristbands} className="border-2 border-black" />
            <StatCard label="Total Balance" value={`$${totalBalance.toFixed(2)}`} className="border-2 border-black" />
            <StatCard label="Transactions" value={totalTransactions} className="border-2 border-black" />
            <StatCard label="Avg Balance" value={`$${(totalBalance / activeWristbands).toFixed(2)}`} className="border-2 border-black" />
          </Grid>

          <Grid cols={2} gap={4}>
            <Input type="search" placeholder="Search by name, email, or wristband ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-2 border-black" />
            <Button variant="solid">Scan Wristband</Button>
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "wristbands"} onClick={() => setActiveTab("wristbands")}>Wristbands</Tab>
              <Tab active={activeTab === "transactions"} onClick={() => setActiveTab("transactions")}>Transactions</Tab>
              <Tab active={activeTab === "topup"} onClick={() => setActiveTab("topup")}>Top-Up Stations</Tab>
            </TabsList>

            <TabPanel active={activeTab === "wristbands"}>
              <Table className="border-2 border-black">
                <TableHeader>
                  <TableRow className="bg-black text-white">
                    <TableHead>Wristband</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWristbands.map((wristband) => (
                    <TableRow key={wristband.id}>
                      <TableCell><Label className="font-mono">{wristband.wristbandId}</Label></TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <Body>{wristband.guestName}</Body>
                          <Label size="xs" className="text-gray-500">{wristband.email}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell><Badge variant="outline">{wristband.ticketType}</Badge></TableCell>
                      <TableCell><Label className="font-mono text-lg">${wristband.balance.toFixed(2)}</Label></TableCell>
                      <TableCell><Label className={getStatusColor(wristband.status)}>{wristband.status}</Label></TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="outline" size="sm" onClick={() => setSelectedWristband(wristband)}>Details</Button>
                          {wristband.status === "Active" && (
                            <Button variant="solid" size="sm" onClick={() => { setSelectedWristband(wristband); setShowTopUpModal(true); }}>Top Up</Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "transactions"}>
              <Table className="border-2 border-black">
                <TableHeader>
                  <TableRow className="bg-black text-white">
                    <TableHead>Time</TableHead>
                    <TableHead>Wristband</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTransactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell><Label>{new Date(txn.timestamp).toLocaleTimeString()}</Label></TableCell>
                      <TableCell><Label className="font-mono">{txn.wristbandId}</Label></TableCell>
                      <TableCell><Badge variant={txn.type === "Top-Up" ? "solid" : "outline"}>{txn.type}</Badge></TableCell>
                      <TableCell><Label>{txn.vendor}</Label></TableCell>
                      <TableCell><Label className="text-gray-500">{txn.items || "-"}</Label></TableCell>
                      <TableCell><Label className={`font-mono ${txn.amount > 0 ? "text-green-600" : "text-red-600"}`}>{txn.amount > 0 ? "+" : ""}${txn.amount.toFixed(2)}</Label></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "topup"}>
              <Grid cols={3} gap={4}>
                {["Main Entrance", "VIP Area", "Food Court", "Merch Zone"].map((station) => (
                  <Card key={station} className="border-2 border-black p-4">
                    <Stack gap={3}>
                      <Body className="font-bold">{station}</Body>
                      <Grid cols={2} gap={2}>
                        <Stack gap={1}><Label size="xs" className="text-gray-500">Today</Label><Label className="font-mono">$2,450</Label></Stack>
                        <Stack gap={1}><Label size="xs" className="text-gray-500">Transactions</Label><Label className="font-mono">89</Label></Stack>
                      </Grid>
                      <Badge variant="outline" className="text-green-600">Online</Badge>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>
          </Tabs>

          <Grid cols={2} gap={4}>
            <Button variant="outline" onClick={() => router.push(`/events/${eventId}`)}>Back to Event</Button>
            <Button variant="outline" onClick={() => router.push(`/events/${eventId}/pos`)}>POS System</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showTopUpModal} onClose={() => { setShowTopUpModal(false); setSelectedWristband(null); }}>
        <ModalHeader><H3>Top Up Wristband</H3></ModalHeader>
        <ModalBody>
          {selectedWristband && (
            <Stack gap={4}>
              <Card className="p-4 bg-gray-50 border border-gray-200">
                <Stack direction="horizontal" className="justify-between">
                  <Stack gap={1}>
                    <Body className="font-bold">{selectedWristband.guestName}</Body>
                    <Label className="font-mono text-gray-500">{selectedWristband.wristbandId}</Label>
                  </Stack>
                  <Stack gap={1} className="text-right">
                    <Label size="xs" className="text-gray-500">Current Balance</Label>
                    <Label className="font-mono text-xl">${selectedWristband.balance.toFixed(2)}</Label>
                  </Stack>
                </Stack>
              </Card>
              <Stack gap={2}>
                <Label>Top Up Amount</Label>
                <Grid cols={4} gap={2}>
                  {[25, 50, 75, 100].map((amount) => (
                    <Button key={amount} variant="outline">${amount}</Button>
                  ))}
                </Grid>
                <Input type="number" placeholder="Custom amount" className="border-2 border-black" />
              </Stack>
              <Alert variant="info">Payment will be processed via card on file or cash</Alert>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowTopUpModal(false); setSelectedWristband(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowTopUpModal(false); setSelectedWristband(null); }}>Process Top Up</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedWristband && !showTopUpModal} onClose={() => setSelectedWristband(null)}>
        <ModalHeader><H3>Wristband Details</H3></ModalHeader>
        <ModalBody>
          {selectedWristband && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Body className="font-bold text-lg">{selectedWristband.guestName}</Body>
                <Label className={getStatusColor(selectedWristband.status)}>{selectedWristband.status}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Wristband ID</Label><Label className="font-mono">{selectedWristband.wristbandId}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Ticket Type</Label><Badge variant="outline">{selectedWristband.ticketType}</Badge></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Balance</Label><Label className="font-mono text-xl">${selectedWristband.balance.toFixed(2)}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Transactions</Label><Label>{selectedWristband.transactions}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label size="xs" className="text-gray-500">Email</Label><Label>{selectedWristband.email}</Label></Stack>
              <Stack gap={2}>
                <Label className="text-gray-500">Recent Transactions</Label>
                {mockTransactions.filter(t => t.wristbandId === selectedWristband.wristbandId).slice(0, 3).map(txn => (
                  <Card key={txn.id} className="p-3 bg-gray-50 border border-gray-200">
                    <Stack direction="horizontal" className="justify-between">
                      <Stack gap={1}>
                        <Label>{txn.vendor}</Label>
                        <Label size="xs" className="text-gray-500">{txn.items || txn.type}</Label>
                      </Stack>
                      <Label className={`font-mono ${txn.amount > 0 ? "text-green-600" : ""}`}>{txn.amount > 0 ? "+" : ""}${txn.amount.toFixed(2)}</Label>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedWristband(null)}>Close</Button>
          {selectedWristband?.status === "Active" && <Button variant="outline">Report Lost</Button>}
          {selectedWristband?.balance && selectedWristband.balance > 0 && <Button variant="solid">Refund Balance</Button>}
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
