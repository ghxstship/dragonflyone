'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  Container,
  H3,
  Body,
  Label,
  Grid,
  Stack,
  StatCard,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  ProgressBar,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';

interface HandbookSection {
  id: string;
  title: string;
  category: string;
  version: string;
  lastUpdated: string;
  requiresAck: boolean;
  description: string;
}

interface PolicyAcknowledgment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  policyId: string;
  policyTitle: string;
  acknowledgedDate?: string;
  status: 'Acknowledged' | 'Pending' | 'Overdue';
  dueDate: string;
}

const mockSections: HandbookSection[] = [
  { id: 'SEC-001', title: 'Code of Conduct', category: 'General', version: '3.2', lastUpdated: '2024-09-01', requiresAck: true, description: 'Professional behavior standards and ethical guidelines' },
  { id: 'SEC-002', title: 'Anti-Harassment Policy', category: 'Compliance', version: '2.1', lastUpdated: '2024-10-15', requiresAck: true, description: 'Workplace harassment prevention and reporting procedures' },
  { id: 'SEC-003', title: 'Safety Procedures', category: 'Safety', version: '4.0', lastUpdated: '2024-11-01', requiresAck: true, description: 'Workplace safety requirements and emergency procedures' },
  { id: 'SEC-004', title: 'Time Off Policies', category: 'Benefits', version: '2.5', lastUpdated: '2024-08-01', requiresAck: false, description: 'PTO, sick leave, and vacation policies' },
  { id: 'SEC-005', title: 'Equipment Usage', category: 'Operations', version: '1.8', lastUpdated: '2024-07-15', requiresAck: true, description: 'Proper use and care of company equipment' },
  { id: 'SEC-006', title: 'Confidentiality Agreement', category: 'Legal', version: '2.0', lastUpdated: '2024-06-01', requiresAck: true, description: 'Protection of confidential and proprietary information' },
  { id: 'SEC-007', title: 'Remote Work Policy', category: 'General', version: '1.5', lastUpdated: '2024-09-15', requiresAck: false, description: 'Guidelines for remote and hybrid work arrangements' },
  { id: 'SEC-008', title: 'Drug & Alcohol Policy', category: 'Compliance', version: '2.3', lastUpdated: '2024-05-01', requiresAck: true, description: 'Substance abuse prevention and testing policies' },
];

const mockAcknowledgments: PolicyAcknowledgment[] = [
  { id: 'ACK-001', employeeId: 'EMP-101', employeeName: 'John Smith', department: 'Production', policyId: 'SEC-001', policyTitle: 'Code of Conduct', acknowledgedDate: '2024-09-15', status: 'Acknowledged', dueDate: '2024-09-30' },
  { id: 'ACK-002', employeeId: 'EMP-102', employeeName: 'Sarah Johnson', department: 'Finance', policyId: 'SEC-002', policyTitle: 'Anti-Harassment Policy', status: 'Pending', dueDate: '2024-11-30' },
  { id: 'ACK-003', employeeId: 'EMP-103', employeeName: 'Mike Williams', department: 'Operations', policyId: 'SEC-003', policyTitle: 'Safety Procedures', status: 'Overdue', dueDate: '2024-11-15' },
  { id: 'ACK-004', employeeId: 'EMP-104', employeeName: 'Emily Davis', department: 'Audio', policyId: 'SEC-001', policyTitle: 'Code of Conduct', acknowledgedDate: '2024-09-20', status: 'Acknowledged', dueDate: '2024-09-30' },
  { id: 'ACK-005', employeeId: 'EMP-105', employeeName: 'Chris Brown', department: 'Lighting', policyId: 'SEC-006', policyTitle: 'Confidentiality Agreement', status: 'Pending', dueDate: '2024-12-01' },
];

const categories = ['All', 'General', 'Compliance', 'Safety', 'Benefits', 'Operations', 'Legal'];

export default function HandbookPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('handbook');
  const [selectedSection, setSelectedSection] = useState<HandbookSection | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showSendReminderModal, setShowSendReminderModal] = useState(false);

  const filteredSections = categoryFilter === 'All' ? mockSections : mockSections.filter((s) => s.category === categoryFilter);

  const requiresAckCount = mockSections.filter((s) => s.requiresAck).length;
  const acknowledgedCount = mockAcknowledgments.filter((a) => a.status === 'Acknowledged').length;
  const pendingCount = mockAcknowledgments.filter((a) => a.status === 'Pending').length;
  const overdueCount = mockAcknowledgments.filter((a) => a.status === 'Overdue').length;
  const complianceRate = Math.round((acknowledgedCount / mockAcknowledgments.length) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Acknowledged':
        return 'text-success-400';
      case 'Pending':
        return 'text-warning-400';
      case 'Overdue':
        return 'text-error-400';
      default:
        return 'text-ink-400';
    }
  };

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="Employee Handbook & Policies"
        subtitle="Manage handbook sections and track policy acknowledgments"
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Workforce', href: '/workforce' }, { label: 'Handbook' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

          <Grid cols={4} gap={6}>
            <StatCard label="Handbook Sections" value={mockSections.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Requires Acknowledgment" value={requiresAckCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Compliance Rate" value={`${complianceRate}%`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Overdue" value={overdueCount} trend={overdueCount > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {overdueCount > 0 && <Alert variant="warning">{overdueCount} employee(s) have overdue policy acknowledgments</Alert>}

          <Tabs>
            <TabsList>
              <Tab active={activeTab === 'handbook'} onClick={() => setActiveTab('handbook')}>
                Handbook
              </Tab>
              <Tab active={activeTab === 'acknowledgments'} onClick={() => setActiveTab('acknowledgments')}>
                Acknowledgments
              </Tab>
              <Tab active={activeTab === 'compliance'} onClick={() => setActiveTab('compliance')}>
                Compliance Report
              </Tab>
            </TabsList>
          </Tabs>

          {activeTab === 'handbook' && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border-ink-700 bg-black text-white w-48">
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
                <Button variant="outlineWhite">Add Section</Button>
              </Stack>

              <Grid cols={2} gap={4}>
                {filteredSections.map((section) => (
                  <Card key={section.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Body className="font-display text-white">{section.title}</Body>
                          <Badge variant="outline">{section.category}</Badge>
                        </Stack>
                        <Stack gap={1} className="text-right">
                          <Label className="font-mono text-ink-400">v{section.version}</Label>
                          {section.requiresAck && <Badge className="bg-warning-500 text-black">Requires Ack</Badge>}
                        </Stack>
                      </Stack>
                      <Label className="text-ink-300">{section.description}</Label>
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Label size="xs" className="text-ink-500">
                          Updated: {section.lastUpdated}
                        </Label>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="outline" size="sm" onClick={() => setSelectedSection(section)}>
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          )}

          {activeTab === 'acknowledgments' && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-end">
                <Button variant="outlineWhite" onClick={() => setShowSendReminderModal(true)}>
                  Send Reminders
                </Button>
              </Stack>

              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead className="text-ink-400">Employee</TableHead>
                    <TableHead className="text-ink-400">Department</TableHead>
                    <TableHead className="text-ink-400">Policy</TableHead>
                    <TableHead className="text-ink-400">Due Date</TableHead>
                    <TableHead className="text-ink-400">Acknowledged</TableHead>
                    <TableHead className="text-ink-400">Status</TableHead>
                    <TableHead className="text-ink-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAcknowledgments.map((ack) => (
                    <TableRow key={ack.id} className={ack.status === 'Overdue' ? 'bg-error-900/10' : ''}>
                      <TableCell>
                        <Stack gap={1}>
                          <Label className="text-white">{ack.employeeName}</Label>
                          <Label size="xs" className="text-ink-500">
                            {ack.employeeId}
                          </Label>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ack.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <Label className="text-ink-300">{ack.policyTitle}</Label>
                      </TableCell>
                      <TableCell>
                        <Label className={`font-mono ${ack.status === 'Overdue' ? 'text-error-400' : 'text-white'}`}>{ack.dueDate}</Label>
                      </TableCell>
                      <TableCell>
                        {ack.acknowledgedDate ? <Label className="font-mono text-success-400">{ack.acknowledgedDate}</Label> : <Label className="text-ink-500">-</Label>}
                      </TableCell>
                      <TableCell>
                        <Label className={getStatusColor(ack.status)}>{ack.status}</Label>
                      </TableCell>
                      <TableCell>
                        {ack.status !== 'Acknowledged' && (
                          <Button variant="outline" size="sm">
                            Send Reminder
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}

          {activeTab === 'compliance' && (
            <Stack gap={6}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>Overall Compliance</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Label className="text-ink-400">Acknowledgment Rate</Label>
                      <Label className="font-mono text-white">{complianceRate}%</Label>
                    </Stack>
                    <ProgressBar value={complianceRate} className="h-3" />
                  </Stack>
                  <Grid cols={3} gap={4}>
                    <Card className="p-4 border border-success-800 bg-success-900/20 text-center">
                      <Label className="font-mono text-success-400 text-h5-md">{acknowledgedCount}</Label>
                      <Label size="xs" className="text-ink-400">
                        Acknowledged
                      </Label>
                    </Card>
                    <Card className="p-4 border border-warning-800 bg-warning-900/20 text-center">
                      <Label className="font-mono text-warning-400 text-h5-md">{pendingCount}</Label>
                      <Label size="xs" className="text-ink-400">
                        Pending
                      </Label>
                    </Card>
                    <Card className="p-4 border border-error-800 bg-error-900/20 text-center">
                      <Label className="font-mono text-error-400 text-h5-md">{overdueCount}</Label>
                      <Label size="xs" className="text-ink-400">
                        Overdue
                      </Label>
                    </Card>
                  </Grid>
                </Stack>
              </Card>

              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>By Policy</H3>
                  <Stack gap={2}>
                    {mockSections.filter((s) => s.requiresAck).map((section) => {
                      const acks = mockAcknowledgments.filter((a) => a.policyId === section.id);
                      const ackRate = acks.length > 0 ? Math.round((acks.filter((a) => a.status === 'Acknowledged').length / acks.length) * 100) : 0;
                      return (
                        <Stack key={section.id} gap={1}>
                          <Stack direction="horizontal" className="justify-between">
                            <Label className="text-white">{section.title}</Label>
                            <Label className="font-mono text-ink-300">{ackRate}%</Label>
                          </Stack>
                          <ProgressBar value={ackRate} className="h-2" />
                        </Stack>
                      );
                    })}
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          )}

            <Grid cols={3} gap={4}>
              <Button variant="outline" className="border-grey-700 text-grey-400">
                Export Report
              </Button>
              <Button variant="outline" className="border-grey-700 text-grey-400" onClick={() => router.push('/workforce')}>
                Workforce
              </Button>
              <Button variant="outline" className="border-grey-700 text-grey-400" onClick={() => router.push('/')}>
                Dashboard
              </Button>
            </Grid>

      <Modal open={!!selectedSection} onClose={() => setSelectedSection(null)}>
        <ModalHeader>
          <H3>{selectedSection?.title}</H3>
        </ModalHeader>
        <ModalBody>
          {selectedSection && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedSection.category}</Badge>
                <Label className="font-mono text-ink-400">Version {selectedSection.version}</Label>
                {selectedSection.requiresAck && <Badge className="bg-warning-500 text-black">Requires Acknowledgment</Badge>}
              </Stack>
              <Stack gap={1}>
                <Label className="text-ink-400">Description</Label>
                <Body className="text-ink-300">{selectedSection.description}</Body>
              </Stack>
              <Stack gap={1}>
                <Label size="xs" className="text-ink-500">
                  Last Updated
                </Label>
                <Label className="font-mono text-white">{selectedSection.lastUpdated}</Label>
              </Stack>
              <Card className="p-4 border border-ink-700 bg-ink-800">
                <Stack gap={2}>
                  <Label className="text-ink-400">Policy Content Preview</Label>
                  <Body className="text-ink-300">
                    This section contains the full policy text and guidelines. In a production environment, this would display the complete handbook section content with proper formatting, headings, and any
                    embedded documents or links.
                  </Body>
                </Stack>
              </Card>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSection(null)}>
            Close
          </Button>
          <Button variant="outline">Download PDF</Button>
          <Button variant="solid">Edit Section</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showSendReminderModal} onClose={() => setShowSendReminderModal(false)}>
        <ModalHeader>
          <H3>Send Reminders</H3>
        </ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Body className="text-ink-300">Send acknowledgment reminders to employees with pending or overdue policies.</Body>
            <Stack gap={2}>
              <Label>Target Recipients</Label>
              <Select className="border-ink-700 bg-black text-white">
                <option value="all">All Pending & Overdue</option>
                <option value="overdue">Overdue Only</option>
                <option value="pending">Pending Only</option>
              </Select>
            </Stack>
            <Stack gap={2}>
              <Label>Policy</Label>
              <Select className="border-ink-700 bg-black text-white">
                <option value="all">All Policies</option>
                {mockSections
                  .filter((s) => s.requiresAck)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
              </Select>
            </Stack>
            <Card className="p-4 border border-ink-700 bg-ink-800">
              <Stack gap={1}>
                <Label className="text-ink-400">Recipients</Label>
                <Label className="font-mono text-white">{pendingCount + overdueCount} employees</Label>
              </Stack>
            </Card>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSendReminderModal(false)}>
            Cancel
          </Button>
          <Button variant="solid" onClick={() => setShowSendReminderModal(false)}>
            Send Reminders
          </Button>
        </ModalFooter>
      </Modal>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
