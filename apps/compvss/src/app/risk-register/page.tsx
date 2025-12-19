"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
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
import {
  useRisks,
  type Risk,
} from '../../hooks/useRiskRegister';


export default function RiskRegisterPage() {
  const router = useRouter();
  const { data: risks = [], isLoading, error } = useRisks();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'active',
    validTabs: ['active', 'matrix', 'closed'],
  });
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Stack gap={4} className="items-center">
              <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
              <Body>Loading risk register...</Body>
            </Stack>
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  if (error) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container>
            <Card className="p-6 border-destructive bg-destructive/10">
              <Stack gap={4} className="items-center text-center">
                <Body className="text-destructive font-display">Failed to load risk register</Body>
                <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </Stack>
            </Card>
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  const activeRisks = risks.filter(r => r.status !== "Closed");
  const highRisks = risks.filter(r => r.riskScore >= 12 && r.status !== "Closed").length;
  const avgRiskScore = activeRisks.length > 0 ? Math.round(activeRisks.reduce((sum, r) => sum + r.riskScore, 0) / activeRisks.length) : 0;

  const filteredRisks = categoryFilter === "All" ? risks : risks.filter(r => r.category === categoryFilter);

  const getStatusVariant = (status: string): 'success' | 'info' | 'warning' | 'ghost' => {
    switch (status) {
      case "Closed": return "success";
      case "Monitoring": return "info";
      case "Mitigating": return "warning";
      case "Identified": return "ghost";
      default: return "ghost";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Risk Register"
        subtitle="Track and manage project risks and mitigation strategies"
        primaryAction={{ label: 'Add Risk', onClick: () => setShowAddModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard value={activeRisks.length.toString()} label="Active Risks" />
              <StatCard value={highRisks.toString()} label="High Priority" />
              <StatCard value={avgRiskScore.toString()} label="Avg Risk Score" />
              <StatCard value={risks.filter(r => r.status === "Closed").length.toString()} label="Closed This Month" />
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
                <Tab active={isActive('active')} onClick={() => setActiveTab('active')}>Active Risks</Tab>
                <Tab active={isActive('matrix')} onClick={() => setActiveTab('matrix')}>Risk Matrix</Tab>
                <Tab active={isActive('closed')} onClick={() => setActiveTab('closed')}>Closed</Tab>
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
                            <Body size="sm" className="">{risk.projectName}</Body>
                          </Stack>
                          <Badge variant="outline">{risk.category}</Badge>
                          <Stack gap={1}>
                            <Body size="sm" className="">P: {risk.probability} / I: {risk.impact}</Body>
                          </Stack>
                          <Badge variant={risk.riskScore >= 12 ? "solid" : "outline"}>{risk.riskScore}</Badge>
                          <Stack gap={1}>
                            <Badge variant={getStatusVariant(risk.status)}>{risk.status}</Badge>
                            <Body size="sm" className="">{risk.owner}</Body>
                          </Stack>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedRisk(risk)}>Details</Button>
                        </Grid>
                      </Card>
                    ))}
                </Stack>
              </TabPanel>

              <TabPanel active={isActive('matrix')}>
                <Card className="p-6">
                  <Stack gap={4}>
                    <H3>Risk Matrix</H3>
                    <Grid cols={6} gap={2}>
                      <Card className="p-2" />
                      <Card className="p-2 text-center"><Body size="sm" className="">Low</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">Medium</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">High</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">Critical</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">Impact →</Body></Card>
                      
                      <Card className="p-2 text-center"><Body size="sm" className="">High</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">{activeRisks.filter(r => r.probability === "High" && r.impact === "Low").length}</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">{activeRisks.filter(r => r.probability === "High" && r.impact === "Medium").length}</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">{activeRisks.filter(r => r.probability === "High" && r.impact === "High").length}</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">{activeRisks.filter(r => r.probability === "High" && r.impact === "Critical").length}</Body></Card>
                      <Card className="p-2" />
                      
                      <Card className="p-2 text-center"><Body size="sm" className="">Medium</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">{activeRisks.filter(r => r.probability === "Medium" && r.impact === "Low").length}</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">{activeRisks.filter(r => r.probability === "Medium" && r.impact === "Medium").length}</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">{activeRisks.filter(r => r.probability === "Medium" && r.impact === "High").length}</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">{activeRisks.filter(r => r.probability === "Medium" && r.impact === "Critical").length}</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">Probability ↑</Body></Card>
                      
                      <Card className="p-2 text-center"><Body size="sm" className="">Low</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">{activeRisks.filter(r => r.probability === "Low" && r.impact === "Low").length}</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">{activeRisks.filter(r => r.probability === "Low" && r.impact === "Medium").length}</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">{activeRisks.filter(r => r.probability === "Low" && r.impact === "High").length}</Body></Card>
                      <Card className="p-2 text-center"><Body size="sm" className="">{activeRisks.filter(r => r.probability === "Low" && r.impact === "Critical").length}</Body></Card>
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
      </MainContent>

      <Modal open={!!selectedRisk} onClose={() => setSelectedRisk(null)}>
        <ModalHeader><H3>Risk Details</H3></ModalHeader>
        <ModalBody>
          {selectedRisk && (
            <Stack gap={4}>
              <Body className="font-display">{selectedRisk.title}</Body>
              <Body>{selectedRisk.description}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body size="sm" className="">Category</Body>
                  <Badge variant="outline">{selectedRisk.category}</Badge>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Status</Body>
                  <Badge variant={getStatusVariant(selectedRisk.status)}>{selectedRisk.status}</Badge>
                </Stack>
              </Grid>
              <Grid cols={3} gap={4}>
                <Stack gap={1}>
                  <Body size="sm" className="">Probability</Body>
                  <Body>{selectedRisk.probability}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Impact</Body>
                  <Body>{selectedRisk.impact}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Risk Score</Body>
                  <Badge variant={selectedRisk.riskScore >= 12 ? "solid" : "outline"}>{selectedRisk.riskScore}</Badge>
                </Stack>
              </Grid>
              <Stack gap={1}>
                <Body size="sm" className="">Owner</Body>
                <Body>{selectedRisk.owner}</Body>
              </Stack>
              {selectedRisk.mitigationPlan && (
                <Stack gap={1}>
                  <Body size="sm" className="">Mitigation Plan</Body>
                  <Body>{selectedRisk.mitigationPlan}</Body>
                </Stack>
              )}
              {selectedRisk.contingencyPlan && (
                <Stack gap={1}>
                  <Body size="sm" className="">Contingency Plan</Body>
                  <Body>{selectedRisk.contingencyPlan}</Body>
                </Stack>
              )}
              {selectedRisk.triggers && selectedRisk.triggers.length > 0 && (
                <Stack gap={2}>
                  <Body size="sm" className="">Triggers</Body>
                  {selectedRisk.triggers.map((trigger, idx) => (
                    <Card key={idx} className="p-2">
                      <Body size="sm" className="">{trigger}</Body>
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
    </CompvssAppLayout>
  );
}
