"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert,
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
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Punch List</H1>
            <Label className="text-ink-400">Track and resolve outstanding items before show</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Open Items" value={openItems.length} trend={openItems.length > 5 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Critical" value={criticalCount} trend={criticalCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Resolved Today" value={resolvedToday} trend="up" className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Items" value={mockPunchItems.length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {criticalCount > 0 && (
            <Alert variant="error">{criticalCount} critical item(s) require immediate attention!</Alert>
          )}

          <Grid cols={3} gap={4}>
            <Select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="border-ink-700 bg-black text-white">
              <option value="All">All Departments</option>
              <option value="Audio">Audio</option>
              <option value="Lighting">Lighting</option>
              <option value="Video">Video</option>
              <option value="Staging">Staging</option>
              <option value="Rigging">Rigging</option>
            </Select>
            <Input type="search" placeholder="Search items..." className="border-ink-700 bg-black text-white" />
            <Button variant="outlineWhite" onClick={() => setShowAddModal(true)}>Add Item</Button>
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
                    <Card key={item.id} className={`border-2 p-4 ${item.priority === "Critical" ? "border-error-800 bg-error-900/10" : "border-ink-800 bg-ink-900/50"}`}>
                      <Grid cols={6} gap={4} className="items-center">
                        <Stack gap={1}>
                          <Body className="font-display text-white">{item.title}</Body>
                          <Label size="xs" className="text-ink-500">{item.location}</Label>
                        </Stack>
                        <Badge variant="outline">{item.department}</Badge>
                        <Label className={getPriorityColor(item.priority)}>{item.priority}</Label>
                        <Label className={getStatusColor(item.status)}>{item.status}</Label>
                        <Label className="text-ink-400">{item.assignedTo || "Unassigned"}</Label>
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
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
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
                          <Body className="text-white">{item.title}</Body>
                          <Label size="xs" className="text-ink-500">{item.location}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell><Badge variant="outline">{item.department}</Badge></TableCell>
                      <TableCell><Label className="text-ink-300">{item.assignedTo}</Label></TableCell>
                      <TableCell className="font-mono text-ink-400">{item.resolvedDate}</TableCell>
                      <TableCell>
                        {item.status === "Verified" 
                          ? <Label className="text-success-400">✓ {item.verifiedBy}</Label>
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
            <Button variant="outline" className="border-ink-700 text-ink-400">Export List</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/qa-checkpoints")}>QA Checkpoints</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/build-strike")}>Build Status</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Punch Item</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Item title" className="border-ink-700 bg-black text-white" />
            <Textarea placeholder="Description..." className="border-ink-700 bg-black text-white" rows={2} />
            <Input placeholder="Location" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Department...</option>
                <option value="Audio">Audio</option>
                <option value="Lighting">Lighting</option>
                <option value="Video">Video</option>
                <option value="Staging">Staging</option>
                <option value="Rigging">Rigging</option>
              </Select>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Priority...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </Select>
            </Grid>
            <Select className="border-ink-700 bg-black text-white">
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
              <Body className="font-display text-white text-lg">{selectedItem.title}</Body>
              <Body className="text-ink-300">{selectedItem.description}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Location</Label><Label className="text-white">{selectedItem.location}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Department</Label><Badge variant="outline">{selectedItem.department}</Badge></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Priority</Label><Label className={getPriorityColor(selectedItem.priority)}>{selectedItem.priority}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Status</Label><Label className={getStatusColor(selectedItem.status)}>{selectedItem.status}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Reported By</Label><Label className="text-white">{selectedItem.reportedBy}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Assigned To</Label><Label className="text-white">{selectedItem.assignedTo || "Unassigned"}</Label></Stack>
              </Grid>
              {selectedItem.notes && <Stack gap={1}><Label size="xs" className="text-ink-500">Notes</Label><Body className="text-ink-300">{selectedItem.notes}</Body></Stack>}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedItem(null)}>Close</Button>
          <Button variant="solid">Update Status</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
