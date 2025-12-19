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
  Select,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  Badge,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";
import {
  useWeatherPlans,
  type WeatherPlan,
} from '../../hooks/useWeatherContingency';


export default function WeatherContingencyPage() {
  const router = useRouter();
  const { data: weatherPlans = [], isLoading, error } = useWeatherPlans();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'active',
    validTabs: ['active', 'triggered', 'all'],
  });
  const [selectedPlan, setSelectedPlan] = useState<WeatherPlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (isLoading) {
    return (
      <CompvssAppLayout>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Stack gap={4} className="items-center">
              <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
              <Body>Loading weather contingency data...</Body>
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
                <Body className="text-destructive font-display">Failed to load weather data</Body>
                <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </Stack>
            </Card>
          </Container>
        </MainContent>
      </CompvssAppLayout>
    );
  }

  const activePlans = weatherPlans.filter(p => p.status === "Active").length;
  const triggeredPlans = weatherPlans.filter(p => p.status === "Triggered").length;
  const highRiskCount = weatherPlans.filter(p => p.riskLevel === "High" || p.riskLevel === "Severe").length;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "success";
      case "Moderate": return "warning";
      case "High": return "warning";
      case "Severe": return "error";
      default: return "ghost";
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

  const getStatusVariant = (status: string): 'success' | 'info' | 'warning' | 'error' | 'ghost' => {
    switch (status) {
      case "Active": return "success";
      case "Triggered": return "warning";
      case "Cleared": return "ghost";
      default: return "ghost";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Weather Contingency Planning"
        subtitle="Monitor conditions and manage weather-related contingency plans"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
            <Grid cols={4} gap={6}>
              <StatCard label="Active Plans" value={activePlans.toString()} />
              <StatCard label="Triggered" value={triggeredPlans.toString()} />
              <StatCard label="High Risk" value={highRiskCount.toString()} />
              <StatCard label="Outdoor Events" value={weatherPlans.filter(p => p.venueType === "Outdoor").length.toString()} />
            </Grid>

            {triggeredPlans > 0 && (
              <Alert variant="warning">
                {triggeredPlans} contingency plan(s) currently triggered due to weather conditions
              </Alert>
            )}

            <Stack direction="horizontal" className="justify-between">
              <Tabs>
                <TabsList>
                  <Tab active={isActive('active')} onClick={() => setActiveTab('active')}>Active</Tab>
                  <Tab active={isActive('triggered')} onClick={() => setActiveTab('triggered')}>Triggered</Tab>
                  <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
                </TabsList>
              </Tabs>
              <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Plan</Button>
            </Stack>

            <Stack gap={4}>
              {weatherPlans
                .filter(p => activeTab === "all" || (activeTab === "triggered" ? p.status === "Triggered" : p.status === "Active"))
                .map((plan) => (
                  <Card key={plan.id}>
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Stack gap={1}>
                          <Body className="font-display">{plan.projectName}</Body>
                          <Stack direction="horizontal" gap={2}>
                            <Badge variant="outline">{plan.venueType}</Badge>
                            <Body size="sm" className="">{plan.venue}</Body>
                            <Body size="sm" className="">•</Body>
                            <Body size="sm" className="">{plan.eventDate}</Body>
                          </Stack>
                        </Stack>
                        <Stack direction="horizontal" gap={4} className="items-center">
                          <Stack gap={1} className="text-right">
                            <Body size="sm" className="">Risk Level</Body>
                            <Badge variant={getRiskColor(plan.riskLevel)} className={getRiskBg(plan.riskLevel)}>{plan.riskLevel}</Badge>
                          </Stack>
                          <Stack gap={1} className="text-right">
                            <Body size="sm" className="">Status</Body>
                            <Badge variant={getStatusVariant(plan.status)}>{plan.status}</Badge>
                          </Stack>
                        </Stack>
                      </Stack>

                      <Card>
                        <Stack direction="horizontal" className="justify-between items-center">
                          <Stack gap={1}>
                            <Body size="sm" className="">Current Conditions</Body>
                            <Body>{plan.currentConditions}</Body>
                          </Stack>
                          <Button variant="ghost" size="sm">Refresh</Button>
                        </Stack>
                      </Card>

                      <Stack gap={2}>
                        <Body size="sm" className="">Contingency Actions ({plan.contingencyPlans.length})</Body>
                        <Grid cols={2} gap={2}>
                          {plan.contingencyPlans.map((action) => (
                            <Card key={action.id}>
                              <Stack gap={2}>
                                <Stack direction="horizontal" className="justify-between">
                                  <Badge variant="outline">{action.trigger}</Badge>
                                  <Badge variant={getStatusVariant(action.status)}>{action.status}</Badge>
                                </Stack>
                                <Body size="sm" className="">Threshold: {action.threshold}</Body>
                                <Body>{action.action}</Body>
                                <Body size="sm" className="">Responsible: {action.responsible}</Body>
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
      </MainContent>

      <Modal open={!!selectedPlan} onClose={() => setSelectedPlan(null)}>
        <ModalHeader><H3>Weather Plan Details</H3></ModalHeader>
        <ModalBody>
          {selectedPlan && (
            <Stack gap={4}>
              <Body className="font-display">{selectedPlan.projectName}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Body size="sm" className="">Venue</Body><Body>{selectedPlan.venue}</Body></Stack>
                <Stack gap={1}><Body size="sm" className="">Type</Body><Badge variant="outline">{selectedPlan.venueType}</Badge></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Body size="sm" className="">Event Date</Body><Body>{selectedPlan.eventDate}</Body></Stack>
                <Stack gap={1}><Body size="sm" className="">Risk Level</Body><Badge variant={getRiskColor(selectedPlan.riskLevel)} className={getRiskBg(selectedPlan.riskLevel)}>{selectedPlan.riskLevel}</Badge></Stack>
              </Grid>
              <Stack gap={1}><Body size="sm" className="">Current Conditions</Body><Body>{selectedPlan.currentConditions}</Body></Stack>
              <Stack gap={2}>
                <Body size="sm" className="">All Contingency Actions</Body>
                {selectedPlan.contingencyPlans.map((action) => (
                  <Card key={action.id}>
                    <Stack gap={1}>
                      <Stack direction="horizontal" className="justify-between">
                        <Body>{action.trigger}: {action.threshold}</Body>
                        <Badge variant={getStatusVariant(action.status)}>{action.status}</Badge>
                      </Stack>
                      <Body>{action.action}</Body>
                      <Body size="sm" className="">{action.responsible}</Body>
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
    </CompvssAppLayout>
  );
}
