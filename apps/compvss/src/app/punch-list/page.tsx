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
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Alert,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

interface PunchItem {
  id: string;
  title: string;
  description: string;
  location: string;
  department: "Audio" | "Lighting" | "Video" | "Staging" | "Rigging" | "General";
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved" | "Verified";
  assignedTo?: string;
  reportedBy: string;
  reportedDate: string;
  dueDate?: string;
  resolvedDate?: string;
  verifiedBy?: string;
  photos?: string[];
  notes?: string;
}

const mockPunchItems: PunchItem[] = [
  { id: "PL-001", title: "Speaker angle adjustment needed", description: "Front fill speakers need 5 degree tilt adjustment for coverage", location: "Stage Left - FOH", department: "Audio", priority: "High", status: "Open", reportedBy: "John Martinez", reportedDate: "2024-11-24", dueDate: "2024-11-24" },
  { id: "PL-002", title: "Truss bolt missing", description: "Missing safety bolt on upstage truss section 4", location: "Upstage Truss", department: "Rigging", priority: "Critical", status: "In Progress", assignedTo: "Mike Thompson", reportedBy: "Sarah Chen", reportedDate: "2024-11-24", dueDate: "2024-11-24", notes: "Replacement bolt sourced, installing now" },
  { id: "PL-003", title: "LED panel pixel out", description: "Dead pixel cluster on video wall panel B-7", location: "Center Video Wall", department: "Video", priority: "Medium", status: "Open", reportedBy: "Lisa Park", reportedDate: "2024-11-24" },
  { id: "PL-004", title: "Cable run needs gaff tape", description: "Audio snake crossing walkway needs to be taped down", location: "Stage Right Wing", department: "Audio", priority: "High", status: "Resolved", assignedTo: "Tom Wilson", reportedBy: "John Martinez", reportedDate: "2024-11-24", resolvedDate: "2024-11-24" },
  { id: "PL-005", title: "Gobo focus soft", description: "Gobo projection on backdrop needs refocus", location: "Backdrop Center", department: "Lighting", priority: "Low", status: "Verified", assignedTo: "Sarah Chen", reportedBy: "Director", reportedDate: "2024-11-23", resolvedDate: "2024-11-24", verifiedBy: "Production Manager" },
];

export default function PunchListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("open");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PunchItem | null>(null);

  const openItems = mockPunchItems.filter(i => i.status === "Open" || i.status === "In Progress");
  const criticalCount = mockPunchItems.filter(i => i.priority === "Critical" && i.status !== "Verified").length;
  const resolvedToday = mockPunchItems.filter(i => i.resolvedDate === "2024-11-24").length;

  const filteredItems = selectedDepartment === "All" 
    ? mockPunchItems 
    : mockPunchItems.filter(i => i.department === selectedDepartment);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "text-error-400";
      case "High": return "text-warning-400";
      case "Medium": return "text-warning-400";
      case "Low": return "text-success-400";
      default: return "text-ink-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified": return "text-success-400";
      case "Resolved": return "text-info-400";
      case "In Progress": return "text-warning-400";
      case "Open": return "text-ink-400";
      default: return "text-ink-400";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Punch List"
        subtitle="Track and resolve outstanding items before show"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Punch List' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        primaryAction={{ label: 'Add Item', onClick: () => setShowAddModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard value={openItems.length.toString()} label="Open Items" />
              <StatCard value={criticalCount.toString()} label="Critical" />
              <StatCard value={resolvedToday.toString()} label="Resolved Today" />
              <StatCard value={mockPunchItems.length.toString()} label="Total Items" />
            </Grid>

            {criticalCount > 0 && (
              <Alert variant="error">{criticalCount} critical item(s) require immediate attention!</Alert>
            )}

            <Grid cols={3} gap={4}>
              <Select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                <option value="All">All Departments</option>
                <option value="Audio">Audio</option>
                <option value="Lighting">Lighting</option>
                <option value="Video">Video</option>
                <option value="Staging">Staging</option>
                <option value="Rigging">Rigging</option>
              </Select>
              <Input type="search" placeholder="Search items..." />
              <Button variant="solid" onClick={() => setShowAddModal(true)}>Add Item</Button>
            </Grid>

            <Tabs>
              <TabsList>
                <Tab active={activeTab === "open"} onClick={() => setActiveTab("open")}>Open ({openItems.length})</Tab>
                <Tab active={activeTab === "resolved"} onClick={() => setActiveTab("resolved")}>Resolved</Tab>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All Items</Tab>
              </TabsList>

              <TabPanel active={activeTab === "open" || activeTab === "all"}>
                <Stack gap={3}>
                  {filteredItems
                    .filter(i => activeTab === "all" || i.status === "Open" || i.status === "In Progress")
                    .sort((a, b) => {
                      const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                    })
                    .map((item) => (
                      <Card key={item.id} className="p-4">
                        <Grid cols={6} gap={4} className="items-center">
                          <Stack gap={1}>
                            <Body className="font-display">{item.title}</Body>
                            <Body className="text-body-sm">{item.location}</Body>
                          </Stack>
                          <Badge variant="outline">{item.department}</Badge>
                          <Badge variant={item.priority === "Critical" ? "solid" : "outline"}>{item.priority}</Badge>
                          <Badge variant="outline">{item.status}</Badge>
                          <Body className="text-body-sm">{item.assignedTo || "Unassigned"}</Body>
                          <Stack direction="horizontal" gap={2}>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}>Details</Button>
                            {item.status === "Open" && <Button variant="outline" size="sm">Assign</Button>}
                            {item.status === "In Progress" && <Button variant="outline" size="sm">Resolve</Button>}
                          </Stack>
                        </Grid>
                      </Card>
                    ))}
                </Stack>
              </TabPanel>

              <TabPanel active={activeTab === "resolved"}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Resolved By</TableHead>
                      <TableHead>Resolved Date</TableHead>
                      <TableHead>Verified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.filter(i => i.status === "Resolved" || i.status === "Verified").map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Stack gap={1}>
                            <Body>{item.title}</Body>
                            <Body className="text-body-sm">{item.location}</Body>
                          </Stack>
                        </TableCell>
                        <TableCell><Badge variant="outline">{item.department}</Badge></TableCell>
                        <TableCell><Body className="text-body-sm">{item.assignedTo}</Body></TableCell>
                        <TableCell><Body className="text-body-sm">{item.resolvedDate}</Body></TableCell>
                        <TableCell>
                          {item.status === "Verified" 
                            ? <Badge variant="solid">✓ {item.verifiedBy}</Badge>
                            : <Button variant="outline" size="sm">Verify</Button>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabPanel>
            </Tabs>

            <Grid cols={3} gap={4}>
              <Button variant="outline">Export List</Button>
              <Button variant="outline" onClick={() => router.push("/qa-checkpoints")}>QA Checkpoints</Button>
              <Button variant="outline" onClick={() => router.push("/build-strike")}>Build Status</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Punch Item</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Item title" />
            <Textarea placeholder="Description..." rows={2} />
            <Input placeholder="Location" />
            <Grid cols={2} gap={4}>
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
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Location</Body>
                  <Body>{selectedItem.location}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Department</Body>
                  <Badge variant="outline">{selectedItem.department}</Badge>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Priority</Body>
                  <Badge variant={selectedItem.priority === "Critical" ? "solid" : "outline"}>{selectedItem.priority}</Badge>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Status</Body>
                  <Badge variant="outline">{selectedItem.status}</Badge>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Reported By</Body>
                  <Body>{selectedItem.reportedBy}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Assigned To</Body>
                  <Body>{selectedItem.assignedTo || "Unassigned"}</Body>
                </Stack>
              </Grid>
              {selectedItem.notes && (
                <Stack gap={1}>
                  <Body className="text-body-sm">Notes</Body>
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
    </CompvssAppLayout>
  );
}
