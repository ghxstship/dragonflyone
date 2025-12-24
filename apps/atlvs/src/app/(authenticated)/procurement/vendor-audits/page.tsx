'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalTabState } from '@ghxstship/config/hooks';
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
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Tabs,
  TabsList,
  Tab,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ProgressBar,
  Alert,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';
import { useVendorAudits, type VendorAudit } from '@ghxstship/config';
import { DEMO_VENDOR_AUDITS } from '../../../../lib/demo-data';

export default function VendorAuditsPage() {
  const router = useRouter();
  const { audits: apiAudits, summary, isLoading } = useVendorAudits();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useLocalTabState({
    storageKey: 'vendor-audits-tab',
    defaultTab: 'upcoming',
  });
  const [selectedAudit, setSelectedAudit] = useState<VendorAudit | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Use API data or fall back to demo data
  const audits: VendorAudit[] = apiAudits.length > 0 ? apiAudits : (DEMO_VENDOR_AUDITS as unknown as VendorAudit[]);

  const upcomingAudits = audits.filter(a => a.status === 'Scheduled' || a.status === 'In Progress');
  const overdueCount = summary?.overdueCount || audits.filter(a => a.status === 'Overdue').length;
  const completedCount = summary?.completedCount || audits.filter(a => a.status === 'Completed').length;
  const avgScore = summary?.avgScore || (completedCount > 0 ? audits.filter(a => a.score).reduce((sum, a) => sum + (a.score || 0), 0) / completedCount : 0);

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
    ? audits.filter(a => a.status !== 'Completed')
    : activeTab === 'completed' 
    ? audits.filter(a => a.status === 'Completed')
    : audits;

  return (
    <>
      <EnterprisePageHeader
        title="Vendor Audit & Evaluation"
        subtitle="Schedule and track vendor audits and evaluations"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading vendor audits...</div>
            </div>
          )}

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
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
                <Tab active={isActive('upcoming')} onClick={() => setActiveTab('upcoming')}>Upcoming</Tab>
                <Tab active={isActive('completed')} onClick={() => setActiveTab('completed')}>Completed</Tab>
                <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
              </TabsList>
            </Tabs>
            <Button variant="outlineWhite" onClick={() => setShowScheduleModal(true)}>Schedule Audit</Button>
          </Stack>

          <Table variant="dark" className="border-2 border-ink-800">
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

            <Button variant="outline" className="border-grey-700 text-grey-400" onClick={() => router.push('/procurement')}>Back to Procurement</Button>

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
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
