'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Grid,
  Body,
  H3,
  Input,
  Select,
  Textarea,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@ghxstship/ui';
import {
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  Plus,
  Eye,
} from 'lucide-react';
import { CompvssAppLayout } from '../../../../components/app-layout';

interface Incident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  reportedAt: string;
  description: string;
}

const MOCK_INCIDENTS: Incident[] = [
  { id: 'INC-001', title: 'Equipment malfunction - Stage left speaker', severity: 'medium', category: 'Equipment', status: 'resolved', reportedBy: 'Audio Tech', reportedAt: '2024-11-15 14:30', description: 'Speaker cutting out intermittently' },
  { id: 'INC-002', title: 'Minor injury - Crew member', severity: 'high', category: 'Safety', status: 'closed', reportedBy: 'Stage Manager', reportedAt: '2024-11-15 16:45', description: 'Crew member twisted ankle during load-in' },
  { id: 'INC-003', title: 'Power fluctuation - Lighting rig', severity: 'low', category: 'Technical', status: 'investigating', reportedBy: 'LD', reportedAt: '2024-11-16 09:15', description: 'Intermittent dimming on downstage fixtures' },
];

export default function ProductionIncidentsPage() {
  const params = useParams();
  const router = useRouter();
  const _productionId = params?.productionId as string;
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newIncident, setNewIncident] = useState({ title: '', severity: 'medium', category: '', description: '' });

  const openCount = incidents.filter(i => i.status === 'open' || i.status === 'investigating').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;
  const criticalCount = incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length;

  const getSeverityBadge = (severity: Incident['severity']) => {
    const variants: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
      critical: 'error', high: 'error', medium: 'warning', low: 'info'
    };
    return <Badge variant={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: Incident['status']) => {
    const variants: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
      open: 'error', investigating: 'warning', resolved: 'info', closed: 'success'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const handleCreateIncident = () => {
    const incident: Incident = {
      id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
      ...newIncident,
      severity: newIncident.severity as Incident['severity'],
      status: 'open',
      reportedBy: 'Current User',
      reportedAt: new Date().toISOString(),
    };
    setIncidents(prev => [incident, ...prev]);
    setShowCreateModal(false);
    setNewIncident({ title: '', severity: 'medium', category: '', description: '' });
  };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <Stack direction="horizontal" className="items-start justify-between">
          <SectionHeader kicker="Production" title="Incident Reports" description="Track and manage production incidents" colorScheme="on-dark" />
          <Button variant="solid" onClick={() => setShowCreateModal(true)}><Plus size={16} className="mr-2" />Report Incident</Button>
        </Stack>

        <Grid cols={4} gap={4}>
          <StatCard label="Total Incidents" value={incidents.length.toString()} icon={<FileText size={20} />} inverted />
          <StatCard label="Open" value={openCount.toString()} icon={<AlertTriangle size={20} />} inverted />
          <StatCard label="Resolved" value={resolvedCount.toString()} icon={<CheckCircle size={20} />} inverted />
          <StatCard label="High/Critical" value={criticalCount.toString()} icon={<AlertTriangle size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <H3 className="text-white">All Incidents</H3>
              <Stack gap={2}>
                {incidents.map(incident => (
                  <Stack key={incident.id} direction="horizontal" className="items-center justify-between rounded border-2 border-ink-700 p-4">
                    <Stack gap={1}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Body className="font-weight-semibold text-white">{incident.id}</Body>
                        {getSeverityBadge(incident.severity)}
                        {getStatusBadge(incident.status)}
                      </Stack>
                      <Body className="text-white">{incident.title}</Body>
                      <Body className="text-body-sm text-on-dark-muted">
                        <Clock size={12} className="mr-1 inline" />{incident.reportedAt} by {incident.reportedBy}
                      </Body>
                    </Stack>
                    <Button variant="ghost" size="sm"><Eye size={16} /></Button>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Report New Incident</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Incident title" value={newIncident.title} onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))} />
            <Grid cols={2} gap={4}>
              <Select value={newIncident.severity} onChange={(e) => setNewIncident(prev => ({ ...prev, severity: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
              <Select value={newIncident.category} onChange={(e) => setNewIncident(prev => ({ ...prev, category: e.target.value }))}>
                <option value="">Select category...</option>
                <option value="Safety">Safety</option>
                <option value="Equipment">Equipment</option>
                <option value="Technical">Technical</option>
                <option value="Security">Security</option>
                <option value="Other">Other</option>
              </Select>
            </Grid>
            <Textarea placeholder="Describe the incident..." value={newIncident.description} onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))} rows={4} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={handleCreateIncident}>Submit Report</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
