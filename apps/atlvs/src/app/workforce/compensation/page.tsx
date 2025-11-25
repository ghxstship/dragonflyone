'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert, ProgressBar,
} from '@ghxstship/ui';

interface CompensationPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  currentSalary: number;
  proposedSalary: number;
  equityGrant?: number;
  bonus?: number;
  effectiveDate: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
}

interface EquityGrant {
  id: string;
  employeeId: string;
  employeeName: string;
  grantType: 'ISO' | 'NSO' | 'RSU';
  shares: number;
  vestingSchedule: string;
  grantDate: string;
  expirationDate: string;
  vestedShares: number;
  status: 'Active' | 'Fully Vested' | 'Cancelled';
}

const mockPlans: CompensationPlan[] = [
  { id: 'COMP-001', employeeId: 'EMP-101', employeeName: 'John Smith', department: 'Production', role: 'Senior Engineer', currentSalary: 95000, proposedSalary: 105000, equityGrant: 5000, bonus: 10000, effectiveDate: '2025-01-01', status: 'Pending Approval' },
  { id: 'COMP-002', employeeId: 'EMP-102', employeeName: 'Sarah Johnson', department: 'Finance', role: 'Finance Manager', currentSalary: 85000, proposedSalary: 92000, bonus: 8000, effectiveDate: '2025-01-01', status: 'Approved' },
  { id: 'COMP-003', employeeId: 'EMP-103', employeeName: 'Mike Williams', department: 'Operations', role: 'Operations Lead', currentSalary: 78000, proposedSalary: 85000, equityGrant: 3000, effectiveDate: '2025-01-01', status: 'Draft' },
];

const mockEquity: EquityGrant[] = [
  { id: 'EQ-001', employeeId: 'EMP-101', employeeName: 'John Smith', grantType: 'ISO', shares: 10000, vestingSchedule: '4-year with 1-year cliff', grantDate: '2022-03-15', expirationDate: '2032-03-15', vestedShares: 5000, status: 'Active' },
  { id: 'EQ-002', employeeId: 'EMP-102', employeeName: 'Sarah Johnson', grantType: 'RSU', shares: 5000, vestingSchedule: '3-year quarterly', grantDate: '2023-01-01', expirationDate: '2033-01-01', vestedShares: 2500, status: 'Active' },
];

export default function CompensationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('plans');
  const [selectedPlan, setSelectedPlan] = useState<CompensationPlan | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredPlans = statusFilter === 'All' ? mockPlans : mockPlans.filter(p => p.status === statusFilter);
  const totalBudget = mockPlans.reduce((sum, p) => sum + (p.proposedSalary - p.currentSalary), 0);
  const pendingCount = mockPlans.filter(p => p.status === 'Pending Approval').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': case 'Active': case 'Fully Vested': return 'text-green-400';
      case 'Pending Approval': return 'text-yellow-400';
      case 'Draft': return 'text-ink-400';
      case 'Rejected': case 'Cancelled': return 'text-red-400';
      default: return 'text-ink-400';
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Compensation Planning & Equity</H1>
            <Label className="text-ink-400">Manage compensation plans and equity grants</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Plans" value={mockPlans.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pending Approval" value={pendingCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Budget Impact" value={`$${totalBudget.toLocaleString()}`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Equity Grants" value={mockEquity.length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === 'plans'} onClick={() => setActiveTab('plans')}>Compensation Plans</Tab>
              <Tab active={activeTab === 'equity'} onClick={() => setActiveTab('equity')}>Equity Grants</Tab>
              <Tab active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')}>Analysis</Tab>
            </TabsList>
          </Tabs>

          {activeTab === 'plans' && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border-ink-700 bg-black text-white w-48">
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                </Select>
                <Button variant="outlineWhite">Create Plan</Button>
              </Stack>

              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead className="text-ink-400">Employee</TableHead>
                    <TableHead className="text-ink-400">Role</TableHead>
                    <TableHead className="text-ink-400">Current</TableHead>
                    <TableHead className="text-ink-400">Proposed</TableHead>
                    <TableHead className="text-ink-400">Change</TableHead>
                    <TableHead className="text-ink-400">Effective</TableHead>
                    <TableHead className="text-ink-400">Status</TableHead>
                    <TableHead className="text-ink-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Label className="text-white">{plan.employeeName}</Label>
                          <Badge variant="outline">{plan.department}</Badge>
                        </Stack>
                      </TableCell>
                      <TableCell><Label className="text-ink-300">{plan.role}</Label></TableCell>
                      <TableCell><Label className="font-mono text-white">${plan.currentSalary.toLocaleString()}</Label></TableCell>
                      <TableCell><Label className="font-mono text-white">${plan.proposedSalary.toLocaleString()}</Label></TableCell>
                      <TableCell><Label className="font-mono text-green-400">+{((plan.proposedSalary - plan.currentSalary) / plan.currentSalary * 100).toFixed(1)}%</Label></TableCell>
                      <TableCell><Label className="font-mono text-ink-300">{plan.effectiveDate}</Label></TableCell>
                      <TableCell><Label className={getStatusColor(plan.status)}>{plan.status}</Label></TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedPlan(plan)}>View</Button>
                          {plan.status === 'Pending Approval' && <Button variant="solid" size="sm">Approve</Button>}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}

          {activeTab === 'equity' && (
            <Table className="border-2 border-ink-800">
              <TableHeader>
                <TableRow className="bg-ink-900">
                  <TableHead className="text-ink-400">Employee</TableHead>
                  <TableHead className="text-ink-400">Grant Type</TableHead>
                  <TableHead className="text-ink-400">Total Shares</TableHead>
                  <TableHead className="text-ink-400">Vested</TableHead>
                  <TableHead className="text-ink-400">Vesting Schedule</TableHead>
                  <TableHead className="text-ink-400">Grant Date</TableHead>
                  <TableHead className="text-ink-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockEquity.map((grant) => (
                  <TableRow key={grant.id}>
                    <TableCell><Label className="text-white">{grant.employeeName}</Label></TableCell>
                    <TableCell><Badge variant="outline">{grant.grantType}</Badge></TableCell>
                    <TableCell><Label className="font-mono text-white">{grant.shares.toLocaleString()}</Label></TableCell>
                    <TableCell>
                      <Stack gap={1}>
                        <Label className="font-mono text-green-400">{grant.vestedShares.toLocaleString()}</Label>
                        <ProgressBar value={(grant.vestedShares / grant.shares) * 100} className="h-1" />
                      </Stack>
                    </TableCell>
                    <TableCell><Label className="text-ink-300">{grant.vestingSchedule}</Label></TableCell>
                    <TableCell><Label className="font-mono text-ink-300">{grant.grantDate}</Label></TableCell>
                    <TableCell><Label className={getStatusColor(grant.status)}>{grant.status}</Label></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeTab === 'analysis' && (
            <Grid cols={2} gap={6}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>Salary Distribution</H3>
                  <Stack gap={2}>
                    {['$50K-$75K', '$75K-$100K', '$100K-$125K', '$125K+'].map((range, idx) => (
                      <Stack key={range} gap={1}>
                        <Stack direction="horizontal" className="justify-between">
                          <Label className="text-ink-300">{range}</Label>
                          <Label className="font-mono text-white">{[15, 35, 30, 20][idx]}%</Label>
                        </Stack>
                        <ProgressBar value={[15, 35, 30, 20][idx]} className="h-2" />
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>Budget Summary</H3>
                  <Grid cols={2} gap={4}>
                    <Stack gap={1}><Label className="text-ink-400">Total Salary Increase</Label><Label className="font-mono text-white text-xl">${totalBudget.toLocaleString()}</Label></Stack>
                    <Stack gap={1}><Label className="text-ink-400">Avg Increase</Label><Label className="font-mono text-white text-xl">8.5%</Label></Stack>
                    <Stack gap={1}><Label className="text-ink-400">Equity Pool Used</Label><Label className="font-mono text-white text-xl">8,000 shares</Label></Stack>
                    <Stack gap={1}><Label className="text-ink-400">Total Bonus</Label><Label className="font-mono text-white text-xl">$18,000</Label></Stack>
                  </Grid>
                </Stack>
              </Card>
            </Grid>
          )}

          <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/workforce')}>Back to Workforce</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedPlan} onClose={() => setSelectedPlan(null)}>
        <ModalHeader><H3>Compensation Plan Details</H3></ModalHeader>
        <ModalBody>
          {selectedPlan && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label className="text-ink-400">Employee</Label>
                <Body className="text-white text-lg">{selectedPlan.employeeName}</Body>
                <Badge variant="outline">{selectedPlan.department} • {selectedPlan.role}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Current Salary</Label><Label className="font-mono text-white">${selectedPlan.currentSalary.toLocaleString()}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Proposed Salary</Label><Label className="font-mono text-green-400">${selectedPlan.proposedSalary.toLocaleString()}</Label></Stack>
                {selectedPlan.equityGrant && <Stack gap={1}><Label className="text-ink-400">Equity Grant</Label><Label className="font-mono text-white">{selectedPlan.equityGrant.toLocaleString()} shares</Label></Stack>}
                {selectedPlan.bonus && <Stack gap={1}><Label className="text-ink-400">Bonus</Label><Label className="font-mono text-white">${selectedPlan.bonus.toLocaleString()}</Label></Stack>}
              </Grid>
              <Stack gap={1}><Label className="text-ink-400">Effective Date</Label><Label className="font-mono text-white">{selectedPlan.effectiveDate}</Label></Stack>
              <Stack gap={1}><Label className="text-ink-400">Status</Label><Label className={getStatusColor(selectedPlan.status)}>{selectedPlan.status}</Label></Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPlan(null)}>Close</Button>
          {selectedPlan?.status === 'Pending Approval' && <Button variant="solid">Approve</Button>}
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
