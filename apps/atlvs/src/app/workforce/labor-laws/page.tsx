'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
import {
  Container,
  H1,
  H3,
  Body,
  Label,
  Grid,
  Stack,
  StatCard,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Section as UISection,
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
  Alert,
} from '@ghxstship/ui';

interface StateLaborLaw {
  id: string;
  state: string;
  stateCode: string;
  category: string;
  requirement: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  status: 'Active' | 'Updated' | 'Pending';
}

interface StateCompliance {
  state: string;
  stateCode: string;
  activeProjects: number;
  employees: number;
  complianceScore: number;
  lastAudit?: string;
  issues: number;
}

const mockLaborLaws: StateLaborLaw[] = [
  { id: 'LAW-001', state: 'California', stateCode: 'CA', category: 'Meal Breaks', requirement: '30-min meal break', description: 'Employees must receive a 30-minute unpaid meal break for shifts over 5 hours', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-002', state: 'California', stateCode: 'CA', category: 'Rest Breaks', requirement: '10-min rest per 4 hours', description: 'Paid 10-minute rest break for every 4 hours worked', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-003', state: 'California', stateCode: 'CA', category: 'Overtime', requirement: 'Daily overtime', description: 'Overtime after 8 hours in a day, double time after 12 hours', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-004', state: 'New York', stateCode: 'NY', category: 'Meal Breaks', requirement: '30-min meal break', description: 'Meal break required for shifts over 6 hours spanning noon', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-005', state: 'New York', stateCode: 'NY', category: 'Spread of Hours', requirement: 'Extra hour pay', description: 'Additional hour at minimum wage if workday exceeds 10 hours', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-006', state: 'Texas', stateCode: 'TX', category: 'Overtime', requirement: 'Federal FLSA only', description: 'Texas follows federal overtime rules - overtime after 40 hours/week', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-007', state: 'Illinois', stateCode: 'IL', category: 'Meal Breaks', requirement: '20-min meal break', description: '20-minute meal break for shifts of 7.5+ hours', effectiveDate: '2024-01-01', lastUpdated: '2024-06-01', status: 'Updated' },
  { id: 'LAW-008', state: 'Nevada', stateCode: 'NV', category: 'Rest Breaks', requirement: '10-min rest per 4 hours', description: 'Paid 10-minute rest break for every 4 hours worked', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
];

const mockStateCompliance: StateCompliance[] = [
  { state: 'California', stateCode: 'CA', activeProjects: 8, employees: 156, complianceScore: 94, lastAudit: '2024-10-15', issues: 2 },
  { state: 'New York', stateCode: 'NY', activeProjects: 5, employees: 89, complianceScore: 98, lastAudit: '2024-11-01', issues: 0 },
  { state: 'Texas', stateCode: 'TX', activeProjects: 3, employees: 45, complianceScore: 100, lastAudit: '2024-09-20', issues: 0 },
  { state: 'Illinois', stateCode: 'IL', activeProjects: 2, employees: 32, complianceScore: 88, lastAudit: '2024-08-15', issues: 3 },
  { state: 'Nevada', stateCode: 'NV', activeProjects: 4, employees: 67, complianceScore: 96, lastAudit: '2024-10-01', issues: 1 },
];

const states = ['All', 'California', 'New York', 'Texas', 'Illinois', 'Nevada', 'Florida', 'Georgia'];
const categories = ['All', 'Meal Breaks', 'Rest Breaks', 'Overtime', 'Spread of Hours', 'Minimum Wage', 'Pay Frequency'];

export default function LaborLawsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('laws');
  const [selectedLaw, setSelectedLaw] = useState<StateLaborLaw | null>(null);
  const [stateFilter, setStateFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredLaws = mockLaborLaws.filter((law) => {
    const matchesState = stateFilter === 'All' || law.state === stateFilter;
    const matchesCategory = categoryFilter === 'All' || law.category === categoryFilter;
    return matchesState && matchesCategory;
  });

  const totalStates = new Set(mockLaborLaws.map((l) => l.state)).size;
  const updatedLaws = mockLaborLaws.filter((l) => l.status === 'Updated').length;
  const totalIssues = mockStateCompliance.reduce((sum, s) => sum + s.issues, 0);
  const avgCompliance = Math.round(mockStateCompliance.reduce((sum, s) => sum + s.complianceScore, 0) / mockStateCompliance.length);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-400';
      case 'Updated':
        return 'text-blue-400';
      case 'Pending':
        return 'text-yellow-400';
      default:
        return 'text-ink-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-400';
    if (score >= 85) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Multi-State Labor Law Management</H1>
            <Label className="text-ink-400">Track and comply with labor laws across all operating states</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="States Tracked" value={totalStates} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg Compliance" value={`${avgCompliance}%`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Recent Updates" value={updatedLaws} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Open Issues" value={totalIssues} trend={totalIssues > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {updatedLaws > 0 && <Alert variant="info">{updatedLaws} labor law(s) have been recently updated. Review changes to ensure compliance.</Alert>}

          <Tabs>
            <TabsList>
              <Tab active={activeTab === 'laws'} onClick={() => setActiveTab('laws')}>
                Labor Laws
              </Tab>
              <Tab active={activeTab === 'compliance'} onClick={() => setActiveTab('compliance')}>
                State Compliance
              </Tab>
              <Tab active={activeTab === 'comparison'} onClick={() => setActiveTab('comparison')}>
                State Comparison
              </Tab>
            </TabsList>
          </Tabs>

          {activeTab === 'laws' && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={4}>
                <Select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="border-ink-700 bg-black text-white w-48">
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border-ink-700 bg-black text-white w-48">
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Stack>

              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead className="text-ink-400">State</TableHead>
                    <TableHead className="text-ink-400">Category</TableHead>
                    <TableHead className="text-ink-400">Requirement</TableHead>
                    <TableHead className="text-ink-400">Description</TableHead>
                    <TableHead className="text-ink-400">Last Updated</TableHead>
                    <TableHead className="text-ink-400">Status</TableHead>
                    <TableHead className="text-ink-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLaws.map((law) => (
                    <TableRow key={law.id} className={law.status === 'Updated' ? 'bg-blue-900/10' : ''}>
                      <TableCell>
                        <Stack gap={1}>
                          <Label className="text-white">{law.state}</Label>
                          <Badge variant="outline">{law.stateCode}</Badge>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{law.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Label className="text-white">{law.requirement}</Label>
                      </TableCell>
                      <TableCell>
                        <Label className="text-ink-400">{law.description}</Label>
                      </TableCell>
                      <TableCell>
                        <Label className="font-mono text-ink-300">{law.lastUpdated}</Label>
                      </TableCell>
                      <TableCell>
                        <Label className={getStatusColor(law.status)}>{law.status}</Label>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLaw(law)}>
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}

          {activeTab === 'compliance' && (
            <Grid cols={2} gap={4}>
              {mockStateCompliance.map((state) => (
                <Card key={state.stateCode} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Stack gap={1}>
                        <Body className="font-display text-white">{state.state}</Body>
                        <Badge variant="outline">{state.stateCode}</Badge>
                      </Stack>
                      <Stack gap={1} className="text-right">
                        <Label className={`font-mono text-2xl ${getScoreColor(state.complianceScore)}`}>{state.complianceScore}%</Label>
                        <Label size="xs" className="text-ink-500">
                          Compliance Score
                        </Label>
                      </Stack>
                    </Stack>
                    <Grid cols={3} gap={4}>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">
                          Active Projects
                        </Label>
                        <Label className="font-mono text-white">{state.activeProjects}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">
                          Employees
                        </Label>
                        <Label className="font-mono text-white">{state.employees}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">
                          Open Issues
                        </Label>
                        <Label className={`font-mono ${state.issues > 0 ? 'text-yellow-400' : 'text-green-400'}`}>{state.issues}</Label>
                      </Stack>
                    </Grid>
                    {state.lastAudit && (
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">
                          Last Audit
                        </Label>
                        <Label className="text-ink-300">{state.lastAudit}</Label>
                      </Stack>
                    )}
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {state.issues > 0 && (
                        <Button variant="solid" size="sm">
                          Review Issues
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}

          {activeTab === 'comparison' && (
            <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
              <Stack gap={4}>
                <H3>State-by-State Comparison</H3>
                <Table className="border border-ink-700">
                  <TableHeader>
                    <TableRow className="bg-ink-800">
                      <TableHead className="text-ink-400">Requirement</TableHead>
                      {['CA', 'NY', 'TX', 'IL', 'NV'].map((state) => (
                        <TableHead key={state} className="text-ink-400 text-center">
                          {state}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-ink-700">
                      <TableCell>
                        <Label className="text-white">Meal Break</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-green-400">30 min</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-green-400">30 min</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-ink-500">None</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-green-400">20 min</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-green-400">30 min</Label>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-ink-700">
                      <TableCell>
                        <Label className="text-white">Rest Breaks</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-green-400">10 min/4hr</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-ink-500">None</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-ink-500">None</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-ink-500">None</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-green-400">10 min/4hr</Label>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-ink-700">
                      <TableCell>
                        <Label className="text-white">Daily Overtime</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-green-400">After 8hr</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-ink-500">None</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-ink-500">None</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-ink-500">None</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-green-400">After 8hr</Label>
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-ink-700">
                      <TableCell>
                        <Label className="text-white">Weekly Overtime</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-green-400">After 40hr</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-green-400">After 40hr</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-green-400">After 40hr</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-green-400">After 40hr</Label>
                      </TableCell>
                      <TableCell className="text-center">
                        <Label className="text-green-400">After 40hr</Label>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Stack>
            </Card>
          )}

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">
              Export Report
            </Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/workforce')}>
              Workforce
            </Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/')}>
              Dashboard
            </Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedLaw} onClose={() => setSelectedLaw(null)}>
        <ModalHeader>
          <H3>Labor Law Details</H3>
        </ModalHeader>
        <ModalBody>
          {selectedLaw && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedLaw.state}</Badge>
                <Badge variant="outline">{selectedLaw.category}</Badge>
                <Label className={getStatusColor(selectedLaw.status)}>{selectedLaw.status}</Label>
              </Stack>
              <Stack gap={1}>
                <Label className="text-ink-400">Requirement</Label>
                <Body className="text-white text-lg">{selectedLaw.requirement}</Body>
              </Stack>
              <Stack gap={1}>
                <Label className="text-ink-400">Description</Label>
                <Body className="text-ink-300">{selectedLaw.description}</Body>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Effective Date
                  </Label>
                  <Label className="font-mono text-white">{selectedLaw.effectiveDate}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Last Updated
                  </Label>
                  <Label className="font-mono text-white">{selectedLaw.lastUpdated}</Label>
                </Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedLaw(null)}>
            Close
          </Button>
          <Button variant="solid">View Source</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
