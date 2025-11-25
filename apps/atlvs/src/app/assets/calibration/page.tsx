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
  ProgressBar,
} from '@ghxstship/ui';

interface CalibrationRecord {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  calibrationType: string;
  lastCalibration: string;
  nextDue: string;
  frequency: string;
  status: 'Current' | 'Due Soon' | 'Overdue' | 'Scheduled';
  certifiedBy?: string;
  certificateNumber?: string;
  notes?: string;
}

interface CertificationRecord {
  id: string;
  assetId: string;
  assetName: string;
  certType: string;
  issuedDate: string;
  expiryDate: string;
  issuingBody: string;
  certificateNumber: string;
  status: 'Valid' | 'Expiring' | 'Expired' | 'Pending Renewal';
}

const mockCalibrations: CalibrationRecord[] = [
  { id: 'CAL-001', assetId: 'AST-010', assetName: 'Fluke 87V Multimeter', category: 'Test Equipment', calibrationType: 'Electrical Calibration', lastCalibration: '2024-06-15', nextDue: '2025-06-15', frequency: 'Annual', status: 'Current', certifiedBy: 'Cal Labs Inc', certificateNumber: 'CL-2024-4521' },
  { id: 'CAL-002', assetId: 'AST-011', assetName: 'NTI Audio XL2', category: 'Audio Measurement', calibrationType: 'Acoustic Calibration', lastCalibration: '2024-03-20', nextDue: '2024-12-20', frequency: '9 Months', status: 'Due Soon', certifiedBy: 'NTI Americas', certificateNumber: 'NTI-2024-8892' },
  { id: 'CAL-003', assetId: 'AST-012', assetName: 'CM Lodestar Load Cell', category: 'Rigging', calibrationType: 'Load Certification', lastCalibration: '2024-01-10', nextDue: '2024-07-10', frequency: '6 Months', status: 'Overdue', certifiedBy: 'Rigging Safety Inc', certificateNumber: 'RS-2024-1123' },
  { id: 'CAL-004', assetId: 'AST-013', assetName: 'Minolta CL-200A', category: 'Lighting Measurement', calibrationType: 'Photometric Calibration', lastCalibration: '2024-08-01', nextDue: '2025-08-01', frequency: 'Annual', status: 'Current', certifiedBy: 'Konica Minolta', certificateNumber: 'KM-2024-5567' },
  { id: 'CAL-005', assetId: 'AST-014', assetName: 'Laser Distance Meter', category: 'Survey Equipment', calibrationType: 'Distance Calibration', lastCalibration: '2024-09-15', nextDue: '2024-12-15', frequency: 'Quarterly', status: 'Scheduled', certifiedBy: 'Precision Labs', certificateNumber: 'PL-2024-9901', notes: 'Scheduled for Dec 10' },
];

const mockCertifications: CertificationRecord[] = [
  { id: 'CERT-001', assetId: 'AST-020', assetName: 'CM Lodestar 1T #1-10', certType: 'Annual Inspection', issuedDate: '2024-06-01', expiryDate: '2025-06-01', issuingBody: 'OSHA Certified Inspector', certificateNumber: 'OSHA-2024-RI-4521', status: 'Valid' },
  { id: 'CERT-002', assetId: 'AST-021', assetName: 'Truss System A', certType: 'Structural Certification', issuedDate: '2024-03-15', expiryDate: '2025-03-15', issuingBody: 'Structural Engineers LLC', certificateNumber: 'SE-2024-TR-8892', status: 'Valid' },
  { id: 'CERT-003', assetId: 'AST-022', assetName: 'Generator 100kW', certType: 'Electrical Safety', issuedDate: '2024-01-20', expiryDate: '2024-11-20', issuingBody: 'Electrical Safety Authority', certificateNumber: 'ESA-2024-GN-1123', status: 'Expired' },
  { id: 'CERT-004', assetId: 'AST-023', assetName: 'Scissor Lift #1', certType: 'ANSI Compliance', issuedDate: '2024-07-01', expiryDate: '2024-12-31', issuingBody: 'Equipment Safety Corp', certificateNumber: 'ESC-2024-SL-5567', status: 'Expiring' },
  { id: 'CERT-005', assetId: 'AST-024', assetName: 'Fire Extinguishers (Lot)', certType: 'Fire Safety', issuedDate: '2024-04-15', expiryDate: '2025-04-15', issuingBody: 'Fire Safety Services', certificateNumber: 'FSS-2024-FE-9901', status: 'Valid' },
];

export default function CalibrationCertificationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('calibration');
  const [selectedCalibration, setSelectedCalibration] = useState<CalibrationRecord | null>(null);
  const [selectedCertification, setSelectedCertification] = useState<CertificationRecord | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const overdueCalibrations = mockCalibrations.filter((c) => c.status === 'Overdue').length;
  const dueSoonCalibrations = mockCalibrations.filter((c) => c.status === 'Due Soon').length;
  const expiredCerts = mockCertifications.filter((c) => c.status === 'Expired').length;
  const expiringCerts = mockCertifications.filter((c) => c.status === 'Expiring').length;

  const getCalStatusColor = (status: string) => {
    switch (status) {
      case 'Current':
        return 'text-green-400';
      case 'Due Soon':
        return 'text-yellow-400';
      case 'Overdue':
        return 'text-red-400';
      case 'Scheduled':
        return 'text-blue-400';
      default:
        return 'text-ink-400';
    }
  };

  const getCertStatusColor = (status: string) => {
    switch (status) {
      case 'Valid':
        return 'text-green-400';
      case 'Expiring':
        return 'text-yellow-400';
      case 'Expired':
        return 'text-red-400';
      case 'Pending Renewal':
        return 'text-blue-400';
      default:
        return 'text-ink-400';
    }
  };

  const filteredCalibrations =
    statusFilter === 'All' ? mockCalibrations : mockCalibrations.filter((c) => c.status === statusFilter);

  const filteredCertifications =
    statusFilter === 'All' ? mockCertifications : mockCertifications.filter((c) => c.status === statusFilter);

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Calibration & Certification Schedules</H1>
            <Label className="text-ink-400">Track calibration and certification requirements for all assets</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Calibrations Due" value={dueSoonCalibrations} trend={dueSoonCalibrations > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Calibrations Overdue" value={overdueCalibrations} trend={overdueCalibrations > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Certs Expiring" value={expiringCerts} trend={expiringCerts > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Certs Expired" value={expiredCerts} trend={expiredCerts > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {(overdueCalibrations > 0 || expiredCerts > 0) && (
            <Alert variant="error">
              {overdueCalibrations > 0 && `${overdueCalibrations} calibration(s) overdue. `}
              {expiredCerts > 0 && `${expiredCerts} certification(s) expired.`}
            </Alert>
          )}

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === 'calibration'} onClick={() => setActiveTab('calibration')}>
                  Calibrations
                </Tab>
                <Tab active={activeTab === 'certification'} onClick={() => setActiveTab('certification')}>
                  Certifications
                </Tab>
                <Tab active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')}>
                  Upcoming
                </Tab>
              </TabsList>
            </Tabs>
            <Stack direction="horizontal" gap={2}>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border-ink-700 bg-black text-white w-40">
                <option value="All">All Statuses</option>
                <option value="Current">Current</option>
                <option value="Valid">Valid</option>
                <option value="Due Soon">Due Soon</option>
                <option value="Expiring">Expiring</option>
                <option value="Overdue">Overdue</option>
                <option value="Expired">Expired</option>
              </Select>
              <Button variant="outlineWhite" onClick={() => setShowScheduleModal(true)}>
                Schedule Calibration
              </Button>
            </Stack>
          </Stack>

          {activeTab === 'calibration' && (
            <Table className="border-2 border-ink-800">
              <TableHeader>
                <TableRow className="bg-ink-900">
                  <TableHead className="text-ink-400">Asset</TableHead>
                  <TableHead className="text-ink-400">Type</TableHead>
                  <TableHead className="text-ink-400">Last Calibration</TableHead>
                  <TableHead className="text-ink-400">Next Due</TableHead>
                  <TableHead className="text-ink-400">Frequency</TableHead>
                  <TableHead className="text-ink-400">Status</TableHead>
                  <TableHead className="text-ink-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalibrations.map((cal) => (
                  <TableRow key={cal.id} className={cal.status === 'Overdue' ? 'bg-red-900/10' : ''}>
                    <TableCell>
                      <Stack gap={1}>
                        <Label className="text-white">{cal.assetName}</Label>
                        <Badge variant="outline">{cal.category}</Badge>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Label className="text-ink-300">{cal.calibrationType}</Label>
                    </TableCell>
                    <TableCell>
                      <Label className="font-mono text-white">{cal.lastCalibration}</Label>
                    </TableCell>
                    <TableCell>
                      <Label className={`font-mono ${cal.status === 'Overdue' ? 'text-red-400' : 'text-white'}`}>{cal.nextDue}</Label>
                    </TableCell>
                    <TableCell>
                      <Label className="text-ink-300">{cal.frequency}</Label>
                    </TableCell>
                    <TableCell>
                      <Label className={getCalStatusColor(cal.status)}>{cal.status}</Label>
                    </TableCell>
                    <TableCell>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCalibration(cal)}>
                          Details
                        </Button>
                        {cal.status === 'Overdue' && (
                          <Button variant="solid" size="sm">
                            Schedule
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeTab === 'certification' && (
            <Table className="border-2 border-ink-800">
              <TableHeader>
                <TableRow className="bg-ink-900">
                  <TableHead className="text-ink-400">Asset</TableHead>
                  <TableHead className="text-ink-400">Certification Type</TableHead>
                  <TableHead className="text-ink-400">Issuing Body</TableHead>
                  <TableHead className="text-ink-400">Issued</TableHead>
                  <TableHead className="text-ink-400">Expiry</TableHead>
                  <TableHead className="text-ink-400">Status</TableHead>
                  <TableHead className="text-ink-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertifications.map((cert) => (
                  <TableRow key={cert.id} className={cert.status === 'Expired' ? 'bg-red-900/10' : ''}>
                    <TableCell>
                      <Label className="text-white">{cert.assetName}</Label>
                    </TableCell>
                    <TableCell>
                      <Label className="text-ink-300">{cert.certType}</Label>
                    </TableCell>
                    <TableCell>
                      <Label className="text-ink-300">{cert.issuingBody}</Label>
                    </TableCell>
                    <TableCell>
                      <Label className="font-mono text-white">{cert.issuedDate}</Label>
                    </TableCell>
                    <TableCell>
                      <Label className={`font-mono ${cert.status === 'Expired' ? 'text-red-400' : 'text-white'}`}>{cert.expiryDate}</Label>
                    </TableCell>
                    <TableCell>
                      <Label className={getCertStatusColor(cert.status)}>{cert.status}</Label>
                    </TableCell>
                    <TableCell>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCertification(cert)}>
                          Details
                        </Button>
                        {(cert.status === 'Expired' || cert.status === 'Expiring') && (
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
          )}

          {activeTab === 'schedule' && (
            <Stack gap={4}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>Upcoming 30 Days</H3>
                  <Stack gap={2}>
                    {[...mockCalibrations.filter((c) => c.status === 'Due Soon' || c.status === 'Scheduled'), ...mockCertifications.filter((c) => c.status === 'Expiring')].map((item, idx) => (
                      <Card key={idx} className="p-4 bg-ink-800 border border-ink-700">
                        <Stack direction="horizontal" className="justify-between items-center">
                          <Stack gap={1}>
                            <Label className="text-white">{'assetName' in item ? item.assetName : ''}</Label>
                            <Label size="xs" className="text-ink-400">
                              {'calibrationType' in item ? item.calibrationType : 'certType' in item ? item.certType : ''}
                            </Label>
                          </Stack>
                          <Stack gap={1} className="text-right">
                            <Label className="font-mono text-yellow-400">{'nextDue' in item ? item.nextDue : 'expiryDate' in item ? item.expiryDate : ''}</Label>
                            <Badge variant="outline">{'calibrationType' in item ? 'Calibration' : 'Certification'}</Badge>
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          )}

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">
              Export Report
            </Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/assets')}>
              Asset Registry
            </Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/')}>
              Dashboard
            </Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedCalibration} onClose={() => setSelectedCalibration(null)}>
        <ModalHeader>
          <H3>Calibration Details</H3>
        </ModalHeader>
        <ModalBody>
          {selectedCalibration && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label className="text-ink-400">Asset</Label>
                <Label className="text-white text-lg">{selectedCalibration.assetName}</Label>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedCalibration.category}</Badge>
                <Label className={getCalStatusColor(selectedCalibration.status)}>{selectedCalibration.status}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Calibration Type
                  </Label>
                  <Label className="text-white">{selectedCalibration.calibrationType}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Frequency
                  </Label>
                  <Label className="text-white">{selectedCalibration.frequency}</Label>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Last Calibration
                  </Label>
                  <Label className="font-mono text-white">{selectedCalibration.lastCalibration}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Next Due
                  </Label>
                  <Label className={`font-mono ${selectedCalibration.status === 'Overdue' ? 'text-red-400' : 'text-white'}`}>{selectedCalibration.nextDue}</Label>
                </Stack>
              </Grid>
              {selectedCalibration.certifiedBy && (
                <Grid cols={2} gap={4}>
                  <Stack gap={1}>
                    <Label size="xs" className="text-ink-500">
                      Certified By
                    </Label>
                    <Label className="text-white">{selectedCalibration.certifiedBy}</Label>
                  </Stack>
                  <Stack gap={1}>
                    <Label size="xs" className="text-ink-500">
                      Certificate #
                    </Label>
                    <Label className="font-mono text-white">{selectedCalibration.certificateNumber}</Label>
                  </Stack>
                </Grid>
              )}
              {selectedCalibration.notes && (
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Notes
                  </Label>
                  <Body className="text-ink-300">{selectedCalibration.notes}</Body>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCalibration(null)}>
            Close
          </Button>
          <Button variant="solid">Schedule Calibration</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedCertification} onClose={() => setSelectedCertification(null)}>
        <ModalHeader>
          <H3>Certification Details</H3>
        </ModalHeader>
        <ModalBody>
          {selectedCertification && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label className="text-ink-400">Asset</Label>
                <Label className="text-white text-lg">{selectedCertification.assetName}</Label>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedCertification.certType}</Badge>
                <Label className={getCertStatusColor(selectedCertification.status)}>{selectedCertification.status}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Issuing Body
                  </Label>
                  <Label className="text-white">{selectedCertification.issuingBody}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Certificate #
                  </Label>
                  <Label className="font-mono text-white">{selectedCertification.certificateNumber}</Label>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Issued Date
                  </Label>
                  <Label className="font-mono text-white">{selectedCertification.issuedDate}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">
                    Expiry Date
                  </Label>
                  <Label className={`font-mono ${selectedCertification.status === 'Expired' ? 'text-red-400' : 'text-white'}`}>{selectedCertification.expiryDate}</Label>
                </Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCertification(null)}>
            Close
          </Button>
          <Button variant="solid">Renew Certification</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showScheduleModal} onClose={() => setShowScheduleModal(false)}>
        <ModalHeader>
          <H3>Schedule Calibration</H3>
        </ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Select Asset...</option>
              {mockCalibrations.map((c) => (
                <option key={c.id} value={c.assetId}>
                  {c.assetName}
                </option>
              ))}
            </Select>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Calibration Type...</option>
              <option value="electrical">Electrical Calibration</option>
              <option value="acoustic">Acoustic Calibration</option>
              <option value="load">Load Certification</option>
              <option value="photometric">Photometric Calibration</option>
            </Select>
            <Stack gap={2}>
              <Label>Scheduled Date</Label>
              <Input type="date" className="border-ink-700 bg-black text-white" />
            </Stack>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Service Provider...</option>
              <option value="cal-labs">Cal Labs Inc</option>
              <option value="nti">NTI Americas</option>
              <option value="rigging-safety">Rigging Safety Inc</option>
            </Select>
            <Textarea placeholder="Notes..." className="border-ink-700 bg-black text-white" rows={3} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
            Cancel
          </Button>
          <Button variant="solid" onClick={() => setShowScheduleModal(false)}>
            Schedule
          </Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
