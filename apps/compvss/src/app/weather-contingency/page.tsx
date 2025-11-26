"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

interface WeatherPlan {
  id: string;
  projectName: string;
  projectId: string;
  eventDate: string;
  venue: string;
  venueType: "Outdoor" | "Indoor" | "Hybrid";
  status: "Active" | "Triggered" | "Cleared";
  currentConditions: string;
  riskLevel: "Low" | "Moderate" | "High" | "Severe";
  contingencyPlans: ContingencyAction[];
}

interface ContingencyAction {
  id: string;
  trigger: string;
  threshold: string;
  action: string;
  responsible: string;
  status: "Ready" | "Activated" | "Completed";
}

const mockPlans: WeatherPlan[] = [
  {
    id: "WP-001",
    projectName: "Summer Fest 2024",
    projectId: "PROJ-089",
    eventDate: "2024-12-15",
    venue: "Outdoor Amphitheater",
    venueType: "Outdoor",
    status: "Active",
    currentConditions: "Partly Cloudy, 72°F",
    riskLevel: "Low",
    contingencyPlans: [
      { id: "CA-001", trigger: "Rain", threshold: ">0.5 in/hr", action: "Deploy rain covers over FOH and monitor positions", responsible: "Site Manager", status: "Ready" },
      { id: "CA-002", trigger: "Lightning", threshold: "Within 10 miles", action: "Evacuate to covered areas, pause show", responsible: "Safety Director", status: "Ready" },
      { id: "CA-003", trigger: "High Wind", threshold: ">35 mph sustained", action: "Lower video walls, secure loose items", responsible: "Technical Director", status: "Ready" },
      { id: "CA-004", trigger: "Extreme Heat", threshold: ">95°F", action: "Activate cooling stations, increase water distribution", responsible: "Operations", status: "Ready" },
    ],
  },
  {
    id: "WP-002",
    projectName: "Corporate Gala",
    projectId: "PROJ-090",
    eventDate: "2024-12-20",
    venue: "Convention Center",
    venueType: "Indoor",
    status: "Active",
    currentConditions: "Clear, 65°F",
    riskLevel: "Low",
    contingencyPlans: [
      { id: "CA-005", trigger: "Power Outage", threshold: "Any duration", action: "Switch to backup generators", responsible: "Technical Director", status: "Ready" },
    ],
  },
  {
    id: "WP-003",
    projectName: "Beach Concert",
    projectId: "PROJ-091",
    eventDate: "2024-12-10",
    venue: "Oceanside Beach",
    venueType: "Outdoor",
    status: "Triggered",
    currentConditions: "Storm Warning, 58°F, Wind 25mph",
    riskLevel: "High",
    contingencyPlans: [
      { id: "CA-006", trigger: "Storm Warning", threshold: "NWS Advisory", action: "Delay doors by 2 hours", responsible: "Production Manager", status: "Activated" },
      { id: "CA-007", trigger: "High Surf", threshold: ">6 ft waves", action: "Move barriers back 50 ft from waterline", responsible: "Site Manager", status: "Completed" },
    ],
  },
];

export default function WeatherContingencyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedPlan, setSelectedPlan] = useState<WeatherPlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activePlans = mockPlans.filter(p => p.status === "Active").length;
  const triggeredPlans = mockPlans.filter(p => p.status === "Triggered").length;
  const highRiskCount = mockPlans.filter(p => p.riskLevel === "High" || p.riskLevel === "Severe").length;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-success-400";
      case "Moderate": return "text-warning-400";
      case "High": return "text-warning-400";
      case "Severe": return "text-error-400";
      default: return "text-ink-400";
    }
  };

  const getRiskBg = (risk: string) => {
    switch (risk) {
      case "Low": return "border-success-800 bg-success-900/10";
      case "Moderate": return "border-warning-800 bg-warning-900/10";
      case "High": return "border-warning-800 bg-warning-900/20";
      case "Severe": return "border-error-800 bg-error-900/20";
      default: return "border-ink-800 bg-ink-900/50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-400";
      case "Triggered": return "text-warning-400";
      case "Cleared": return "text-ink-400";
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
            <H1>Weather Contingency Planning</H1>
            <Label className="text-ink-400">Monitor conditions and manage weather-related contingency plans</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Active Plans" value={activePlans} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Triggered" value={triggeredPlans} trend={triggeredPlans > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="High Risk" value={highRiskCount} trend={highRiskCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Outdoor Events" value={mockPlans.filter(p => p.venueType === "Outdoor").length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {triggeredPlans > 0 && (
            <Alert variant="warning">
              ⚠️ {triggeredPlans} contingency plan(s) currently triggered due to weather conditions
            </Alert>
          )}

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "active"} onClick={() => setActiveTab("active")}>Active</Tab>
                <Tab active={activeTab === "triggered"} onClick={() => setActiveTab("triggered")}>Triggered</Tab>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
              </TabsList>
            </Tabs>
            <Button variant="outlineWhite" onClick={() => setShowCreateModal(true)}>Create Plan</Button>
          </Stack>

          <Stack gap={4}>
            {mockPlans
              .filter(p => activeTab === "all" || (activeTab === "triggered" ? p.status === "Triggered" : p.status === "Active"))
              .map((plan) => (
                <Card key={plan.id} className={`border-2 overflow-hidden ${getRiskBg(plan.riskLevel)}`}>
                  <Card className="p-4 bg-ink-800/50 border-b border-ink-700">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack gap={1}>
                        <Body className="font-display text-white text-lg">{plan.projectName}</Body>
                        <Stack direction="horizontal" gap={2}>
                          <Badge variant="outline">{plan.venueType}</Badge>
                          <Label className="text-ink-400">{plan.venue}</Label>
                          <Label className="text-ink-400">•</Label>
                          <Label className="text-ink-400">{plan.eventDate}</Label>
                        </Stack>
                      </Stack>
                      <Stack direction="horizontal" gap={4} className="items-center">
                        <Stack gap={1} className="text-right">
                          <Label size="xs" className="text-ink-500">Risk Level</Label>
                          <Label className={getRiskColor(plan.riskLevel)}>{plan.riskLevel}</Label>
                        </Stack>
                        <Stack gap={1} className="text-right">
                          <Label size="xs" className="text-ink-500">Status</Label>
                          <Label className={getStatusColor(plan.status)}>{plan.status}</Label>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>

                  <Stack className="p-4" gap={4}>
                    <Card className="p-3 bg-ink-800/30 border border-ink-700">
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Current Conditions</Label>
                          <Label className="text-white">{plan.currentConditions}</Label>
                        </Stack>
                        <Button variant="ghost" size="sm">Refresh</Button>
                      </Stack>
                    </Card>

                    <Stack gap={2}>
                      <Label className="text-ink-400">Contingency Actions ({plan.contingencyPlans.length})</Label>
                      <Grid cols={2} gap={2}>
                        {plan.contingencyPlans.map((action) => (
                          <Card key={action.id} className={`p-3 border ${action.status === "Activated" ? "border-warning-700 bg-warning-900/20" : action.status === "Completed" ? "border-success-700 bg-success-900/10" : "border-ink-700"}`}>
                            <Stack gap={2}>
                              <Stack direction="horizontal" className="justify-between">
                                <Badge variant="outline">{action.trigger}</Badge>
                                <Label size="xs" className={action.status === "Activated" ? "text-warning-400" : action.status === "Completed" ? "text-success-400" : "text-ink-400"}>{action.status}</Label>
                              </Stack>
                              <Label size="xs" className="text-ink-500">Threshold: {action.threshold}</Label>
                              <Label className="text-ink-300">{action.action}</Label>
                              <Label size="xs" className="text-ink-500">Responsible: {action.responsible}</Label>
                            </Stack>
                          </Card>
                        ))}
                      </Grid>
                    </Stack>

                    <Stack direction="horizontal" gap={2} className="justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedPlan(plan)}>View Details</Button>
                      <Button variant="outline" size="sm">Edit Plan</Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
          </Stack>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Weather Forecast</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/emergency")}>Emergency Procedures</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/risk-register")}>Risk Register</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedPlan} onClose={() => setSelectedPlan(null)}>
        <ModalHeader><H3>Weather Plan Details</H3></ModalHeader>
        <ModalBody>
          {selectedPlan && (
            <Stack gap={4}>
              <Body className="font-display text-white text-lg">{selectedPlan.projectName}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Venue</Label><Label className="text-white">{selectedPlan.venue}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Type</Label><Badge variant="outline">{selectedPlan.venueType}</Badge></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Event Date</Label><Label className="text-white">{selectedPlan.eventDate}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Risk Level</Label><Label className={getRiskColor(selectedPlan.riskLevel)}>{selectedPlan.riskLevel}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label size="xs" className="text-ink-500">Current Conditions</Label><Label className="text-white">{selectedPlan.currentConditions}</Label></Stack>
              <Stack gap={2}>
                <Label className="text-ink-400">All Contingency Actions</Label>
                {selectedPlan.contingencyPlans.map((action) => (
                  <Card key={action.id} className="p-3 border border-ink-700">
                    <Stack gap={1}>
                      <Stack direction="horizontal" className="justify-between">
                        <Label className="text-white">{action.trigger}: {action.threshold}</Label>
                        <Label size="xs" className={action.status === "Activated" ? "text-warning-400" : "text-ink-400"}>{action.status}</Label>
                      </Stack>
                      <Label className="text-ink-300">{action.action}</Label>
                      <Label size="xs" className="text-ink-500">{action.responsible}</Label>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPlan(null)}>Close</Button>
          <Button variant="solid">Trigger Plan</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Weather Plan</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Select Project...</option>
              <option value="PROJ-089">Summer Fest 2024</option>
              <option value="PROJ-090">Corporate Gala</option>
            </Select>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Venue Type...</option>
              <option value="outdoor">Outdoor</option>
              <option value="indoor">Indoor</option>
              <option value="hybrid">Hybrid</option>
            </Select>
            <Textarea placeholder="Add contingency actions..." className="border-ink-700 bg-black text-white" rows={4} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
