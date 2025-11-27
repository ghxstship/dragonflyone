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
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Risk Register</H1>
            <Label className="text-ink-400">Identify, assess, and mitigate project risks</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Active Risks" value={activeRisks.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="High Priority" value={highRisks} trend={highRisks > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg Risk Score" value={avgRiskScore} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Closed This Month" value={mockRisks.filter(r => r.status === "Closed").length} trend="up" className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {highRisks > 0 && (
            <Alert variant="warning">{highRisks} high-priority risk(s) require attention</Alert>
          )}

          <Grid cols={2} gap={4}>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border-ink-700 bg-black text-white">
              <option value="All">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Weather">Weather</option>
              <option value="Vendor">Vendor</option>
              <option value="Safety">Safety</option>
              <option value="Financial">Financial</option>
              <option value="Operational">Operational</option>
              <option value="Regulatory">Regulatory</option>
            </Select>
            <Button variant="outlineWhite" onClick={() => setShowAddModal(true)}>Add Risk</Button>
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
                    <Card key={risk.id} className={`border-2 p-4 ${risk.riskScore >= 12 ? "border-error-800 bg-error-900/10" : "border-ink-800 bg-ink-900/50"}`}>
                      <Grid cols={6} gap={4} className="items-center">
                        <Stack gap={1}>
                          <Body className="font-display text-white">{risk.title}</Body>
                          <Label size="xs" className="text-ink-500">{risk.projectName}</Label>
                        </Stack>
                        <Badge variant="outline">{risk.category}</Badge>
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">P: {risk.probability} / I: {risk.impact}</Label>
                        </Stack>
                        <Card className={`p-2 text-center ${getRiskScoreColor(risk.riskScore)}`}>
                          <Label className="font-mono text-body-md">{risk.riskScore}</Label>
                        </Card>
                        <Stack gap={1}>
                          <Label className={getStatusColor(risk.status)}>{risk.status}</Label>
                          <Label size="xs" className="text-ink-500">{risk.owner}</Label>
                        </Stack>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedRisk(risk)}>Details</Button>
                      </Grid>
                    </Card>
                  ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "matrix"}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>Risk Matrix</H3>
                  <Grid cols={6} gap={2}>
                    <Card className="p-2" />
                    <Card className="p-2 text-center bg-ink-800"><Label size="xs">Low</Label></Card>
                    <Card className="p-2 text-center bg-ink-800"><Label size="xs">Medium</Label></Card>
                    <Card className="p-2 text-center bg-ink-800"><Label size="xs">High</Label></Card>
                    <Card className="p-2 text-center bg-ink-800"><Label size="xs">Critical</Label></Card>
                    <Card className="p-2 text-center bg-ink-800"><Label size="xs">Impact →</Label></Card>
                    
                    <Card className="p-2 text-center bg-ink-800"><Label size="xs">High</Label></Card>
                    <Card className="p-2 bg-warning-900/30 text-center"><Label size="xs">{activeRisks.filter(r => r.probability === "High" && r.impact === "Low").length}</Label></Card>
                    <Card className="p-2 bg-warning-900/30 text-center"><Label size="xs">{activeRisks.filter(r => r.probability === "High" && r.impact === "Medium").length}</Label></Card>
                    <Card className="p-2 bg-error-900/30 text-center"><Label size="xs">{activeRisks.filter(r => r.probability === "High" && r.impact === "High").length}</Label></Card>
                    <Card className="p-2 bg-error-900/50 text-center"><Label size="xs">{activeRisks.filter(r => r.probability === "High" && r.impact === "Critical").length}</Label></Card>
                    <Card className="p-2" />
                    
                    <Card className="p-2 text-center bg-ink-800"><Label size="xs">Medium</Label></Card>
                    <Card className="p-2 bg-success-900/30 text-center"><Label size="xs">{activeRisks.filter(r => r.probability === "Medium" && r.impact === "Low").length}</Label></Card>
                    <Card className="p-2 bg-warning-900/30 text-center"><Label size="xs">{activeRisks.filter(r => r.probability === "Medium" && r.impact === "Medium").length}</Label></Card>
                    <Card className="p-2 bg-warning-900/30 text-center"><Label size="xs">{activeRisks.filter(r => r.probability === "Medium" && r.impact === "High").length}</Label></Card>
                    <Card className="p-2 bg-error-900/30 text-center"><Label size="xs">{activeRisks.filter(r => r.probability === "Medium" && r.impact === "Critical").length}</Label></Card>
                    <Card className="p-2 text-center"><Label size="xs">Probability ↑</Label></Card>
                    
                    <Card className="p-2 text-center bg-ink-800"><Label size="xs">Low</Label></Card>
                    <Card className="p-2 bg-success-900/30 text-center"><Label size="xs">{activeRisks.filter(r => r.probability === "Low" && r.impact === "Low").length}</Label></Card>
                    <Card className="p-2 bg-success-900/30 text-center"><Label size="xs">{activeRisks.filter(r => r.probability === "Low" && r.impact === "Medium").length}</Label></Card>
                    <Card className="p-2 bg-warning-900/30 text-center"><Label size="xs">{activeRisks.filter(r => r.probability === "Low" && r.impact === "High").length}</Label></Card>
                    <Card className="p-2 bg-warning-900/30 text-center"><Label size="xs">{activeRisks.filter(r => r.probability === "Low" && r.impact === "Critical").length}</Label></Card>
                    <Card className="p-2" />
                  </Grid>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Register</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Risk Report</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/projects")}>Back to Projects</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedRisk} onClose={() => setSelectedRisk(null)}>
        <ModalHeader><H3>Risk Details</H3></ModalHeader>
        <ModalBody>
          {selectedRisk && (
            <Stack gap={4}>
              <Body className="font-display text-white text-body-md">{selectedRisk.title}</Body>
              <Body className="text-ink-300">{selectedRisk.description}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Category</Label><Badge variant="outline">{selectedRisk.category}</Badge></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Status</Label><Label className={getStatusColor(selectedRisk.status)}>{selectedRisk.status}</Label></Stack>
              </Grid>
              <Grid cols={3} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Probability</Label><Label className="text-white">{selectedRisk.probability}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Impact</Label><Label className="text-white">{selectedRisk.impact}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Risk Score</Label><Label className={`font-mono ${getRiskScoreColor(selectedRisk.riskScore).split(" ")[0]}`}>{selectedRisk.riskScore}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label size="xs" className="text-ink-500">Owner</Label><Label className="text-white">{selectedRisk.owner}</Label></Stack>
              {selectedRisk.mitigationPlan && <Stack gap={1}><Label size="xs" className="text-ink-500">Mitigation Plan</Label><Body className="text-ink-300">{selectedRisk.mitigationPlan}</Body></Stack>}
              {selectedRisk.contingencyPlan && <Stack gap={1}><Label size="xs" className="text-ink-500">Contingency Plan</Label><Body className="text-ink-300">{selectedRisk.contingencyPlan}</Body></Stack>}
              {selectedRisk.triggers && selectedRisk.triggers.length > 0 && (
                <Stack gap={2}>
                  <Label size="xs" className="text-ink-500">Triggers</Label>
                  {selectedRisk.triggers.map((trigger, idx) => (
                    <Card key={idx} className="p-2 bg-ink-800 border border-ink-700">
                      <Label className="text-ink-300">{trigger}</Label>
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
            <Input placeholder="Risk Title" className="border-ink-700 bg-black text-white" />
            <Textarea placeholder="Description..." className="border-ink-700 bg-black text-white" rows={2} />
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Category...</option>
                <option value="Technical">Technical</option>
                <option value="Weather">Weather</option>
                <option value="Vendor">Vendor</option>
                <option value="Safety">Safety</option>
                <option value="Financial">Financial</option>
                <option value="Operational">Operational</option>
                <option value="Regulatory">Regulatory</option>
              </Select>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Project...</option>
                <option value="PROJ-089">Summer Fest 2024</option>
                <option value="PROJ-090">Corporate Gala</option>
              </Select>
            </Grid>
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Probability...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Impact...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </Select>
            </Grid>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Owner...</option>
              <option value="john">John Martinez</option>
              <option value="sarah">Sarah Chen</option>
              <option value="mike">Mike Thompson</option>
            </Select>
            <Textarea placeholder="Mitigation Plan..." className="border-ink-700 bg-black text-white" rows={2} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add Risk</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
