"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert,
} from "@ghxstship/ui";

interface RentalEquipment {
  id: string;
  name: string;
  category: string;
  vendor: string;
  vendorContact?: string;
  projectId: string;
  projectName: string;
  rentalStart: string;
  rentalEnd: string;
  dailyRate: number;
  totalCost: number;
  status: "Reserved" | "On Rent" | "Returned" | "Overdue" | "Damaged";
  poNumber?: string;
  serialNumber?: string;
  condition: "Excellent" | "Good" | "Fair" | "Damaged";
  notes?: string;
}

const mockRentals: RentalEquipment[] = [
  { id: "RNT-001", name: "Barco UDX-4K32", category: "Video", vendor: "PRG", vendorContact: "rentals@prg.com", projectId: "PROJ-089", projectName: "Summer Fest 2024", rentalStart: "2024-11-20", rentalEnd: "2024-11-26", dailyRate: 1500, totalCost: 10500, status: "On Rent", poNumber: "PO-2024-456", serialNumber: "BRC-4K32-1234", condition: "Excellent" },
  { id: "RNT-002", name: "d&b audiotechnik SL-SUB", category: "Audio", vendor: "Sound Systems Inc", projectId: "PROJ-089", projectName: "Summer Fest 2024", rentalStart: "2024-11-20", rentalEnd: "2024-11-26", dailyRate: 200, totalCost: 1400, status: "On Rent", poNumber: "PO-2024-457", condition: "Good" },
  { id: "RNT-003", name: "Stageline SL-320 Mobile Stage", category: "Staging", vendor: "Stageline", projectId: "PROJ-089", projectName: "Summer Fest 2024", rentalStart: "2024-11-18", rentalEnd: "2024-11-27", dailyRate: 3500, totalCost: 35000, status: "On Rent", poNumber: "PO-2024-450", condition: "Good" },
  { id: "RNT-004", name: "CM Lodestar 2-Ton (x10)", category: "Rigging", vendor: "Rigging Solutions", projectId: "PROJ-090", projectName: "Corporate Gala", rentalStart: "2024-12-01", rentalEnd: "2024-12-05", dailyRate: 150, totalCost: 750, status: "Reserved", condition: "Excellent" },
  { id: "RNT-005", name: "Avolites Arena Console", category: "Lighting", vendor: "4Wall", projectId: "PROJ-088", projectName: "Fall Festival", rentalStart: "2024-11-10", rentalEnd: "2024-11-16", dailyRate: 500, totalCost: 3500, status: "Returned", poNumber: "PO-2024-440", serialNumber: "AVL-ARENA-5678", condition: "Good" },
  { id: "RNT-006", name: "Shure ULXD4Q Wireless System", category: "Audio", vendor: "PRG", projectId: "PROJ-088", projectName: "Fall Festival", rentalStart: "2024-11-10", rentalEnd: "2024-11-16", dailyRate: 75, totalCost: 525, status: "Overdue", poNumber: "PO-2024-441", condition: "Good", notes: "Return delayed - pickup scheduled 11/18" },
];

export default function RentalEquipmentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedRental, setSelectedRental] = useState<RentalEquipment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const activeRentals = mockRentals.filter(r => r.status === "On Rent" || r.status === "Reserved");
  const overdueRentals = mockRentals.filter(r => r.status === "Overdue");
  const totalRentalCost = mockRentals.filter(r => r.status !== "Returned").reduce((sum, r) => sum + r.totalCost, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Returned": return "text-green-400";
      case "On Rent": return "text-blue-400";
      case "Reserved": return "text-ink-400";
      case "Overdue": return "text-red-400";
      case "Damaged": return "text-orange-400";
      default: return "text-ink-400";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Rental Equipment Tracking</H1>
            <Label className="text-ink-400">Track third-party rental equipment across all projects</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Active Rentals" value={activeRentals.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Overdue" value={overdueRentals.length} trend={overdueRentals.length > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Rental Cost" value={`$${(totalRentalCost / 1000).toFixed(1)}K`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Vendors" value={new Set(mockRentals.map(r => r.vendor)).size} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {overdueRentals.length > 0 && (
            <Alert variant="warning">{overdueRentals.length} rental(s) are overdue and need to be returned</Alert>
          )}

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "active"} onClick={() => setActiveTab("active")}>Active ({activeRentals.length})</Tab>
                <Tab active={activeTab === "returned"} onClick={() => setActiveTab("returned")}>Returned</Tab>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
              </TabsList>
            </Tabs>
            <Button variant="outlineWhite" onClick={() => setShowAddModal(true)}>Add Rental</Button>
          </Stack>

          <Table className="border-2 border-ink-800">
            <TableHeader>
              <TableRow className="bg-ink-900">
                <TableHead>Equipment</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Rental Period</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRentals
                .filter(r => activeTab === "all" || (activeTab === "active" ? (r.status === "On Rent" || r.status === "Reserved" || r.status === "Overdue") : r.status === "Returned"))
                .map((rental) => (
                  <TableRow key={rental.id} className={rental.status === "Overdue" ? "bg-red-900/10" : ""}>
                    <TableCell>
                      <Stack gap={1}>
                        <Body className="text-white">{rental.name}</Body>
                        <Badge variant="outline">{rental.category}</Badge>
                      </Stack>
                    </TableCell>
                    <TableCell><Label className="text-ink-300">{rental.vendor}</Label></TableCell>
                    <TableCell><Label className="text-ink-300">{rental.projectName}</Label></TableCell>
                    <TableCell>
                      <Stack gap={0}>
                        <Label className="font-mono text-white">{rental.rentalStart}</Label>
                        <Label className="font-mono text-ink-500">to {rental.rentalEnd}</Label>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack gap={0}>
                        <Label className="font-mono text-white">${rental.totalCost.toLocaleString()}</Label>
                        <Label size="xs" className="text-ink-500">${rental.dailyRate}/day</Label>
                      </Stack>
                    </TableCell>
                    <TableCell><Label className={getStatusColor(rental.status)}>{rental.status}</Label></TableCell>
                    <TableCell>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedRental(rental)}>Details</Button>
                        {(rental.status === "On Rent" || rental.status === "Overdue") && (
                          <Button variant="outline" size="sm" onClick={() => { setSelectedRental(rental); setShowReturnModal(true); }}>Return</Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Report</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Vendor Contacts</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/assets")}>Back to Assets</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedRental && !showReturnModal} onClose={() => setSelectedRental(null)}>
        <ModalHeader><H3>Rental Details</H3></ModalHeader>
        <ModalBody>
          {selectedRental && (
            <Stack gap={4}>
              <Body className="font-display text-white text-lg">{selectedRental.name}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Category</Label><Badge variant="outline">{selectedRental.category}</Badge></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Status</Label><Label className={getStatusColor(selectedRental.status)}>{selectedRental.status}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Vendor</Label><Label className="text-white">{selectedRental.vendor}</Label></Stack>
                {selectedRental.vendorContact && <Stack gap={1}><Label size="xs" className="text-ink-500">Contact</Label><Label className="text-white">{selectedRental.vendorContact}</Label></Stack>}
              </Grid>
              <Stack gap={1}><Label size="xs" className="text-ink-500">Project</Label><Label className="text-white">{selectedRental.projectName}</Label></Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Rental Period</Label><Label className="font-mono text-white">{selectedRental.rentalStart} to {selectedRental.rentalEnd}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Total Cost</Label><Label className="font-mono text-white">${selectedRental.totalCost.toLocaleString()}</Label></Stack>
              </Grid>
              {selectedRental.poNumber && <Stack gap={1}><Label size="xs" className="text-ink-500">PO Number</Label><Label className="font-mono text-white">{selectedRental.poNumber}</Label></Stack>}
              {selectedRental.serialNumber && <Stack gap={1}><Label size="xs" className="text-ink-500">Serial Number</Label><Label className="font-mono text-white">{selectedRental.serialNumber}</Label></Stack>}
              <Stack gap={1}><Label size="xs" className="text-ink-500">Condition</Label><Label className="text-white">{selectedRental.condition}</Label></Stack>
              {selectedRental.notes && <Stack gap={1}><Label size="xs" className="text-ink-500">Notes</Label><Body className="text-ink-300">{selectedRental.notes}</Body></Stack>}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedRental(null)}>Close</Button>
          <Button variant="solid">Edit Rental</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showReturnModal} onClose={() => { setShowReturnModal(false); setSelectedRental(null); }}>
        <ModalHeader><H3>Return Equipment</H3></ModalHeader>
        <ModalBody>
          {selectedRental && (
            <Stack gap={4}>
              <Body className="text-white">{selectedRental.name}</Body>
              <Label className="text-ink-400">Vendor: {selectedRental.vendor}</Label>
              <Stack gap={2}>
                <Label>Return Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="border-ink-700 bg-black text-white" />
              </Stack>
              <Stack gap={2}>
                <Label>Condition on Return</Label>
                <Select defaultValue={selectedRental.condition} className="border-ink-700 bg-black text-white">
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Damaged">Damaged</option>
                </Select>
              </Stack>
              <Textarea placeholder="Return notes (any damage, issues, etc.)..." className="border-ink-700 bg-black text-white" rows={3} />
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowReturnModal(false); setSelectedRental(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowReturnModal(false); setSelectedRental(null); }}>Complete Return</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Rental Equipment</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Equipment Name" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Category...</option>
                <option value="Audio">Audio</option>
                <option value="Lighting">Lighting</option>
                <option value="Video">Video</option>
                <option value="Staging">Staging</option>
                <option value="Rigging">Rigging</option>
              </Select>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Vendor...</option>
                <option value="PRG">PRG</option>
                <option value="4Wall">4Wall</option>
                <option value="Sound Systems Inc">Sound Systems Inc</option>
                <option value="Stageline">Stageline</option>
              </Select>
            </Grid>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Project...</option>
              <option value="PROJ-089">Summer Fest 2024</option>
              <option value="PROJ-090">Corporate Gala</option>
            </Select>
            <Grid cols={2} gap={4}>
              <Stack gap={2}>
                <Label>Start Date</Label>
                <Input type="date" className="border-ink-700 bg-black text-white" />
              </Stack>
              <Stack gap={2}>
                <Label>End Date</Label>
                <Input type="date" className="border-ink-700 bg-black text-white" />
              </Stack>
            </Grid>
            <Grid cols={2} gap={4}>
              <Input type="number" placeholder="Daily Rate ($)" className="border-ink-700 bg-black text-white" />
              <Input placeholder="PO Number" className="border-ink-700 bg-black text-white" />
            </Grid>
            <Input placeholder="Serial Number (optional)" className="border-ink-700 bg-black text-white" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add Rental</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
