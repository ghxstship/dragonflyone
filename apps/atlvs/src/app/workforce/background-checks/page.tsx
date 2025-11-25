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
  ProgressBar,
} from '@ghxstship/ui';

interface BackgroundCheck {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  checkType: string;
  provider: string;
  requestDate: string;
  completedDate?: string;
  expiryDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed' | 'Expired' | 'Renewal Due';
  result?: 'Clear' | 'Review Required' | 'Failed';
  notes?: string;
}

const mockBackgroundChecks: BackgroundCheck[] = [
  { id: 'BGC-001', employeeId: 'EMP-101', employeeName: 'John Smith', department: 'Production', checkType: 'Criminal + Employment', provider: 'Checkr', requestDate: '2024-11-01', completedDate: '2024-11-05', expiryDate: '2025-11-05', status: 'Completed', result: 'Clear' },
  { id: 'BGC-002', employeeId: 'EMP-102', employeeName: 'Sarah Johnson', department: 'Finance', checkType: 'Criminal + Credit + Employment', provider: 'Sterling', requestDate: '2024-11-10', status: 'In Progress' },
  { id: 'BGC-003', employeeId: 'EMP-103', employeeName: 'Mike Williams', department: 'Operations', checkType: 'Criminal', provider: 'Checkr', requestDate: '2024-10-15', completedDate: '2024-10-18', expiryDate: '2024-12-18', status: 'Renewal Due', result: 'Clear' },
  { id: 'BGC-004', employeeId: 'EMP-104', employeeName: 'Emily Davis', department: 'Audio', checkType: 'Criminal + Employment', provider: 'GoodHire', requestDate: '2024-11-15', status: 'Pending' },
  { id: 'BGC-005', employeeId: 'EMP-105', employeeName: 'Chris Brown', department: 'Lighting', checkType: 'Criminal + Drug Screen', provider: 'Checkr', requestDate: '2024-09-01', completedDate: '2024-09-05', expiryDate: '2024-09-05', status: 'Expired', result: 'Clear' },
  { id: 'BGC-006', employeeId: 'EMP-106', employeeName: 'Amy Chen', department: 'Video', checkType: 'Criminal + Employment', provider: 'Sterling', requestDate: '2024-08-20', completedDate: '2024-08-25', status: 'Completed', result: 'Review Required', notes: 'Minor traffic violation - cleared by HR' },
];

const checkTypes = ['All', 'Criminal', 'Criminal + Employment', 'Criminal + Credit + Employment', 'Criminal + Drug Screen'];

export default function BackgroundChecksPage() {
  const router = useRouter();
  const [checks, setChecks] = useState<BackgroundCheck[]>(mockBackgroundChecks);
  const [selectedCheck, setSelectedCheck] = useState<BackgroundCheck | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChecks = checks.filter((c) => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch =
      c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = checks.filter((c) => c.status === 'Pending' || c.status === 'In Progress').length;
  const renewalDueCount = checks.filter((c) => c.status === 'Renewal Due').length;
  const expiredCount = checks.filter((c) => c.status === 'Expired').length;
  const completedCount = checks.filter((c) => c.status === 'Completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-400';
      case 'Pending':
        return 'text-ink-400';
      case 'In Progress':
        return 'text-blue-400';
      case 'Failed':
        return 'text-red-400';
      case 'Expired':
        return 'text-red-400';
      case 'Renewal Due':
        return 'text-yellow-400';
      default:
        return 'text-ink-400';
    }
  };

  const getResultColor = (result?: string) => {
    switch (result) {
      case 'Clear':
        return 'text-green-400';
      case 'Review Required':
        return 'text-yellow-400';
      case 'Failed':
        return 'text-red-400';
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
            <H1>Background Check Management</H1>
            <Label className="text-ink-400">Track background check status and renewal alerts</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Completed" value={completedCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pending/In Progress" value={pendingCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Renewal Due" value={renewalDueCount} trend={renewalDueCount > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Expired" value={expiredCount} trend={expiredCount > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {(renewalDueCount > 0 || expiredCount > 0) && (
            <Alert variant="warning">
              {renewalDueCount > 0 && `${renewalDueCount} background check(s) due for renewal. `}
              {expiredCount > 0 && `${expiredCount} background check(s) have expired.`}
            </Alert>
          )}

          <Grid cols={4} gap={4}>
            <Input
              type="search"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-ink-700 bg-black text-white"
            />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border-ink-700 bg-black text-white">
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Renewal Due">Renewal Due</option>
              <option value="Expired">Expired</option>
            </Select>
            <Button variant="outline" className="border-ink-700 text-ink-400">
              Export Report
            </Button>
            <Button variant="outlineWhite" onClick={() => setShowRequestModal(true)}>
              Request Check
            </Button>
          </Grid>

          <Table className="border-2 border-ink-800">
            <TableHeader>
              <TableRow className="bg-ink-900">
                <TableHead className="text-ink-400">Employee</TableHead>
                <TableHead className="text-ink-400">Department</TableHead>
                <TableHead className="text-ink-400">Check Type</TableHead>
                <TableHead className="text-ink-400">Provider</TableHead>
                <TableHead className="text-ink-400">Request Date</TableHead>
                <TableHead className="text-ink-400">Expiry</TableHead>
                <TableHead className="text-ink-400">Status</TableHead>
                <TableHead className="text-ink-400">Result</TableHead>
                <TableHead className="text-ink-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChecks.map((check) => (
                <TableRow key={check.id} className={check.status === 'Expired' || check.status === 'Renewal Due' ? 'bg-yellow-900/10' : ''}>
                  <TableCell>
                    <Stack gap={1}>
                      <Label className="text-white">{check.employeeName}</Label>
                      <Label size="xs" className="text-ink-500">
                        {check.employeeId}
                      </Label>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{check.department}</Badge>
                  </TableCell>
                  <TableCell>
                    <Label className="text-ink-300">{check.checkType}</Label>
                  </TableCell>
                  <TableCell>
                    <Label className="text-ink-300">{check.provider}</Label>
                  </TableCell>
                  <TableCell>
                    <Label className="font-mono text-white">{check.requestDate}</Label>
                  </TableCell>
                  <TableCell>
                    {check.expiryDate ? (
                      <Label className={`font-mono ${check.status === 'Expired' || check.status === 'Renewal Due' ? 'text-yellow-400' : 'text-ink-300'}`}>
                        {check.expiryDate}
                      </Label>
                    ) : (
                      <Label className="text-ink-500">-</Label>
                    )}
                  </TableCell>
                  <TableCell>
                    <Label className={getStatusColor(check.status)}>{check.status}</Label>
                  </TableCell>
                  <TableCell>
                    {check.result ? (
                      <Label className={getResultColor(check.result)}>{check.result}</Label>
                    ) : (
                      <Label className="text-ink-500">-</Label>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCheck(check)}>
                        Details
                      </Button>
                      {(check.status === 'Expired' || check.status === 'Renewal Due') && (
                        <Button variant="solid" size="sm">
                          Renew
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/employees')}>
              Employee Directory
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

      <Modal open={!!selectedCheck} onClose={() => setSelectedCheck(null)}>
        <ModalHeader>
          <H3>Background Check Details</H3>
        </ModalHeader>
        <ModalBody>
          {selectedCheck && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label className="text-ink-400">Employee</Label>
                <Label className="text-white text-lg">{selectedCheck.employeeName}</Label>
                <Label className="text-ink-500">{selectedCheck.employeeId}</Label>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedCheck.department}</Badge>
                <Label className={getStatusColor(selectedCheck.status)}>{selectedCheck.status}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Check Type
                  </Label>
                  <Label className="text-white">{selectedCheck.checkType}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Provider
                  </Label>
                  <Label className="text-white">{selectedCheck.provider}</Label>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Request Date
                  </Label>
                  <Label className="font-mono text-white">{selectedCheck.requestDate}</Label>
                </Stack>
                {selectedCheck.completedDate && (
                  <Stack gap={1}>
                    <Label size="xs" className="text-ink-500">
                      Completed Date
                    </Label>
                    <Label className="font-mono text-white">{selectedCheck.completedDate}</Label>
                  </Stack>
                )}
              </Grid>
              {selectedCheck.expiryDate && (
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Expiry Date
                  </Label>
                  <Label className={`font-mono ${selectedCheck.status === 'Expired' ? 'text-red-400' : 'text-white'}`}>{selectedCheck.expiryDate}</Label>
                </Stack>
              )}
              {selectedCheck.result && (
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Result
                  </Label>
                  <Label className={getResultColor(selectedCheck.result)}>{selectedCheck.result}</Label>
                </Stack>
              )}
              {selectedCheck.notes && (
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Notes
                  </Label>
                  <Body className="text-ink-300">{selectedCheck.notes}</Body>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCheck(null)}>
            Close
          </Button>
          {selectedCheck?.status === 'Completed' && <Button variant="outline">View Report</Button>}
          {(selectedCheck?.status === 'Expired' || selectedCheck?.status === 'Renewal Due') && <Button variant="solid">Request Renewal</Button>}
        </ModalFooter>
      </Modal>

      <Modal open={showRequestModal} onClose={() => setShowRequestModal(false)}>
        <ModalHeader>
          <H3>Request Background Check</H3>
        </ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Select Employee...</option>
              <option value="EMP-107">New Hire - Position Pending</option>
              <option value="EMP-108">Jane Doe - Contractor</option>
            </Select>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Check Type...</option>
              <option value="criminal">Criminal Only</option>
              <option value="criminal-employment">Criminal + Employment</option>
              <option value="criminal-credit">Criminal + Credit + Employment</option>
              <option value="criminal-drug">Criminal + Drug Screen</option>
              <option value="comprehensive">Comprehensive (All)</option>
            </Select>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Provider...</option>
              <option value="checkr">Checkr</option>
              <option value="sterling">Sterling</option>
              <option value="goodhire">GoodHire</option>
            </Select>
            <Stack gap={2}>
              <Label>Priority</Label>
              <Select className="border-ink-700 bg-black text-white">
                <option value="standard">Standard (3-5 days)</option>
                <option value="expedited">Expedited (1-2 days)</option>
                <option value="rush">Rush (24 hours)</option>
              </Select>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowRequestModal(false)}>
            Cancel
          </Button>
          <Button variant="solid" onClick={() => setShowRequestModal(false)}>
            Submit Request
          </Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
