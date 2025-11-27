'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, ProgressBar, Alert,
} from '@ghxstship/ui';

interface VendorAudit {
  id: string;
  vendorId: string;
  vendorName: string;
  category: string;
  auditType: 'Quality' | 'Financial' | 'Compliance' | 'Performance';
  scheduledDate: string;
  completedDate?: string;
  auditor: string;
  score?: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  findings?: string[];
}

const mockAudits: VendorAudit[] = [
  { id: 'AUD-001', vendorId: 'VND-101', vendorName: 'PRG', category: 'Audio Equipment', auditType: 'Quality', scheduledDate: '2024-12-15', auditor: 'John Smith', status: 'Scheduled' },
  { id: 'AUD-002', vendorId: 'VND-102', vendorName: '4Wall Entertainment', category: 'Lighting', auditType: 'Performance', scheduledDate: '2024-11-20', completedDate: '2024-11-20', auditor: 'Sarah Johnson', score: 92, status: 'Completed', findings: ['Excellent delivery times', 'Minor documentation gaps'] },
  { id: 'AUD-003', vendorId: 'VND-103', vendorName: 'Stageline', category: 'Staging', auditType: 'Compliance', scheduledDate: '2024-11-10', auditor: 'Mike Davis', status: 'Overdue' },
  { id: 'AUD-004', vendorId: 'VND-104', vendorName: 'Meyer Sound', category: 'Audio Equipment', auditType: 'Financial', scheduledDate: '2024-11-25', auditor: 'Emily Chen', status: 'In Progress' },
  { id: 'AUD-005', vendorId: 'VND-105', vendorName: 'Robe Lighting', category: 'Lighting', auditType: 'Quality', scheduledDate: '2024-10-15', completedDate: '2024-10-18', auditor: 'Chris Brown', score: 88, status: 'Completed', findings: ['Good product quality', 'Lead time improvements needed'] },
];

export default function VendorAuditsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedAudit, setSelectedAudit] = useState<VendorAudit | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const upcomingAudits = mockAudits.filter(a => a.status === 'Scheduled' || a.status === 'In Progress');
  const overdueCount = mockAudits.filter(a => a.status === 'Overdue').length;
  const completedCount = mockAudits.filter(a => a.status === 'Completed').length;
  const avgScore = mockAudits.filter(a => a.score).reduce((sum, a) => sum + (a.score || 0), 0) / completedCount || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-success-400';
      case 'Scheduled': return 'text-info-400';
      case 'In Progress': return 'text-warning-400';
      case 'Overdue': return 'text-error-400';
      default: return 'text-ink-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-400';
    if (score >= 70) return 'text-warning-400';
    return 'text-error-400';
  };

  const filteredAudits = activeTab === 'upcoming' 
    ? mockAudits.filter(a => a.status !== 'Completed')
    : activeTab === 'completed' 
    ? mockAudits.filter(a => a.status === 'Completed')
    : mockAudits;

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Vendor Audit & Evaluation</H1>
            <Label className="text-ink-400">Schedule and track vendor audits and evaluations</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Upcoming Audits" value={upcomingAudits.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Overdue" value={overdueCount} trend={overdueCount > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Completed (YTD)" value={completedCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg Score" value={`${avgScore.toFixed(0)}%`} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {overdueCount > 0 && (
            <Alert variant="warning">{overdueCount} vendor audit(s) are overdue</Alert>
          )}

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === 'upcoming'} onClick={() => setActiveTab('upcoming')}>Upcoming</Tab>
                <Tab active={activeTab === 'completed'} onClick={() => setActiveTab('completed')}>Completed</Tab>
                <Tab active={activeTab === 'all'} onClick={() => setActiveTab('all')}>All</Tab>
              </TabsList>
            </Tabs>
            <Button variant="outlineWhite" onClick={() => setShowScheduleModal(true)}>Schedule Audit</Button>
          </Stack>

          <Table className="border-2 border-ink-800">
            <TableHeader>
              <TableRow className="bg-ink-900">
                <TableHead className="text-ink-400">Vendor</TableHead>
                <TableHead className="text-ink-400">Category</TableHead>
                <TableHead className="text-ink-400">Audit Type</TableHead>
                <TableHead className="text-ink-400">Scheduled</TableHead>
                <TableHead className="text-ink-400">Auditor</TableHead>
                <TableHead className="text-ink-400">Score</TableHead>
                <TableHead className="text-ink-400">Status</TableHead>
                <TableHead className="text-ink-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudits.map((audit) => (
                <TableRow key={audit.id} className={audit.status === 'Overdue' ? 'bg-error-900/10' : ''}>
                  <TableCell><Label className="text-white">{audit.vendorName}</Label></TableCell>
                  <TableCell><Badge variant="outline">{audit.category}</Badge></TableCell>
                  <TableCell><Label className="text-ink-300">{audit.auditType}</Label></TableCell>
                  <TableCell><Label className="font-mono text-white">{audit.scheduledDate}</Label></TableCell>
                  <TableCell><Label className="text-ink-300">{audit.auditor}</Label></TableCell>
                  <TableCell>
                    {audit.score ? (
                      <Label className={`font-mono ${getScoreColor(audit.score)}`}>{audit.score}%</Label>
                    ) : (
                      <Label className="text-ink-500">-</Label>
                    )}
                  </TableCell>
                  <TableCell><Label className={getStatusColor(audit.status)}>{audit.status}</Label></TableCell>
                  <TableCell>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedAudit(audit)}>Details</Button>
                      {audit.status === 'Scheduled' && <Button variant="solid" size="sm">Start</Button>}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/procurement')}>Back to Procurement</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedAudit} onClose={() => setSelectedAudit(null)}>
        <ModalHeader><H3>Audit Details</H3></ModalHeader>
        <ModalBody>
          {selectedAudit && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label className="text-ink-400">Vendor</Label>
                <Body className="text-white text-body-md">{selectedAudit.vendorName}</Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedAudit.category}</Badge>
                <Badge variant="outline">{selectedAudit.auditType}</Badge>
                <Label className={getStatusColor(selectedAudit.status)}>{selectedAudit.status}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Scheduled Date</Label><Label className="font-mono text-white">{selectedAudit.scheduledDate}</Label></Stack>
                {selectedAudit.completedDate && <Stack gap={1}><Label className="text-ink-400">Completed Date</Label><Label className="font-mono text-white">{selectedAudit.completedDate}</Label></Stack>}
              </Grid>
              <Stack gap={1}><Label className="text-ink-400">Auditor</Label><Label className="text-white">{selectedAudit.auditor}</Label></Stack>
              {selectedAudit.score && (
                <Stack gap={2}>
                  <Stack direction="horizontal" className="justify-between">
                    <Label className="text-ink-400">Score</Label>
                    <Label className={`font-mono ${getScoreColor(selectedAudit.score)}`}>{selectedAudit.score}%</Label>
                  </Stack>
                  <ProgressBar value={selectedAudit.score} className="h-2" />
                </Stack>
              )}
              {selectedAudit.findings && (
                <Stack gap={2}>
                  <Label className="text-ink-400">Findings</Label>
                  {selectedAudit.findings.map((finding, idx) => (
                    <Label key={idx} className="text-ink-300">• {finding}</Label>
                  ))}
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedAudit(null)}>Close</Button>
          {selectedAudit?.status === 'Completed' && <Button variant="outline">Download Report</Button>}
          <Button variant="solid">Edit Audit</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showScheduleModal} onClose={() => setShowScheduleModal(false)}>
        <ModalHeader><H3>Schedule Vendor Audit</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Select Vendor...</option>
              <option value="VND-101">PRG</option>
              <option value="VND-102">4Wall Entertainment</option>
              <option value="VND-103">Stageline</option>
              <option value="VND-104">Meyer Sound</option>
            </Select>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Audit Type...</option>
              <option value="Quality">Quality</option>
              <option value="Financial">Financial</option>
              <option value="Compliance">Compliance</option>
              <option value="Performance">Performance</option>
            </Select>
            <Stack gap={2}>
              <Label>Scheduled Date</Label>
              <Input type="date" className="border-ink-700 bg-black text-white" />
            </Stack>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Assign Auditor...</option>
              <option value="John Smith">John Smith</option>
              <option value="Sarah Johnson">Sarah Johnson</option>
              <option value="Mike Davis">Mike Davis</option>
            </Select>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowScheduleModal(false)}>Schedule</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
