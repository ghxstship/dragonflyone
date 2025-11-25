"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel,
  Modal, ModalHeader, ModalBody, ModalFooter, Badge, Alert,
} from "@ghxstship/ui";

interface AccessPoint {
  id: string;
  name: string;
  type: "Gate" | "Loading Dock" | "Parking" | "Entrance";
  status: "Open" | "Closed" | "Restricted";
  currentVehicles?: number;
  maxCapacity?: number;
  assignedCrew?: string[];
}

interface VehiclePass {
  id: string;
  vehicleType: "Truck" | "Van" | "Car" | "Bus";
  licensePlate: string;
  company: string;
  driver: string;
  accessPoints: string[];
  validFrom: string;
  validUntil: string;
  status: "Active" | "Expired" | "Pending";
}

const mockAccessPoints: AccessPoint[] = [
  { id: "AP-001", name: "Main Gate A", type: "Gate", status: "Open", currentVehicles: 3, maxCapacity: 5, assignedCrew: ["Security Team 1"] },
  { id: "AP-002", name: "Loading Dock 1", type: "Loading Dock", status: "Open", currentVehicles: 2, maxCapacity: 4 },
  { id: "AP-003", name: "Loading Dock 2", type: "Loading Dock", status: "Restricted", currentVehicles: 1, maxCapacity: 4 },
  { id: "AP-004", name: "Crew Parking", type: "Parking", status: "Open", currentVehicles: 45, maxCapacity: 100 },
  { id: "AP-005", name: "VIP Entrance", type: "Entrance", status: "Closed" },
];

const mockVehiclePasses: VehiclePass[] = [
  { id: "VP-001", vehicleType: "Truck", licensePlate: "ABC-1234", company: "PRG Lighting", driver: "John Smith", accessPoints: ["Main Gate A", "Loading Dock 1"], validFrom: "2024-11-24T06:00:00Z", validUntil: "2024-11-24T22:00:00Z", status: "Active" },
  { id: "VP-002", vehicleType: "Van", licensePlate: "XYZ-5678", company: "Audio Systems Inc", driver: "Mike Johnson", accessPoints: ["Main Gate A", "Loading Dock 2"], validFrom: "2024-11-24T08:00:00Z", validUntil: "2024-11-24T20:00:00Z", status: "Active" },
  { id: "VP-003", vehicleType: "Bus", licensePlate: "BUS-9999", company: "Artist Transport", driver: "Sarah Lee", accessPoints: ["Main Gate A", "VIP Entrance"], validFrom: "2024-11-24T16:00:00Z", validUntil: "2024-11-25T04:00:00Z", status: "Pending" },
];

export default function SiteAccessPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("access");
  const [showAddPassModal, setShowAddPassModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState<VehiclePass | null>(null);

  const openPoints = mockAccessPoints.filter(p => p.status === "Open").length;
  const activeVehicles = mockAccessPoints.reduce((sum, p) => sum + (p.currentVehicles || 0), 0);
  const activePasses = mockVehiclePasses.filter(p => p.status === "Active").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": case "Active": return "text-green-400";
      case "Restricted": case "Pending": return "text-yellow-400";
      case "Closed": case "Expired": return "text-red-400";
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
            <H1>Site Access Management</H1>
            <Label className="text-ink-400">Gates, parking, loading docks, and vehicle passes</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Open Access Points" value={`${openPoints}/${mockAccessPoints.length}`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Vehicles On Site" value={activeVehicles} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active Passes" value={activePasses} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pending Approval" value={mockVehiclePasses.filter(p => p.status === "Pending").length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "access"} onClick={() => setActiveTab("access")}>Access Points</Tab>
              <Tab active={activeTab === "vehicles"} onClick={() => setActiveTab("vehicles")}>Vehicle Passes</Tab>
              <Tab active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")}>Delivery Schedule</Tab>
            </TabsList>

            <TabPanel active={activeTab === "access"}>
              <Grid cols={3} gap={6}>
                {mockAccessPoints.map((point) => (
                  <Card key={point.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <H3>{point.name}</H3>
                          <Badge variant="outline">{point.type}</Badge>
                        </Stack>
                        <Label className={getStatusColor(point.status)}>{point.status}</Label>
                      </Stack>
                      {point.currentVehicles !== undefined && (
                        <Stack gap={2}>
                          <Label className="text-ink-400">Capacity: {point.currentVehicles}/{point.maxCapacity}</Label>
                          <Card className="h-2 bg-ink-800 rounded-full overflow-hidden">
                            <Card className={`h-full ${(point.currentVehicles / (point.maxCapacity || 1)) > 0.8 ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${(point.currentVehicles / (point.maxCapacity || 1)) * 100}%` }} />
                          </Card>
                        </Stack>
                      )}
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm">{point.status === "Open" ? "Close" : "Open"}</Button>
                        <Button variant="ghost" size="sm">Details</Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "vehicles"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockVehiclePasses.map((pass) => (
                    <TableRow key={pass.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Badge variant="outline">{pass.vehicleType}</Badge>
                          <Label className="font-mono text-ink-400">{pass.licensePlate}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell className="text-white">{pass.company}</TableCell>
                      <TableCell className="text-ink-300">{pass.driver}</TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={1}>
                          {pass.accessPoints.slice(0, 2).map(ap => <Badge key={ap} variant="outline">{ap}</Badge>)}
                        </Stack>
                      </TableCell>
                      <TableCell className="font-mono text-ink-400">{new Date(pass.validUntil).toLocaleTimeString()}</TableCell>
                      <TableCell><Label className={getStatusColor(pass.status)}>{pass.status}</Label></TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedPass(pass)}>View</Button>
                          {pass.status === "Pending" && <Button variant="outline" size="sm">Approve</Button>}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "schedule"}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>Today&apos;s Deliveries</H3>
                  <Stack gap={2}>
                    {mockVehiclePasses.map((pass) => (
                      <Card key={pass.id} className="p-4 bg-ink-800 border border-ink-700">
                        <Grid cols={4} gap={4}>
                          <Stack gap={1}>
                            <Label size="xs" className="text-ink-500">Time</Label>
                            <Label className="font-mono text-white">{new Date(pass.validFrom).toLocaleTimeString()}</Label>
                          </Stack>
                          <Stack gap={1}>
                            <Label size="xs" className="text-ink-500">Company</Label>
                            <Label className="text-white">{pass.company}</Label>
                          </Stack>
                          <Stack gap={1}>
                            <Label size="xs" className="text-ink-500">Vehicle</Label>
                            <Label className="text-ink-300">{pass.vehicleType} - {pass.licensePlate}</Label>
                          </Stack>
                          <Stack gap={1}>
                            <Label size="xs" className="text-ink-500">Destination</Label>
                            <Label className="text-ink-300">{pass.accessPoints[1] || pass.accessPoints[0]}</Label>
                          </Stack>
                        </Grid>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outlineWhite" onClick={() => setShowAddPassModal(true)}>Issue Vehicle Pass</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Print Manifest</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/build-strike")}>Build & Strike</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showAddPassModal} onClose={() => setShowAddPassModal(false)}>
        <ModalHeader><H3>Issue Vehicle Pass</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Vehicle type...</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Car">Car</option>
              <option value="Bus">Bus</option>
            </Select>
            <Input placeholder="License Plate" className="border-ink-700 bg-black text-white" />
            <Input placeholder="Company" className="border-ink-700 bg-black text-white" />
            <Input placeholder="Driver Name" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Input type="datetime-local" className="border-ink-700 bg-black text-white" />
              <Input type="datetime-local" className="border-ink-700 bg-black text-white" />
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
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Vehicle</Label><Label className="text-white">{selectedPass.vehicleType}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">License</Label><Label className="font-mono text-white">{selectedPass.licensePlate}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label size="xs" className="text-ink-500">Company</Label><Label className="text-white">{selectedPass.company}</Label></Stack>
              <Stack gap={1}><Label size="xs" className="text-ink-500">Driver</Label><Label className="text-white">{selectedPass.driver}</Label></Stack>
              <Stack gap={2}>
                <Label size="xs" className="text-ink-500">Access Points</Label>
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
    </UISection>
  );
}
