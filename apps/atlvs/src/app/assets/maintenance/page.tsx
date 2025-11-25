"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import { Badge, Section, SectionHeader } from "../../../components/section";
import {
  Container,
  H1,
  H2,
  H3,
  Body,
  Label,
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
  EmptyState,
  Section as UISection,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ProgressBar,
  Textarea,
} from "@ghxstship/ui";

interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  type: "Preventive" | "Corrective" | "Emergency" | "Inspection";
  status: "Scheduled" | "In Progress" | "Completed" | "Overdue";
  priority: "Low" | "Medium" | "High" | "Critical";
  scheduledDate: string;
  completedDate?: string;
  technician?: string;
  vendor?: string;
  cost?: number;
  description: string;
  notes?: string;
  partsUsed?: { name: string; quantity: number; cost: number }[];
  laborHours?: number;
  nextDue?: string;
}

const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: "MNT-001",
    assetId: "AST-001",
    assetName: "Meyer Sound LEO Family Line Array",
    category: "Audio",
    type: "Preventive",
    status: "Scheduled",
    priority: "Medium",
    scheduledDate: "2025-01-15",
    description: "Quarterly speaker driver inspection and firmware update",
    technician: "John Martinez",
    nextDue: "2025-04-15",
  },
  {
    id: "MNT-002",
    assetId: "AST-002",
    assetName: "Robe MegaPointe Lighting Fixtures (24x)",
    category: "Lighting",
    type: "Corrective",
    status: "In Progress",
    priority: "High",
    scheduledDate: "2024-11-20",
    description: "Replace faulty gobo wheel motor on unit #7",
    technician: "Sarah Chen",
    vendor: "Robe Lighting Service Center",
    cost: 1250,
    partsUsed: [
      { name: "Gobo Wheel Motor Assembly", quantity: 1, cost: 850 },
      { name: "Drive Belt", quantity: 1, cost: 45 },
    ],
    laborHours: 4,
  },
  {
    id: "MNT-003",
    assetId: "AST-003",
    assetName: "disguise gx 2c Media Server",
    category: "Video",
    type: "Preventive",
    status: "Completed",
    priority: "Medium",
    scheduledDate: "2024-11-18",
    completedDate: "2024-11-18",
    description: "Annual system diagnostics and thermal paste replacement",
    technician: "Mike Thompson",
    cost: 450,
    laborHours: 3,
    notes: "All tests passed. Thermal performance improved by 15%.",
    nextDue: "2025-11-18",
  },
  {
    id: "MNT-004",
    assetId: "AST-005",
    assetName: "Chain Motor Hoists (20x 2-ton)",
    category: "Rigging",
    type: "Inspection",
    status: "Overdue",
    priority: "Critical",
    scheduledDate: "2024-11-01",
    description: "Annual safety inspection and load testing - OSHA compliance",
    notes: "URGENT: Cannot be used until inspection completed",
  },
  {
    id: "MNT-005",
    assetId: "AST-004",
    assetName: "Staging Deck System (60x8 modules)",
    category: "Staging",
    type: "Preventive",
    status: "Completed",
    priority: "Low",
    scheduledDate: "2024-10-01",
    completedDate: "2024-10-01",
    description: "Surface refinishing and hardware inspection",
    technician: "Tom Wilson",
    cost: 2800,
    laborHours: 16,
    partsUsed: [
      { name: "Non-slip Surface Coating (5 gal)", quantity: 3, cost: 450 },
      { name: "Replacement Leg Pins", quantity: 24, cost: 180 },
    ],
    nextDue: "2025-04-01",
  },
];

const serviceVendors = [
  { id: "V-001", name: "Robe Lighting Service Center", specialty: "Lighting", rating: 4.8 },
  { id: "V-002", name: "Meyer Sound Authorized Service", specialty: "Audio", rating: 4.9 },
  { id: "V-003", name: "PRG Technical Services", specialty: "Multi-discipline", rating: 4.7 },
  { id: "V-004", name: "Columbus McKinnon Rigging", specialty: "Rigging", rating: 4.6 },
];

export default function AssetMaintenancePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [activeTab, setActiveTab] = useState("records");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);

  const filteredRecords = mockMaintenanceRecords.filter((record) => {
    const matchesSearch =
      record.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || record.status === selectedStatus;
    const matchesType = selectedType === "All" || record.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const scheduledCount = mockMaintenanceRecords.filter((r) => r.status === "Scheduled").length;
  const inProgressCount = mockMaintenanceRecords.filter((r) => r.status === "In Progress").length;
  const overdueCount = mockMaintenanceRecords.filter((r) => r.status === "Overdue").length;
  const totalCost = mockMaintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "text-blue-400";
      case "In Progress":
        return "text-yellow-400";
      case "Completed":
        return "text-green-400";
      case "Overdue":
        return "text-red-400";
      default:
        return "text-ink-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "text-red-400";
      case "High":
        return "text-orange-400";
      case "Medium":
        return "text-yellow-400";
      case "Low":
        return "text-green-400";
      default:
        return "text-ink-400";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />

      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Asset Maintenance</H1>
            <Label className="text-ink-400">
              Maintenance scheduling, service records, and preventive maintenance tracking
            </Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              label="Scheduled"
              value={scheduledCount}
              className="bg-transparent border-2 border-ink-800"
            />
            <StatCard
              label="In Progress"
              value={inProgressCount}
              className="bg-transparent border-2 border-ink-800"
            />
            <StatCard
              label="Overdue"
              value={overdueCount}
              trend={overdueCount > 0 ? "down" : "neutral"}
              className="bg-transparent border-2 border-ink-800"
            />
            <StatCard
              label="YTD Costs"
              value={`$${(totalCost / 1000).toFixed(1)}K`}
              className="bg-transparent border-2 border-ink-800"
            />
          </Grid>

          <Section border>
            <Grid cols={4} gap={4}>
              <Input
                type="search"
                placeholder="Search maintenance records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-ink-700 bg-black text-white col-span-2"
              />
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border-ink-700 bg-black text-white"
              >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </Select>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border-ink-700 bg-black text-white"
              >
                <option value="All">All Types</option>
                <option value="Preventive">Preventive</option>
                <option value="Corrective">Corrective</option>
                <option value="Emergency">Emergency</option>
                <option value="Inspection">Inspection</option>
              </Select>
            </Grid>
          </Section>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "records"} onClick={() => setActiveTab("records")}>Maintenance Records</Tab>
              <Tab active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")}>Upcoming Schedule</Tab>
              <Tab active={activeTab === "vendors"} onClick={() => setActiveTab("vendors")}>Service Vendors</Tab>
            </TabsList>

            <TabPanel active={activeTab === "records"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="font-display text-white">{record.assetName}</Body>
                          <Label size="xs" className="text-ink-500">{record.assetId} • {record.category}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.type === "Emergency" ? "solid" : "outline"}>
                          {record.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Label className="text-ink-300">{record.description}</Label>
                      </TableCell>
                      <TableCell>
                        <Label className={getPriorityColor(record.priority)}>{record.priority}</Label>
                      </TableCell>
                      <TableCell>
                        <Label className={getStatusColor(record.status)}>{record.status}</Label>
                      </TableCell>
                      <TableCell className="font-mono text-ink-300">
                        {record.scheduledDate}
                      </TableCell>
                      <TableCell className="font-mono text-white">
                        {record.cost ? `$${record.cost.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRecord(record)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "schedule"}>
              <Grid cols={2} gap={6}>
                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <H3>Upcoming This Week</H3>
                    {mockMaintenanceRecords
                      .filter((r) => r.status === "Scheduled")
                      .map((record) => (
                        <Card key={record.id} className="p-4 bg-ink-800 border border-ink-700">
                          <Stack gap={2}>
                            <Stack gap={1}>
                              <Label className="text-white font-display">{record.assetName}</Label>
                              <Label size="xs" className="text-ink-400">{record.description}</Label>
                            </Stack>
                            <Grid cols={2} gap={2}>
                              <Label size="xs" className="font-mono text-ink-400">
                                {record.scheduledDate}
                              </Label>
                              <Label size="xs" className={getPriorityColor(record.priority)}>
                                {record.priority}
                              </Label>
                            </Grid>
                          </Stack>
                        </Card>
                      ))}
                  </Stack>
                </Card>

                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <H3>Overdue Items</H3>
                    {mockMaintenanceRecords
                      .filter((r) => r.status === "Overdue")
                      .map((record) => (
                        <Card key={record.id} className="p-4 bg-red-900/20 border border-red-800">
                          <Stack gap={2}>
                            <Stack gap={1}>
                              <Label className="text-white font-display">{record.assetName}</Label>
                              <Label size="xs" className="text-red-400">{record.description}</Label>
                            </Stack>
                            <Grid cols={2} gap={2}>
                              <Label size="xs" className="font-mono text-red-400">
                                Due: {record.scheduledDate}
                              </Label>
                              <Badge variant="solid">{record.priority}</Badge>
                            </Grid>
                            {record.notes && (
                              <Label size="xs" className="text-red-300">{record.notes}</Label>
                            )}
                          </Stack>
                        </Card>
                      ))}
                    {mockMaintenanceRecords.filter((r) => r.status === "Overdue").length === 0 && (
                      <Label className="text-ink-500">No overdue items</Label>
                    )}
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "vendors"}>
              <Grid cols={2} gap={6}>
                {serviceVendors.map((vendor) => (
                  <Card key={vendor.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <Stack gap={1}>
                        <H3>{vendor.name}</H3>
                        <Label className="text-ink-400">{vendor.specialty}</Label>
                      </Stack>
                      <Grid cols={2} gap={4}>
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Rating</Label>
                          <Label className="text-white">{vendor.rating} / 5.0</Label>
                        </Stack>
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Jobs Completed</Label>
                          <Label className="text-white">{Math.floor(Math.random() * 50) + 10}</Label>
                        </Stack>
                      </Grid>
                      <Grid cols={2} gap={2}>
                        <Button variant="outline" size="sm">Contact</Button>
                        <Button variant="outline" size="sm">View History</Button>
                      </Grid>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>
          </Tabs>

          <Grid cols={4} gap={4}>
            <Button variant="outlineWhite" onClick={() => setShowScheduleModal(true)}>
              Schedule Maintenance
            </Button>
            <Button variant="outline" className="border-ink-700 text-ink-400 hover:border-white hover:text-white">
              Generate Report
            </Button>
            <Button variant="outline" className="border-ink-700 text-ink-400 hover:border-white hover:text-white">
              Export Records
            </Button>
            <Button variant="outline" className="border-ink-700 text-ink-400 hover:border-white hover:text-white" onClick={() => router.push("/assets")}>
              Back to Assets
            </Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showScheduleModal} onClose={() => setShowScheduleModal(false)}>
        <ModalHeader>
          <H3>Schedule Maintenance</H3>
        </ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Stack gap={2}>
              <Label>Asset</Label>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Select an asset...</option>
                {mockMaintenanceRecords.map((r) => (
                  <option key={r.assetId} value={r.assetId}>{r.assetName}</option>
                ))}
              </Select>
            </Stack>
            <Stack gap={2}>
              <Label>Maintenance Type</Label>
              <Select className="border-ink-700 bg-black text-white">
                <option value="Preventive">Preventive</option>
                <option value="Corrective">Corrective</option>
                <option value="Emergency">Emergency</option>
                <option value="Inspection">Inspection</option>
              </Select>
            </Stack>
            <Stack gap={2}>
              <Label>Priority</Label>
              <Select className="border-ink-700 bg-black text-white">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </Select>
            </Stack>
            <Stack gap={2}>
              <Label>Scheduled Date</Label>
              <Input type="date" className="border-ink-700 bg-black text-white" />
            </Stack>
            <Stack gap={2}>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the maintenance work required..."
                className="border-ink-700 bg-black text-white"
                rows={3}
              />
            </Stack>
            <Stack gap={2}>
              <Label>Assign Technician</Label>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Select technician...</option>
                <option value="john">John Martinez</option>
                <option value="sarah">Sarah Chen</option>
                <option value="mike">Mike Thompson</option>
                <option value="tom">Tom Wilson</option>
              </Select>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
            Cancel
          </Button>
          <Button variant="solid" onClick={() => setShowScheduleModal(false)}>
            Schedule
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedRecord} onClose={() => setSelectedRecord(null)}>
        <ModalHeader>
          <H3>Maintenance Details</H3>
        </ModalHeader>
        <ModalBody>
          {selectedRecord && (
            <Stack gap={4}>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Asset</Label>
                  <Body className="text-white">{selectedRecord.assetName}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Record ID</Label>
                  <Label className="font-mono text-white">{selectedRecord.id}</Label>
                </Stack>
              </Grid>

              <Stack gap={1}>
                <Label size="xs" className="text-ink-500">Description</Label>
                <Body className="text-ink-300">{selectedRecord.description}</Body>
              </Stack>

              <Grid cols={3} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Type</Label>
                  <Badge variant="outline">{selectedRecord.type}</Badge>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Priority</Label>
                  <Label className={getPriorityColor(selectedRecord.priority)}>
                    {selectedRecord.priority}
                  </Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Status</Label>
                  <Label className={getStatusColor(selectedRecord.status)}>
                    {selectedRecord.status}
                  </Label>
                </Stack>
              </Grid>

              {selectedRecord.technician && (
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Technician</Label>
                  <Label className="text-white">{selectedRecord.technician}</Label>
                </Stack>
              )}

              {selectedRecord.partsUsed && selectedRecord.partsUsed.length > 0 && (
                <Stack gap={2}>
                  <Label size="xs" className="text-ink-500">Parts Used</Label>
                  {selectedRecord.partsUsed.map((part, index) => (
                    <Card key={index} className="p-2 bg-ink-800 border border-ink-700">
                      <Grid cols={3} gap={2}>
                        <Label size="xs" className="text-white">{part.name}</Label>
                        <Label size="xs" className="text-ink-400">Qty: {part.quantity}</Label>
                        <Label size="xs" className="font-mono text-white">${part.cost}</Label>
                      </Grid>
                    </Card>
                  ))}
                </Stack>
              )}

              {selectedRecord.notes && (
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Notes</Label>
                  <Body className="text-ink-300">{selectedRecord.notes}</Body>
                </Stack>
              )}

              {selectedRecord.cost && (
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Total Cost</Label>
                  <Label className="font-mono text-white text-lg">${selectedRecord.cost.toLocaleString()}</Label>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedRecord(null)}>
            Close
          </Button>
          <Button variant="solid">
            Edit Record
          </Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
