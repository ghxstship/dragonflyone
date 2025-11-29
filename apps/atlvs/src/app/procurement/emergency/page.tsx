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
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Card,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  Textarea,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';

interface EmergencyProcurement {
  id: string;
  requestor: string;
  department: string;
  description: string;
  amount: number;
  urgency: 'Critical' | 'High' | 'Medium';
  reason: string;
  vendor?: string;
  requestDate: string;
  approvedDate?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  approver?: string;
}

const mockEmergencies: EmergencyProcurement[] = [
  { id: 'EMG-001', requestor: 'John Smith', department: 'Production', description: 'Replacement audio console - DiGiCo SD12', amount: 45000, urgency: 'Critical', reason: 'Main console failed during load-in', vendor: 'PRG', requestDate: '2024-11-24', approvedDate: '2024-11-24', status: 'Completed', approver: 'Sarah Johnson' },
  { id: 'EMG-002', requestor: 'Mike Davis', department: 'Lighting', description: 'Emergency lighting fixtures (12x Robe MegaPointe)', amount: 28000, urgency: 'High', reason: 'Client added last-minute production elements', requestDate: '2024-11-25', status: 'Pending' },
  { id: 'EMG-003', requestor: 'Emily Chen', department: 'Video', description: 'LED wall panels replacement (20 panels)', amount: 15000, urgency: 'Critical', reason: 'Damaged panels discovered during setup', vendor: 'ROE Visual', requestDate: '2024-11-25', approvedDate: '2024-11-25', status: 'Approved', approver: 'Robert Chen' },
];

export default function EmergencyProcurementPage() {
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<EmergencyProcurement | null>(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredRequests = statusFilter === 'All' ? mockEmergencies : mockEmergencies.filter(e => e.status === statusFilter);
  const pendingCount = mockEmergencies.filter(e => e.status === 'Pending').length;
  const totalAmount = mockEmergencies.reduce((sum, e) => sum + e.amount, 0);
  const criticalCount = mockEmergencies.filter(e => e.urgency === 'Critical' && e.status === 'Pending').length;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'text-error-400';
      case 'High': return 'text-warning-400';
      case 'Medium': return 'text-warning-400';
      default: return 'text-ink-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-success-400';
      case 'Approved': return 'text-info-400';
      case 'Pending': return 'text-warning-400';
      case 'Rejected': return 'text-error-400';
      default: return 'text-ink-400';
    }
  };

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="Emergency Procurement"
        subtitle="Fast-track procurement for urgent operational needs"
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Procurement', href: '/procurement' }, { label: 'Emergency' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

          <Grid cols={4} gap={6}>
            <StatCard label="Pending Requests" value={pendingCount} trend={pendingCount > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Critical Pending" value={criticalCount} trend={criticalCount > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Amount" value={`$${(totalAmount / 1000).toFixed(0)}K`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg Response" value="2.5 hrs" className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {criticalCount > 0 && (
            <Alert variant="error">{criticalCount} critical request(s) require immediate attention</Alert>
          )}

          <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
            <Stack gap={4}>
              <H3>Emergency Procurement Guidelines</H3>
              <Grid cols={3} gap={4}>
                <Card className="p-4 border border-error-800 bg-error-900/20">
                  <Stack gap={2}>
                    <Label className="text-error-400 font-bold">CRITICAL</Label>
                    <Label className="text-ink-300">Show-stopping issue</Label>
                    <Label className="text-ink-400">Approval: VP or above</Label>
                    <Label className="text-ink-400">Target: 1 hour</Label>
                  </Stack>
                </Card>
                <Card className="p-4 border border-warning-800 bg-warning-900/20">
                  <Stack gap={2}>
                    <Label className="text-warning-400 font-bold">HIGH</Label>
                    <Label className="text-ink-300">Significant impact</Label>
                    <Label className="text-ink-400">Approval: Director</Label>
                    <Label className="text-ink-400">Target: 4 hours</Label>
                  </Stack>
                </Card>
                <Card className="p-4 border border-warning-800 bg-warning-900/20">
                  <Stack gap={2}>
                    <Label className="text-warning-400 font-bold">MEDIUM</Label>
                    <Label className="text-ink-300">Operational need</Label>
                    <Label className="text-ink-400">Approval: Manager</Label>
                    <Label className="text-ink-400">Target: 24 hours</Label>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </Card>

          <Stack direction="horizontal" className="justify-between">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border-ink-700 bg-black text-white w-48">
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
            </Select>
            <Button variant="outlineWhite" onClick={() => setShowNewRequestModal(true)}>New Emergency Request</Button>
          </Stack>

          <Table className="border-2 border-ink-800">
            <TableHeader>
              <TableRow className="bg-ink-900">
                <TableHead className="text-ink-400">Request</TableHead>
                <TableHead className="text-ink-400">Requestor</TableHead>
                <TableHead className="text-ink-400">Amount</TableHead>
                <TableHead className="text-ink-400">Urgency</TableHead>
                <TableHead className="text-ink-400">Date</TableHead>
                <TableHead className="text-ink-400">Status</TableHead>
                <TableHead className="text-ink-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((req) => (
                <TableRow key={req.id} className={req.urgency === 'Critical' && req.status === 'Pending' ? 'bg-error-900/10' : ''}>
                  <TableCell>
                    <Stack gap={0}>
                      <Label className="text-white">{req.description}</Label>
                      <Label size="xs" className="text-ink-500">{req.id}</Label>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack gap={0}>
                      <Label className="text-white">{req.requestor}</Label>
                      <Label size="xs" className="text-ink-500">{req.department}</Label>
                    </Stack>
                  </TableCell>
                  <TableCell><Label className="font-mono text-white">${req.amount.toLocaleString()}</Label></TableCell>
                  <TableCell><Label className={getUrgencyColor(req.urgency)}>{req.urgency}</Label></TableCell>
                  <TableCell><Label className="font-mono text-ink-300">{req.requestDate}</Label></TableCell>
                  <TableCell><Label className={getStatusColor(req.status)}>{req.status}</Label></TableCell>
                  <TableCell>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(req)}>Details</Button>
                      {req.status === 'Pending' && <Button variant="solid" size="sm">Approve</Button>}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

            <Button variant="outline" className="border-grey-700 text-grey-400" onClick={() => router.push('/procurement')}>Back to Procurement</Button>

      <Modal open={!!selectedRequest} onClose={() => setSelectedRequest(null)}>
        <ModalHeader><H3>Emergency Request Details</H3></ModalHeader>
        <ModalBody>
          {selectedRequest && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label className="text-ink-400">Description</Label>
                <Body className="text-white">{selectedRequest.description}</Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Label className={getUrgencyColor(selectedRequest.urgency)}>{selectedRequest.urgency}</Label>
                <Label className={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Requestor</Label><Label className="text-white">{selectedRequest.requestor}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Department</Label><Label className="text-white">{selectedRequest.department}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-400">Amount</Label><Label className="font-mono text-white text-h6-md">${selectedRequest.amount.toLocaleString()}</Label></Stack>
              <Stack gap={1}><Label className="text-ink-400">Reason</Label><Body className="text-ink-300">{selectedRequest.reason}</Body></Stack>
              {selectedRequest.vendor && <Stack gap={1}><Label className="text-ink-400">Vendor</Label><Label className="text-white">{selectedRequest.vendor}</Label></Stack>}
              {selectedRequest.approver && <Stack gap={1}><Label className="text-ink-400">Approved By</Label><Label className="text-white">{selectedRequest.approver}</Label></Stack>}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
          {selectedRequest?.status === 'Pending' && (
            <>
              <Button variant="outline">Reject</Button>
              <Button variant="solid">Approve</Button>
            </>
          )}
        </ModalFooter>
      </Modal>

      <Modal open={showNewRequestModal} onClose={() => setShowNewRequestModal(false)}>
        <ModalHeader><H3>New Emergency Request</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Description" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Department...</option>
                <option value="Production">Production</option>
                <option value="Audio">Audio</option>
                <option value="Lighting">Lighting</option>
                <option value="Video">Video</option>
              </Select>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Urgency...</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </Select>
            </Grid>
            <Input type="number" placeholder="Amount ($)" className="border-ink-700 bg-black text-white" />
            <Textarea placeholder="Reason for emergency procurement..." className="border-ink-700 bg-black text-white" rows={3} />
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Preferred Vendor (optional)...</option>
              <option value="PRG">PRG</option>
              <option value="4Wall">4Wall Entertainment</option>
              <option value="Meyer">Meyer Sound</option>
            </Select>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowNewRequestModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowNewRequestModal(false)}>Submit Request</Button>
        </ModalFooter>
      </Modal>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
