"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../components/app-layout";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  EnterprisePageHeader,
  MainContent,
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
      case "Open": case "Active": return "text-success-400";
      case "Restricted": case "Pending": return "text-warning-400";
      case "Closed": case "Expired": return "text-error-400";
      default: return "text-ink-400";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Site Access Management"
        subtitle="Gates, parking, loading docks, and vehicle passes"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Site Access' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        primaryAction={{ label: 'Issue Vehicle Pass', onClick: () => setShowAddPassModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard value={`${openPoints}/${mockAccessPoints.length}`} label="Open Access Points" />
              <StatCard value={activeVehicles.toString()} label="Vehicles On Site" />
              <StatCard value={activePasses.toString()} label="Active Passes" />
              <StatCard value={mockVehiclePasses.filter(p => p.status === "Pending").length.toString()} label="Pending Approval" />
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
                    <Card key={point.id} className="p-6">
                      <Stack gap={4}>
                        <Stack direction="horizontal" className="items-start justify-between">
                          <Stack gap={1}>
                            <H3>{point.name}</H3>
                            <Badge variant="outline">{point.type}</Badge>
                          </Stack>
                          <Badge variant={point.status === "Open" ? "solid" : "outline"}>{point.status}</Badge>
                        </Stack>
                        {point.currentVehicles !== undefined && (
                          <Stack gap={2}>
                            <Body className="text-body-sm">Capacity: {point.currentVehicles}/{point.maxCapacity}</Body>
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
                <Table>
                  <TableHeader>
                    <TableRow>
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
                            <Body className="text-body-sm">{pass.licensePlate}</Body>
                          </Stack>
                        </TableCell>
                        <TableCell><Body>{pass.company}</Body></TableCell>
                        <TableCell><Body className="text-body-sm">{pass.driver}</Body></TableCell>
                        <TableCell>
                          <Stack direction="horizontal" gap={1}>
                            {pass.accessPoints.slice(0, 2).map(ap => <Badge key={ap} variant="outline">{ap}</Badge>)}
                          </Stack>
                        </TableCell>
                        <TableCell><Body className="text-body-sm">{new Date(pass.validUntil).toLocaleTimeString()}</Body></TableCell>
                        <TableCell><Badge variant={pass.status === "Active" ? "solid" : "outline"}>{pass.status}</Badge></TableCell>
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
                <Card className="p-6">
                  <Stack gap={4}>
                    <H3>Today&apos;s Deliveries</H3>
                    <Stack gap={2}>
                      {mockVehiclePasses.map((pass) => (
                        <Card key={pass.id} className="p-4">
                          <Grid cols={4} gap={4}>
                            <Stack gap={1}>
                              <Body className="text-body-sm">Time</Body>
                              <Body>{new Date(pass.validFrom).toLocaleTimeString()}</Body>
                            </Stack>
                            <Stack gap={1}>
                              <Body className="text-body-sm">Company</Body>
                              <Body>{pass.company}</Body>
                            </Stack>
                            <Stack gap={1}>
                              <Body className="text-body-sm">Vehicle</Body>
                              <Body>{pass.vehicleType} - {pass.licensePlate}</Body>
                            </Stack>
                            <Stack gap={1}>
                              <Body className="text-body-sm">Destination</Body>
                              <Body>{pass.accessPoints[1] || pass.accessPoints[0]}</Body>
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
              <Button variant="solid" onClick={() => setShowAddPassModal(true)}>Issue Vehicle Pass</Button>
              <Button variant="outline">Print Manifest</Button>
              <Button variant="outline" onClick={() => router.push("/build-strike")}>Build & Strike</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

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
            <Grid cols={2} gap={4}>
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
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Vehicle</Body>
                  <Body>{selectedPass.vehicleType}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">License</Body>
                  <Body>{selectedPass.licensePlate}</Body>
                </Stack>
              </Grid>
              <Stack gap={1}>
                <Body className="text-body-sm">Company</Body>
                <Body>{selectedPass.company}</Body>
              </Stack>
              <Stack gap={1}>
                <Body className="text-body-sm">Driver</Body>
                <Body>{selectedPass.driver}</Body>
              </Stack>
              <Stack gap={2}>
                <Body className="text-body-sm">Access Points</Body>
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
    </CompvssAppLayout>
  );
}
