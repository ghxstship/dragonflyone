'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Layout provided by route group
import {
  Container,
  H3,
  Body,
  Label,
  Grid,
  Stack,
  StatCard,
  Select,
  Button,
  Card,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ProgressBar,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';
import { useSuccessionPlans, type SuccessionPlan as APISuccessionPlan } from '@ghxstship/config';
import { DEMO_SUCCESSION_PLANS } from '../../../../lib/demo-data';

type SuccessionPlan = APISuccessionPlan;

export default function SuccessionPlanningPage() {
  const router = useRouter();
  const { plans: apiPlans, summary, isLoading } = useSuccessionPlans();
  const [selectedPlan, setSelectedPlan] = useState<SuccessionPlan | null>(null);
  const [riskFilter, setRiskFilter] = useState('All');

  // Use API data or fall back to demo data
  const plans: SuccessionPlan[] = apiPlans.length > 0 ? apiPlans : (DEMO_SUCCESSION_PLANS as unknown as SuccessionPlan[]);

  const filteredPlans = riskFilter === 'All' ? plans : plans.filter(p => p.riskLevel === riskFilter);
  const highRiskCount = summary?.highRisk || plans.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Critical').length;
  const readyNowCount = summary?.readyNow || plans.flatMap(p => p.successors).filter(s => s.readiness === 'Ready Now').length;
  const totalSuccessors = summary?.totalSuccessors || plans.flatMap(p => p.successors).length;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-success-400';
      case 'Medium': return 'text-warning-400';
      case 'High': return 'text-warning-400';
      case 'Critical': return 'text-error-400';
      default: return 'text-ink-400';
    }
  };

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case 'Ready Now': return 'text-success-400';
      case '1-2 Years': return 'text-warning-400';
      case '3-5 Years': return 'text-warning-400';
      default: return 'text-ink-400';
    }
  };

  return (
    <>
      <EnterprisePageHeader
        title="Succession Planning"
        subtitle="Identify and develop future leaders for key positions"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading succession plans...</div>
            </div>
          )}

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Key Positions" value={plans.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="High Risk" value={highRiskCount} trend={highRiskCount > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Ready Now" value={readyNowCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Successors" value={totalSuccessors} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="border-ink-700 bg-black text-white w-48">
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Select>
            <Button variant="outlineWhite">Add Position</Button>
          </Stack>

          <Stack gap={4}>
            {filteredPlans.map((plan) => (
              <Card key={plan.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between">
                    <Stack gap={1}>
                      <Body className="font-display text-white">{plan.position}</Body>
                      <Stack direction="horizontal" gap={2}>
                        <Badge variant="outline">{plan.department}</Badge>
                        <Label className="text-ink-400">Current: {plan.currentHolder}</Label>
                      </Stack>
                    </Stack>
                    <Stack gap={1} className="text-right">
                      <Label className={getRiskColor(plan.riskLevel)}>{plan.riskLevel} Risk</Label>
                      <Label size="xs" className="text-ink-500">Reviewed: {plan.lastReviewed}</Label>
                    </Stack>
                  </Stack>
                  
                  <Stack gap={2}>
                    <Label className="text-ink-400">Successors ({plan.successors.length})</Label>
                    <Grid cols={2} gap={3} className="sm:grid-cols-1 lg:grid-cols-2">
                      {plan.successors.map((successor) => (
                        <Card key={successor.id} className="p-3 border-2 border-ink-700 bg-ink-800">
                          <Stack gap={2}>
                            <Stack direction="horizontal" className="justify-between">
                              <Stack gap={0}>
                                <Label className="text-white">{successor.name}</Label>
                                <Label size="xs" className="text-ink-400">{successor.currentRole}</Label>
                              </Stack>
                              <Label className={getReadinessColor(successor.readiness)}>{successor.readiness}</Label>
                            </Stack>
                            <Stack gap={1}>
                              <Stack direction="horizontal" className="justify-between">
                                <Label size="xs" className="text-ink-500">Readiness Score</Label>
                                <Label size="xs" className="font-mono text-white">{successor.readinessScore}%</Label>
                              </Stack>
                              <ProgressBar value={successor.readinessScore} className="h-1" />
                            </Stack>
                          </Stack>
                        </Card>
                      ))}
                    </Grid>
                  </Stack>
                  
                  <Button variant="outline" size="sm" onClick={() => setSelectedPlan(plan)}>View Details</Button>
                </Stack>
              </Card>
            ))}
          </Stack>

            <Button variant="outline" className="border-ink-800 text-grey-400" onClick={() => router.push('/workforce')}>Back to Workforce</Button>

      <Modal open={!!selectedPlan} onClose={() => setSelectedPlan(null)}>
        <ModalHeader><H3>{selectedPlan?.position}</H3></ModalHeader>
        <ModalBody>
          {selectedPlan && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedPlan.department}</Badge>
                <Label className={getRiskColor(selectedPlan.riskLevel)}>{selectedPlan.riskLevel} Risk</Label>
              </Stack>
              <Stack gap={1}>
                <Label className="text-grey-400">Current Holder</Label>
                <Body className="text-white">{selectedPlan.currentHolder}</Body>
              </Stack>
              <Stack gap={2}>
                <Label className="text-grey-400">Succession Pipeline</Label>
                {selectedPlan.successors.map((successor, idx) => (
                  <Card key={successor.id} className="p-4 border-2 border-ink-800 bg-grey-800">
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={0}>
                          <Label className="text-white">{idx + 1}. {successor.name}</Label>
                          <Label size="xs" className="text-grey-400">{successor.currentRole}</Label>
                        </Stack>
                        <Stack gap={1} className="text-right">
                          <Label className={getReadinessColor(successor.readiness)}>{successor.readiness}</Label>
                          <Label className="font-mono text-white">{successor.readinessScore}%</Label>
                        </Stack>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-grey-500">Development Areas</Label>
                        <Stack direction="horizontal" gap={1} className="flex-wrap">
                          {successor.developmentAreas.map((area, i) => (
                            <Badge key={i} variant="outline">{area}</Badge>
                          ))}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPlan(null)}>Close</Button>
          <Button variant="solid">Edit Plan</Button>
        </ModalFooter>
      </Modal>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
