"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Select,
  Button,
  Section,
  Card,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Badge,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";

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
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <EnterprisePageHeader
        title="Weather Contingency Planning"
        subtitle="Monitor conditions and manage weather-related contingency plans"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Weather Contingency' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

            <Grid cols={4} gap={6}>
              <StatCard label="Active Plans" value={activePlans.toString()} />
              <StatCard label="Triggered" value={triggeredPlans.toString()} />
              <StatCard label="High Risk" value={highRiskCount.toString()} />
              <StatCard label="Outdoor Events" value={mockPlans.filter(p => p.venueType === "Outdoor").length.toString()} />
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
              <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Plan</Button>
            </Stack>

            <Stack gap={4}>
              {mockPlans
                .filter(p => activeTab === "all" || (activeTab === "triggered" ? p.status === "Triggered" : p.status === "Active"))
                .map((plan) => (
                  <Card key={plan.id}>
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Stack gap={1}>
                          <Body className="font-display">{plan.projectName}</Body>
                          <Stack direction="horizontal" gap={2}>
                            <Badge variant="outline">{plan.venueType}</Badge>
                            <Body className="text-body-sm">{plan.venue}</Body>
                            <Body className="text-body-sm">•</Body>
                            <Body className="text-body-sm">{plan.eventDate}</Body>
                          </Stack>
                        </Stack>
                        <Stack direction="horizontal" gap={4} className="items-center">
                          <Stack gap={1} className="text-right">
                            <Body className="text-body-sm">Risk Level</Body>
                            <Badge variant={plan.riskLevel === "High" || plan.riskLevel === "Severe" ? "solid" : "outline"}>{plan.riskLevel}</Badge>
                          </Stack>
                          <Stack gap={1} className="text-right">
                            <Body className="text-body-sm">Status</Body>
                            <Badge variant={plan.status === "Triggered" ? "solid" : "outline"}>{plan.status}</Badge>
                          </Stack>
                        </Stack>
                      </Stack>

                      <Card>
                        <Stack direction="horizontal" className="justify-between items-center">
                          <Stack gap={1}>
                            <Body className="text-body-sm">Current Conditions</Body>
                            <Body>{plan.currentConditions}</Body>
                          </Stack>
                          <Button variant="ghost" size="sm">Refresh</Button>
                        </Stack>
                      </Card>

                      <Stack gap={2}>
                        <Body className="text-body-sm">Contingency Actions ({plan.contingencyPlans.length})</Body>
                        <Grid cols={2} gap={2}>
                          {plan.contingencyPlans.map((action) => (
                            <Card key={action.id}>
                              <Stack gap={2}>
                                <Stack direction="horizontal" className="justify-between">
                                  <Badge variant="outline">{action.trigger}</Badge>
                                  <Badge variant={action.status === "Activated" ? "solid" : "outline"}>{action.status}</Badge>
                                </Stack>
                                <Body className="text-body-sm">Threshold: {action.threshold}</Body>
                                <Body>{action.action}</Body>
                                <Body className="text-body-sm">Responsible: {action.responsible}</Body>
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
              <Button variant="outline">Weather Forecast</Button>
              <Button variant="outline" onClick={() => router.push("/emergency")}>Emergency Procedures</Button>
              <Button variant="outline" onClick={() => router.push("/risk-register")}>Risk Register</Button>
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedPlan} onClose={() => setSelectedPlan(null)}>
        <ModalHeader><H3>Weather Plan Details</H3></ModalHeader>
        <ModalBody>
          {selectedPlan && (
            <Stack gap={4}>
              <Body className="font-display">{selectedPlan.projectName}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Body className="text-body-sm">Venue</Body><Body>{selectedPlan.venue}</Body></Stack>
                <Stack gap={1}><Body className="text-body-sm">Type</Body><Badge variant="outline">{selectedPlan.venueType}</Badge></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Body className="text-body-sm">Event Date</Body><Body>{selectedPlan.eventDate}</Body></Stack>
                <Stack gap={1}><Body className="text-body-sm">Risk Level</Body><Badge variant={selectedPlan.riskLevel === "High" || selectedPlan.riskLevel === "Severe" ? "solid" : "outline"}>{selectedPlan.riskLevel}</Badge></Stack>
              </Grid>
              <Stack gap={1}><Body className="text-body-sm">Current Conditions</Body><Body>{selectedPlan.currentConditions}</Body></Stack>
              <Stack gap={2}>
                <Body className="text-body-sm">All Contingency Actions</Body>
                {selectedPlan.contingencyPlans.map((action) => (
                  <Card key={action.id}>
                    <Stack gap={1}>
                      <Stack direction="horizontal" className="justify-between">
                        <Body>{action.trigger}: {action.threshold}</Body>
                        <Badge variant={action.status === "Activated" ? "solid" : "outline"}>{action.status}</Badge>
                      </Stack>
                      <Body>{action.action}</Body>
                      <Body className="text-body-sm">{action.responsible}</Body>
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
            <Select>
              <option value="">Select Project...</option>
              <option value="PROJ-089">Summer Fest 2024</option>
              <option value="PROJ-090">Corporate Gala</option>
            </Select>
            <Select>
              <option value="">Venue Type...</option>
              <option value="outdoor">Outdoor</option>
              <option value="indoor">Indoor</option>
              <option value="hybrid">Hybrid</option>
            </Select>
            <Textarea placeholder="Add contingency actions..." rows={4} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
