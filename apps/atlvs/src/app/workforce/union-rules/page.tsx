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
  Textarea,
  Alert,
} from '@ghxstship/ui';

interface UnionRule {
  id: string;
  union: string;
  category: string;
  rule: string;
  description: string;
  effectiveDate: string;
  status: 'Active' | 'Pending' | 'Expired';
  penaltyType?: string;
  penaltyAmount?: number;
}

interface UnionAgreement {
  id: string;
  union: string;
  agreementType: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expiring' | 'Expired' | 'In Negotiation';
  keyTerms: string[];
}

interface ComplianceViolation {
  id: string;
  projectId: string;
  projectName: string;
  union: string;
  rule: string;
  violationDate: string;
  status: 'Open' | 'Resolved' | 'Disputed';
  penalty?: number;
  notes?: string;
}

const mockRules: UnionRule[] = [
  { id: 'RULE-001', union: 'IATSE Local 1', category: 'Work Hours', rule: 'Maximum 10-hour call', description: 'Standard work call cannot exceed 10 hours without meal penalty', effectiveDate: '2024-01-01', status: 'Active', penaltyType: 'Hourly', penaltyAmount: 75 },
  { id: 'RULE-002', union: 'IATSE Local 1', category: 'Meal Breaks', rule: '6-hour meal break', description: 'Meal break required within 6 hours of call time', effectiveDate: '2024-01-01', status: 'Active', penaltyType: 'Per Violation', penaltyAmount: 50 },
  { id: 'RULE-003', union: 'IATSE Local 1', category: 'Turnaround', rule: '10-hour turnaround', description: 'Minimum 10 hours between end of call and next call', effectiveDate: '2024-01-01', status: 'Active', penaltyType: 'Hourly', penaltyAmount: 100 },
  { id: 'RULE-004', union: 'IBEW Local 3', category: 'Overtime', rule: 'Double time after 12', description: 'Double time rate applies after 12 hours worked', effectiveDate: '2024-01-01', status: 'Active', penaltyType: 'Rate Multiplier' },
  { id: 'RULE-005', union: 'Teamsters Local 817', category: 'Travel', rule: 'Portal-to-portal pay', description: 'Pay begins when leaving designated call point', effectiveDate: '2024-01-01', status: 'Active' },
];

const mockAgreements: UnionAgreement[] = [
  { id: 'AGR-001', union: 'IATSE Local 1', agreementType: 'Master Agreement', startDate: '2023-07-01', endDate: '2026-06-30', status: 'Active', keyTerms: ['10-hour standard call', '6-hour meal break', 'Health & welfare contributions'] },
  { id: 'AGR-002', union: 'IBEW Local 3', agreementType: 'Project Agreement', startDate: '2024-01-01', endDate: '2024-12-31', status: 'Expiring', keyTerms: ['Electrical work jurisdiction', 'Apprentice ratios', 'Safety requirements'] },
  { id: 'AGR-003', union: 'Teamsters Local 817', agreementType: 'Master Agreement', startDate: '2024-03-01', endDate: '2027-02-28', status: 'Active', keyTerms: ['Transportation jurisdiction', 'Equipment operation', 'Per diem rates'] },
];

const mockViolations: ComplianceViolation[] = [
  { id: 'VIO-001', projectId: 'PROJ-089', projectName: 'Summer Fest 2024', union: 'IATSE Local 1', rule: '6-hour meal break', violationDate: '2024-11-15', status: 'Resolved', penalty: 250, notes: 'Meal penalty paid for 5 crew members' },
  { id: 'VIO-002', projectId: 'PROJ-088', projectName: 'Fall Festival', union: 'IATSE Local 1', rule: '10-hour turnaround', violationDate: '2024-11-10', status: 'Open', penalty: 400 },
  { id: 'VIO-003', projectId: 'PROJ-087', projectName: 'Corporate Gala', union: 'IBEW Local 3', rule: 'Overtime notification', violationDate: '2024-11-05', status: 'Disputed', notes: 'Disputing overtime calculation method' },
];

const unions = ['All', 'IATSE Local 1', 'IBEW Local 3', 'Teamsters Local 817', 'UA Local 1'];

export default function UnionRulesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('rules');
  const [selectedRule, setSelectedRule] = useState<UnionRule | null>(null);
  const [selectedAgreement, setSelectedAgreement] = useState<UnionAgreement | null>(null);
  const [unionFilter, setUnionFilter] = useState('All');
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);

  const filteredRules = unionFilter === 'All' ? mockRules : mockRules.filter((r) => r.union === unionFilter);
  const filteredAgreements = unionFilter === 'All' ? mockAgreements : mockAgreements.filter((a) => a.union === unionFilter);

  const activeRules = mockRules.filter((r) => r.status === 'Active').length;
  const expiringAgreements = mockAgreements.filter((a) => a.status === 'Expiring').length;
  const openViolations = mockViolations.filter((v) => v.status === 'Open').length;
  const totalPenalties = mockViolations.filter((v) => v.penalty).reduce((sum, v) => sum + (v.penalty || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Resolved':
        return 'text-green-400';
      case 'Pending':
      case 'Expiring':
      case 'Open':
        return 'text-yellow-400';
      case 'Expired':
      case 'Disputed':
        return 'text-red-400';
      case 'In Negotiation':
        return 'text-blue-400';
      default:
        return 'text-ink-400';
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Union Rules & Compliance</H1>
            <Label className="text-ink-400">Track union rules, agreements, and compliance across all projects</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Active Rules" value={activeRules} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Agreements" value={mockAgreements.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Open Violations" value={openViolations} trend={openViolations > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="YTD Penalties" value={`$${totalPenalties.toLocaleString()}`} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {(expiringAgreements > 0 || openViolations > 0) && (
            <Alert variant="warning">
              {expiringAgreements > 0 && `${expiringAgreements} agreement(s) expiring soon. `}
              {openViolations > 0 && `${openViolations} open violation(s) require attention.`}
            </Alert>
          )}

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === 'rules'} onClick={() => setActiveTab('rules')}>
                  Rules
                </Tab>
                <Tab active={activeTab === 'agreements'} onClick={() => setActiveTab('agreements')}>
                  Agreements
                </Tab>
                <Tab active={activeTab === 'violations'} onClick={() => setActiveTab('violations')}>
                  Violations ({openViolations})
                </Tab>
              </TabsList>
            </Tabs>
            <Stack direction="horizontal" gap={2}>
              <Select value={unionFilter} onChange={(e) => setUnionFilter(e.target.value)} className="border-ink-700 bg-black text-white w-48">
                {unions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
              <Button variant="outlineWhite" onClick={() => setShowAddRuleModal(true)}>
                Add Rule
              </Button>
            </Stack>
          </Stack>

          {activeTab === 'rules' && (
            <Table className="border-2 border-ink-800">
              <TableHeader>
                <TableRow className="bg-ink-900">
                  <TableHead className="text-ink-400">Union</TableHead>
                  <TableHead className="text-ink-400">Category</TableHead>
                  <TableHead className="text-ink-400">Rule</TableHead>
                  <TableHead className="text-ink-400">Description</TableHead>
                  <TableHead className="text-ink-400">Penalty</TableHead>
                  <TableHead className="text-ink-400">Status</TableHead>
                  <TableHead className="text-ink-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.map((rule) => (
                  <TableRow key={rule.id} className="border-ink-800">
                    <TableCell>
                      <Badge variant="outline">{rule.union}</Badge>
                    </TableCell>
                    <TableCell>
                      <Label className="text-ink-300">{rule.category}</Label>
                    </TableCell>
                    <TableCell>
                      <Label className="text-white">{rule.rule}</Label>
                    </TableCell>
                    <TableCell>
                      <Label className="text-ink-400">{rule.description}</Label>
                    </TableCell>
                    <TableCell>
                      {rule.penaltyAmount ? (
                        <Stack gap={0}>
                          <Label className="font-mono text-white">${rule.penaltyAmount}</Label>
                          <Label size="xs" className="text-ink-500">
                            {rule.penaltyType}
                          </Label>
                        </Stack>
                      ) : (
                        <Label className="text-ink-500">-</Label>
                      )}
                    </TableCell>
                    <TableCell>
                      <Label className={getStatusColor(rule.status)}>{rule.status}</Label>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedRule(rule)}>
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeTab === 'agreements' && (
            <Grid cols={2} gap={4}>
              {filteredAgreements.map((agreement) => (
                <Card key={agreement.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Stack gap={1}>
                        <Body className="font-display text-white">{agreement.union}</Body>
                        <Badge variant="outline">{agreement.agreementType}</Badge>
                      </Stack>
                      <Label className={getStatusColor(agreement.status)}>{agreement.status}</Label>
                    </Stack>
                    <Grid cols={2} gap={4}>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">
                          Start Date
                        </Label>
                        <Label className="font-mono text-white">{agreement.startDate}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">
                          End Date
                        </Label>
                        <Label className={`font-mono ${agreement.status === 'Expiring' ? 'text-yellow-400' : 'text-white'}`}>{agreement.endDate}</Label>
                      </Stack>
                    </Grid>
                    <Stack gap={2}>
                      <Label size="xs" className="text-ink-500">
                        Key Terms
                      </Label>
                      <Stack direction="horizontal" gap={2} className="flex-wrap">
                        {agreement.keyTerms.map((term, idx) => (
                          <Badge key={idx} variant="outline">
                            {term}
                          </Badge>
                        ))}
                      </Stack>
                    </Stack>
                    <Button variant="outline" size="sm" onClick={() => setSelectedAgreement(agreement)}>
                      View Agreement
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}

          {activeTab === 'violations' && (
            <Table className="border-2 border-ink-800">
              <TableHeader>
                <TableRow className="bg-ink-900">
                  <TableHead className="text-ink-400">Project</TableHead>
                  <TableHead className="text-ink-400">Union</TableHead>
                  <TableHead className="text-ink-400">Rule Violated</TableHead>
                  <TableHead className="text-ink-400">Date</TableHead>
                  <TableHead className="text-ink-400">Penalty</TableHead>
                  <TableHead className="text-ink-400">Status</TableHead>
                  <TableHead className="text-ink-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockViolations.map((violation) => (
                  <TableRow key={violation.id} className={violation.status === 'Open' ? 'bg-yellow-900/10' : ''}>
                    <TableCell>
                      <Stack gap={1}>
                        <Label className="text-white">{violation.projectName}</Label>
                        <Label size="xs" className="text-ink-500">
                          {violation.projectId}
                        </Label>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{violation.union}</Badge>
                    </TableCell>
                    <TableCell>
                      <Label className="text-ink-300">{violation.rule}</Label>
                    </TableCell>
                    <TableCell>
                      <Label className="font-mono text-white">{violation.violationDate}</Label>
                    </TableCell>
                    <TableCell>
                      {violation.penalty ? <Label className="font-mono text-red-400">${violation.penalty}</Label> : <Label className="text-ink-500">TBD</Label>}
                    </TableCell>
                    <TableCell>
                      <Label className={getStatusColor(violation.status)}>{violation.status}</Label>
                    </TableCell>
                    <TableCell>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                        {violation.status === 'Open' && (
                          <Button variant="solid" size="sm">
                            Resolve
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

      <Modal open={!!selectedRule} onClose={() => setSelectedRule(null)}>
        <ModalHeader>
          <H3>Rule Details</H3>
        </ModalHeader>
        <ModalBody>
          {selectedRule && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedRule.union}</Badge>
                <Badge variant="outline">{selectedRule.category}</Badge>
                <Label className={getStatusColor(selectedRule.status)}>{selectedRule.status}</Label>
              </Stack>
              <Stack gap={1}>
                <Label className="text-ink-400">Rule</Label>
                <Body className="text-white text-lg">{selectedRule.rule}</Body>
              </Stack>
              <Stack gap={1}>
                <Label className="text-ink-400">Description</Label>
                <Body className="text-ink-300">{selectedRule.description}</Body>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Effective Date
                  </Label>
                  <Label className="font-mono text-white">{selectedRule.effectiveDate}</Label>
                </Stack>
                {selectedRule.penaltyAmount && (
                  <Stack gap={1}>
                    <Label size="xs" className="text-ink-500">
                      Penalty
                    </Label>
                    <Label className="font-mono text-white">
                      ${selectedRule.penaltyAmount} ({selectedRule.penaltyType})
                    </Label>
                  </Stack>
                )}
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedRule(null)}>
            Close
          </Button>
          <Button variant="solid">Edit Rule</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedAgreement} onClose={() => setSelectedAgreement(null)}>
        <ModalHeader>
          <H3>Agreement Details</H3>
        </ModalHeader>
        <ModalBody>
          {selectedAgreement && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label className="text-ink-400">Union</Label>
                <Body className="text-white text-lg">{selectedAgreement.union}</Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedAgreement.agreementType}</Badge>
                <Label className={getStatusColor(selectedAgreement.status)}>{selectedAgreement.status}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Start Date
                  </Label>
                  <Label className="font-mono text-white">{selectedAgreement.startDate}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    End Date
                  </Label>
                  <Label className="font-mono text-white">{selectedAgreement.endDate}</Label>
                </Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="text-ink-400">Key Terms</Label>
                <Stack gap={1}>
                  {selectedAgreement.keyTerms.map((term, idx) => (
                    <Label key={idx} className="text-ink-300">
                      • {term}
                    </Label>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedAgreement(null)}>
            Close
          </Button>
          <Button variant="outline">Download PDF</Button>
          <Button variant="solid">View Full Agreement</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAddRuleModal} onClose={() => setShowAddRuleModal(false)}>
        <ModalHeader>
          <H3>Add Union Rule</H3>
        </ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Select Union...</option>
              {unions.slice(1).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Category...</option>
                <option value="Work Hours">Work Hours</option>
                <option value="Meal Breaks">Meal Breaks</option>
                <option value="Turnaround">Turnaround</option>
                <option value="Overtime">Overtime</option>
                <option value="Travel">Travel</option>
              </Select>
              <Input placeholder="Rule Name" className="border-ink-700 bg-black text-white" />
            </Grid>
            <Textarea placeholder="Rule Description..." className="border-ink-700 bg-black text-white" rows={3} />
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Penalty Type...</option>
                <option value="Hourly">Hourly</option>
                <option value="Per Violation">Per Violation</option>
                <option value="Rate Multiplier">Rate Multiplier</option>
              </Select>
              <Input type="number" placeholder="Penalty Amount ($)" className="border-ink-700 bg-black text-white" />
            </Grid>
            <Stack gap={2}>
              <Label>Effective Date</Label>
              <Input type="date" className="border-ink-700 bg-black text-white" />
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddRuleModal(false)}>
            Cancel
          </Button>
          <Button variant="solid" onClick={() => setShowAddRuleModal(false)}>
            Add Rule
          </Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
