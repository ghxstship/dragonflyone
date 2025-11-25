"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Button, Section as UISection, Card, Tabs, TabsList, Tab, TabPanel,
  Modal, ModalHeader, ModalBody, ModalFooter, Badge,
} from "@ghxstship/ui";

interface DashboardWidget {
  id: string;
  type: "stat" | "chart" | "table" | "list" | "gauge";
  title: string;
  dataSource: string;
  size: "small" | "medium" | "large";
  position: { x: number; y: number };
}

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: string;
}

const availableWidgets = [
  { type: "stat", name: "Stat Card", description: "Single metric with trend" },
  { type: "chart", name: "Line Chart", description: "Time series data" },
  { type: "chart", name: "Bar Chart", description: "Categorical comparison" },
  { type: "chart", name: "Pie Chart", description: "Distribution breakdown" },
  { type: "table", name: "Data Table", description: "Tabular data display" },
  { type: "gauge", name: "Gauge", description: "Progress or percentage" },
  { type: "list", name: "Top List", description: "Ranked items" },
];

const dataSources = [
  { id: "revenue", name: "Revenue", category: "Finance" },
  { id: "expenses", name: "Expenses", category: "Finance" },
  { id: "projects", name: "Active Projects", category: "Operations" },
  { id: "deals", name: "Deal Pipeline", category: "Sales" },
  { id: "employees", name: "Headcount", category: "HR" },
  { id: "assets", name: "Asset Utilization", category: "Operations" },
];

const mockDashboards: Dashboard[] = [
  { id: "DB-001", name: "Executive Overview", description: "High-level KPIs", widgets: [], isDefault: true, createdAt: "2024-11-01" },
  { id: "DB-002", name: "Finance Dashboard", description: "Financial metrics", widgets: [], isDefault: false, createdAt: "2024-11-10" },
  { id: "DB-003", name: "Operations Dashboard", widgets: [], isDefault: false, createdAt: "2024-11-15" },
];

export default function DashboardBuilderPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboards");
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack direction="horizontal" className="justify-between items-center">
            <Stack gap={2}>
              <H1>Dashboard Builder</H1>
              <Label className="text-ink-400">Create and customize analytics dashboards</Label>
            </Stack>
            <Stack direction="horizontal" gap={4}>
              {selectedDashboard && (
                <Button variant={editMode ? "solid" : "outline"} onClick={() => setEditMode(!editMode)}>
                  {editMode ? "Done Editing" : "Edit Layout"}
                </Button>
              )}
              <Button variant="outlineWhite" onClick={() => setShowCreateModal(true)}>New Dashboard</Button>
            </Stack>
          </Stack>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "dashboards"} onClick={() => setActiveTab("dashboards")}>My Dashboards</Tab>
              <Tab active={activeTab === "widgets"} onClick={() => setActiveTab("widgets")}>Widget Library</Tab>
              <Tab active={activeTab === "data"} onClick={() => setActiveTab("data")}>Data Sources</Tab>
            </TabsList>

            <TabPanel active={activeTab === "dashboards"}>
              <Grid cols={3} gap={6}>
                {mockDashboards.map((dashboard) => (
                  <Card key={dashboard.id} className={`border-2 p-6 cursor-pointer transition-all ${selectedDashboard?.id === dashboard.id ? "border-white bg-ink-800" : "border-ink-800 bg-ink-900/50 hover:border-ink-600"}`} onClick={() => setSelectedDashboard(dashboard)}>
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <H3>{dashboard.name}</H3>
                        {dashboard.isDefault && <Badge variant="solid">Default</Badge>}
                      </Stack>
                      {dashboard.description && <Label className="text-ink-400">{dashboard.description}</Label>}
                      <Label size="xs" className="text-ink-500">Created {dashboard.createdAt}</Label>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedDashboard(dashboard); setEditMode(true); }}>Edit</Button>
                        <Button variant="ghost" size="sm">Duplicate</Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>

              {selectedDashboard && (
                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6 mt-8">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between items-center">
                      <H3>{selectedDashboard.name} Preview</H3>
                      {editMode && <Button variant="outline" size="sm" onClick={() => setShowWidgetModal(true)}>Add Widget</Button>}
                    </Stack>
                    <Card className="h-64 bg-ink-800 border border-ink-700 flex items-center justify-center">
                      <Stack gap={2} className="text-center">
                        <Label className="text-ink-400">Dashboard Canvas</Label>
                        <Body className="text-ink-500">{editMode ? "Drag widgets to arrange" : "Select a dashboard to preview"}</Body>
                        <Grid cols={3} gap={4} className="mt-4">
                          <Card className="p-4 bg-ink-900 border border-ink-700">
                            <Stack gap={1}>
                              <Label size="xs" className="text-ink-500">Revenue</Label>
                              <Label className="text-white text-xl font-mono">$1.2M</Label>
                            </Stack>
                          </Card>
                          <Card className="p-4 bg-ink-900 border border-ink-700">
                            <Stack gap={1}>
                              <Label size="xs" className="text-ink-500">Projects</Label>
                              <Label className="text-white text-xl font-mono">24</Label>
                            </Stack>
                          </Card>
                          <Card className="p-4 bg-ink-900 border border-ink-700">
                            <Stack gap={1}>
                              <Label size="xs" className="text-ink-500">Utilization</Label>
                              <Label className="text-white text-xl font-mono">87%</Label>
                            </Stack>
                          </Card>
                        </Grid>
                      </Stack>
                    </Card>
                  </Stack>
                </Card>
              )}
            </TabPanel>

            <TabPanel active={activeTab === "widgets"}>
              <Grid cols={4} gap={4}>
                {availableWidgets.map((widget, index) => (
                  <Card key={index} className="border border-ink-700 p-4 cursor-pointer hover:border-white transition-all">
                    <Stack gap={2}>
                      <Badge variant="outline">{widget.type}</Badge>
                      <Label className="text-white font-display">{widget.name}</Label>
                      <Label size="xs" className="text-ink-400">{widget.description}</Label>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "data"}>
              <Grid cols={3} gap={4}>
                {dataSources.map((source) => (
                  <Card key={source.id} className="border border-ink-700 p-4">
                    <Stack gap={2}>
                      <Badge variant="outline">{source.category}</Badge>
                      <Label className="text-white">{source.name}</Label>
                      <Button variant="ghost" size="sm">Configure</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>
          </Tabs>

          <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/analytics")}>Back to Analytics</Button>
        </Stack>
      </Container>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Dashboard</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Dashboard name" className="border-ink-700 bg-black text-white" />
            <Input placeholder="Description (optional)" className="border-ink-700 bg-black text-white" />
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Start from template...</option>
              <option value="blank">Blank Dashboard</option>
              <option value="executive">Executive Overview</option>
              <option value="finance">Finance Template</option>
            </Select>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showWidgetModal} onClose={() => setShowWidgetModal(false)}>
        <ModalHeader><H3>Add Widget</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Select widget type...</option>
              {availableWidgets.map((w, i) => <option key={i} value={w.type}>{w.name}</option>)}
            </Select>
            <Input placeholder="Widget title" className="border-ink-700 bg-black text-white" />
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Select data source...</option>
              {dataSources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowWidgetModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowWidgetModal(false)}>Add Widget</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
