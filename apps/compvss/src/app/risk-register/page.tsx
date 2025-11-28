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
  Input,
  Select,
  Button,
  Section,
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
  PageLayout,
  SectionHeader,
} from "@ghxstship/ui";

interface Risk {
  id: string;
  title: string;
  description: string;
  category: "Technical" | "Weather" | "Vendor" | "Safety" | "Financial" | "Operational" | "Regulatory";
  probability: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High" | "Critical";
  riskScore: number;
  status: "Identified" | "Mitigating" | "Monitoring" | "Closed";
  owner: string;
  projectId: string;
  projectName: string;
  mitigationPlan?: string;
  contingencyPlan?: string;
  triggers?: string[];
  identifiedDate: string;
  reviewDate?: string;
}

const mockRisks: Risk[] = [
  { id: "RSK-001", title: "Severe weather during outdoor event", description: "Potential for thunderstorms during Summer Fest weekend", category: "Weather", probability: "Medium", impact: "Critical", riskScore: 15, status: "Mitigating", owner: "John Martinez", projectId: "PROJ-089", projectName: "Summer Fest 2024", mitigationPlan: "Monitor weather 72hrs out, have indoor backup venue on standby", contingencyPlan: "Activate weather delay protocol, move to backup venue if needed", triggers: ["Lightning within 10 miles", "Wind > 40mph", "Heavy rain forecast"], identifiedDate: "2024-11-01", reviewDate: "2024-11-24" },
  { id: "RSK-002", title: "Key vendor equipment failure", description: "Main audio vendor has aging inventory that may fail", category: "Vendor", probability: "Low", impact: "High", riskScore: 8, status: "Monitoring", owner: "Sarah Chen", projectId: "PROJ-089", projectName: "Summer Fest 2024", mitigationPlan: "Request equipment inspection report, have backup vendor identified", contingencyPlan: "Activate backup vendor agreement", identifiedDate: "2024-11-05" },
  { id: "RSK-003", title: "Permit approval delay", description: "City permit for street closure may be delayed", category: "Regulatory", probability: "Medium", impact: "High", riskScore: 12, status: "Mitigating", owner: "Mike Thompson", projectId: "PROJ-089", projectName: "Summer Fest 2024", mitigationPlan: "Submit application early, maintain regular contact with city office", identifiedDate: "2024-10-15", reviewDate: "2024-11-20" },
  { id: "RSK-004", title: "Budget overrun on staging", description: "Staging costs may exceed budget due to material price increases", category: "Financial", probability: "High", impact: "Medium", riskScore: 12, status: "Identified", owner: "Lisa Park", projectId: "PROJ-090", projectName: "Corporate Gala", mitigationPlan: "Lock in pricing with vendor, identify cost reduction options", identifiedDate: "2024-11-18" },
  { id: "RSK-005", title: "Rigging safety concern", description: "Venue ceiling may not support planned rigging load", category: "Safety", probability: "Low", impact: "Critical", riskScore: 10, status: "Closed", owner: "Chris Brown", projectId: "PROJ-089", projectName: "Summer Fest 2024", mitigationPlan: "Structural engineer assessment completed, load approved", identifiedDate: "2024-10-20", reviewDate: "2024-11-10" },
];

export default function RiskRegisterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const activeRisks = mockRisks.filter(r => r.status !== "Closed");
  const highRisks = mockRisks.filter(r => r.riskScore >= 12 && r.status !== "Closed").length;
  const avgRiskScore = Math.round(activeRisks.reduce((sum, r) => sum + r.riskScore, 0) / activeRisks.length);

  const filteredRisks = categoryFilter === "All" ? mockRisks : mockRisks.filter(r => r.category === categoryFilter);

  const getRiskScoreColor = (score: number) => {
    if (score >= 15) return "text-error-400 bg-error-900/20";
    if (score >= 10) return "text-warning-400 bg-warning-900/20";
    if (score >= 5) return "text-warning-400 bg-warning-900/20";
    return "text-success-400 bg-success-900/20";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Closed": return "text-success-400";
      case "Monitoring": return "text-info-400";
      case "Mitigating": return "text-warning-400";
      case "Identified": return "text-ink-400";
      default: return "text-ink-400";
    }
  };

  const getProbabilityValue = (p: string) => p === "High" ? 3 : p === "Medium" ? 2 : 1;
  const getImpactValue = (i: string) => i === "Critical" ? 5 : i === "High" ? 4 : i === "Medium" ? 3 : 2;

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <SectionHeader
              kicker="COMPVSS"
              title="Risk Register"
              description="Identify, assess, and mitigate project risks"
              colorScheme="on-light"
              gap="lg"
            />

            <Grid cols={4} gap={6}>
              <StatCard value={activeRisks.length.toString()} label="Active Risks" />
              <StatCard value={highRisks.toString()} label="High Priority" />
              <StatCard value={avgRiskScore.toString()} label="Avg Risk Score" />
              <StatCard value={mockRisks.filter(r => r.status === "Closed").length.toString()} label="Closed This Month" />
            </Grid>

            {highRisks > 0 && (
              <Alert variant="warning">{highRisks} high-priority risk(s) require attention</Alert>
            )}

            <Grid cols={2} gap={4}>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="Technical">Technical</option>
                <option value="Weather">Weather</option>
                <option value="Vendor">Vendor</option>
                <option value="Safety">Safety</option>
                <option value="Financial">Financial</option>
                <option value="Operational">Operational</option>
                <option value="Regulatory">Regulatory</option>
              </Select>
              <Button variant="solid" onClick={() => setShowAddModal(true)}>Add Risk</Button>
            </Grid>

            <Tabs>
              <TabsList>
                <Tab active={activeTab === "active"} onClick={() => setActiveTab("active")}>Active Risks</Tab>
                <Tab active={activeTab === "matrix"} onClick={() => setActiveTab("matrix")}>Risk Matrix</Tab>
                <Tab active={activeTab === "closed"} onClick={() => setActiveTab("closed")}>Closed</Tab>
              </TabsList>

              <TabPanel active={activeTab === "active" || activeTab === "closed"}>
                <Stack gap={4}>
                  {filteredRisks
                    .filter(r => activeTab === "active" ? r.status !== "Closed" : r.status === "Closed")
                    .sort((a, b) => b.riskScore - a.riskScore)
                    .map((risk) => (
                      <Card key={risk.id} className="p-4">
                        <Grid cols={6} gap={4} className="items-center">
                          <Stack gap={1}>
                            <Body className="font-display">{risk.title}</Body>
                            <Body className="text-body-sm">{risk.projectName}</Body>
                          </Stack>
                          <Badge variant="outline">{risk.category}</Badge>
                          <Stack gap={1}>
                            <Body className="text-body-sm">P: {risk.probability} / I: {risk.impact}</Body>
                          </Stack>
                          <Badge variant={risk.riskScore >= 12 ? "solid" : "outline"}>{risk.riskScore}</Badge>
                          <Stack gap={1}>
                            <Badge variant="outline">{risk.status}</Badge>
                            <Body className="text-body-sm">{risk.owner}</Body>
                          </Stack>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedRisk(risk)}>Details</Button>
                        </Grid>
                      </Card>
                    ))}
                </Stack>
              </TabPanel>

              <TabPanel active={activeTab === "matrix"}>
                <Card className="p-6">
                  <Stack gap={4}>
                    <H3>Risk Matrix</H3>
                    <Grid cols={6} gap={2}>
                      <Card className="p-2" />
                      <Card className="p-2 text-center"><Body className="text-body-sm">Low</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">Medium</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">High</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">Critical</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">Impact →</Body></Card>
                      
                      <Card className="p-2 text-center"><Body className="text-body-sm">High</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">{activeRisks.filter(r => r.probability === "High" && r.impact === "Low").length}</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">{activeRisks.filter(r => r.probability === "High" && r.impact === "Medium").length}</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">{activeRisks.filter(r => r.probability === "High" && r.impact === "High").length}</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">{activeRisks.filter(r => r.probability === "High" && r.impact === "Critical").length}</Body></Card>
                      <Card className="p-2" />
                      
                      <Card className="p-2 text-center"><Body className="text-body-sm">Medium</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">{activeRisks.filter(r => r.probability === "Medium" && r.impact === "Low").length}</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">{activeRisks.filter(r => r.probability === "Medium" && r.impact === "Medium").length}</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">{activeRisks.filter(r => r.probability === "Medium" && r.impact === "High").length}</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">{activeRisks.filter(r => r.probability === "Medium" && r.impact === "Critical").length}</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">Probability ↑</Body></Card>
                      
                      <Card className="p-2 text-center"><Body className="text-body-sm">Low</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">{activeRisks.filter(r => r.probability === "Low" && r.impact === "Low").length}</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">{activeRisks.filter(r => r.probability === "Low" && r.impact === "Medium").length}</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">{activeRisks.filter(r => r.probability === "Low" && r.impact === "High").length}</Body></Card>
                      <Card className="p-2 text-center"><Body className="text-body-sm">{activeRisks.filter(r => r.probability === "Low" && r.impact === "Critical").length}</Body></Card>
                      <Card className="p-2" />
                    </Grid>
                  </Stack>
                </Card>
              </TabPanel>
            </Tabs>

            <Grid cols={3} gap={4}>
              <Button variant="outline">Export Register</Button>
              <Button variant="outline">Risk Report</Button>
              <Button variant="outline" onClick={() => router.push("/projects")}>Back to Projects</Button>
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedRisk} onClose={() => setSelectedRisk(null)}>
        <ModalHeader><H3>Risk Details</H3></ModalHeader>
        <ModalBody>
          {selectedRisk && (
            <Stack gap={4}>
              <Body className="font-display">{selectedRisk.title}</Body>
              <Body>{selectedRisk.description}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Category</Body>
                  <Badge variant="outline">{selectedRisk.category}</Badge>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Status</Body>
                  <Badge variant="outline">{selectedRisk.status}</Badge>
                </Stack>
              </Grid>
              <Grid cols={3} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Probability</Body>
                  <Body>{selectedRisk.probability}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Impact</Body>
                  <Body>{selectedRisk.impact}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Risk Score</Body>
                  <Badge variant={selectedRisk.riskScore >= 12 ? "solid" : "outline"}>{selectedRisk.riskScore}</Badge>
                </Stack>
              </Grid>
              <Stack gap={1}>
                <Body className="text-body-sm">Owner</Body>
                <Body>{selectedRisk.owner}</Body>
              </Stack>
              {selectedRisk.mitigationPlan && (
                <Stack gap={1}>
                  <Body className="text-body-sm">Mitigation Plan</Body>
                  <Body>{selectedRisk.mitigationPlan}</Body>
                </Stack>
              )}
              {selectedRisk.contingencyPlan && (
                <Stack gap={1}>
                  <Body className="text-body-sm">Contingency Plan</Body>
                  <Body>{selectedRisk.contingencyPlan}</Body>
                </Stack>
              )}
              {selectedRisk.triggers && selectedRisk.triggers.length > 0 && (
                <Stack gap={2}>
                  <Body className="text-body-sm">Triggers</Body>
                  {selectedRisk.triggers.map((trigger, idx) => (
                    <Card key={idx} className="p-2">
                      <Body className="text-body-sm">{trigger}</Body>
                    </Card>
                  ))}
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedRisk(null)}>Close</Button>
          <Button variant="solid">Update Risk</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Risk</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Risk Title" />
            <Textarea placeholder="Description..." rows={2} />
            <Grid cols={2} gap={4}>
              <Select>
                <option value="">Category...</option>
                <option value="Technical">Technical</option>
                <option value="Weather">Weather</option>
                <option value="Vendor">Vendor</option>
                <option value="Safety">Safety</option>
                <option value="Financial">Financial</option>
                <option value="Operational">Operational</option>
                <option value="Regulatory">Regulatory</option>
              </Select>
              <Select>
                <option value="">Project...</option>
                <option value="PROJ-089">Summer Fest 2024</option>
                <option value="PROJ-090">Corporate Gala</option>
              </Select>
            </Grid>
            <Grid cols={2} gap={4}>
              <Select>
                <option value="">Probability...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
              <Select>
                <option value="">Impact...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </Select>
            </Grid>
            <Select>
              <option value="">Owner...</option>
              <option value="john">John Martinez</option>
              <option value="sarah">Sarah Chen</option>
              <option value="mike">Mike Thompson</option>
            </Select>
            <Textarea placeholder="Mitigation Plan..." rows={2} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add Risk</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
