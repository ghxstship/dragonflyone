'use client';

import { useState, useEffect, useCallback } from 'react';
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
// Layout provided by route group
import { log } from '@ghxstship/config';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  category: string;
  reportedBy: string;
  reportedAt: string;
}

export default function ProductionIncidentsPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newIncident, setNewIncident] = useState({ title: '', severity: 'medium', category: '', description: '' });

  const fetchIncidents = useCallback(async () => {
    if (!productionId) return;
    try {
      const response = await fetch(`/api/productions/${productionId}/incidents`);
      if (response.ok) {
        const data = await response.json();
        if (data.incidents && data.incidents.length > 0) {
          setIncidents(data.incidents);
        }
      }
    } catch (error) {
      log.error('Failed to fetch incidents:', error instanceof Error ? error : undefined);
    }
  }, [productionId]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

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
    <>
      <Stack gap={8}>
        <Stack direction="horizontal" className="items-start justify-between">
          <SectionHeader kicker="Production" title="Incident Reports" description="Track and manage production incidents" colorScheme="on-dark" />
          <Button variant="solid" onClick={() => setShowCreateModal(true)}><Plus size={16} className="mr-2" />Report Incident</Button>
        </Stack>

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
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
                      <Body size="sm" className=" text-on-dark-muted">
                        <Clock size={12} className="mr-1 inline" />{incident.reportedAt} by {incident.reportedBy}
                      </Body>
                    </Stack>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/p/${productionId}/incidents/${incident.id}`)}><Eye size={16} /></Button>
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
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
    </>
  );
}
