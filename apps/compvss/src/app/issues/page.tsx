'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  LoadingSpinner,
  StatCard,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ghxstship/ui';
import { Navigation } from '../../components/navigation';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'safety' | 'logistics' | 'personnel' | 'vendor' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
  reported_by: string;
  assigned_to?: string;
  department: string;
  location?: string;
  created_at: string;
  updated_at: string;
  escalation_level: number;
  resolution?: string;
}

const mockIssues: Issue[] = [
  { id: 'ISS-001', title: 'Main PA system feedback', description: 'Intermittent feedback from house left speaker cluster', category: 'technical', priority: 'high', status: 'in_progress', reported_by: 'John Martinez', assigned_to: 'Audio Team', department: 'Audio', location: 'Main Stage', created_at: '2024-11-24T14:30:00Z', updated_at: '2024-11-24T14:45:00Z', escalation_level: 1 },
  { id: 'ISS-002', title: 'Truss motor malfunction', description: 'Motor 3 on downstage truss not responding', category: 'technical', priority: 'critical', status: 'escalated', reported_by: 'Chris Brown', assigned_to: 'Rigging Lead', department: 'Rigging', location: 'Main Stage', created_at: '2024-11-24T13:00:00Z', updated_at: '2024-11-24T14:00:00Z', escalation_level: 2 },
  { id: 'ISS-003', title: 'Catering delivery delayed', description: 'Crew lunch delivery running 45 minutes late', category: 'logistics', priority: 'medium', status: 'open', reported_by: 'Production Office', department: 'Production', created_at: '2024-11-24T11:00:00Z', updated_at: '2024-11-24T11:00:00Z', escalation_level: 0 },
  { id: 'ISS-004', title: 'Missing crew member', description: 'Stagehand Alex Johnson not checked in, no response to calls', category: 'personnel', priority: 'high', status: 'open', reported_by: 'Stage Manager', department: 'Stage', created_at: '2024-11-24T09:00:00Z', updated_at: '2024-11-24T09:30:00Z', escalation_level: 1 },
  { id: 'ISS-005', title: 'Fire exit blocked', description: 'Equipment cases blocking emergency exit door 3', category: 'safety', priority: 'critical', status: 'resolved', reported_by: 'Safety Officer', assigned_to: 'Stagehands', department: 'Safety', location: 'Backstage', created_at: '2024-11-24T10:00:00Z', updated_at: '2024-11-24T10:15:00Z', escalation_level: 0, resolution: 'Cases moved to designated storage area' },
];

export default function IssuesPage() {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState({ priority: '', category: '', department: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    category: 'technical',
    priority: 'medium',
    department: '',
    location: '',
  });

  const handleCreateIssue = () => {
    const issue: Issue = {
      id: `ISS-${String(issues.length + 1).padStart(3, '0')}`,
      ...newIssue,
      category: newIssue.category as Issue['category'],
      priority: newIssue.priority as Issue['priority'],
      status: 'open',
      reported_by: 'Current User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      escalation_level: 0,
    };
    setIssues([issue, ...issues]);
    setShowCreateModal(false);
    setNewIssue({ title: '', description: '', category: 'technical', priority: 'medium', department: '', location: '' });
    setSuccess('Issue reported successfully');
  };

  const handleEscalate = (issueId: string) => {
    setIssues(issues.map(i => {
      if (i.id === issueId) {
        return {
          ...i,
          status: 'escalated' as const,
          escalation_level: i.escalation_level + 1,
          updated_at: new Date().toISOString(),
        };
      }
      return i;
    }));
    setSuccess('Issue escalated');
  };

  const handleResolve = (issueId: string, resolution: string) => {
    setIssues(issues.map(i => {
      if (i.id === issueId) {
        return {
          ...i,
          status: 'resolved' as const,
          resolution,
          updated_at: new Date().toISOString(),
        };
      }
      return i;
    }));
    setSelectedIssue(null);
    setSuccess('Issue resolved');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-ink-400';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-green-500 text-white',
    };
    return <Badge className={colors[priority] || ''}>{priority.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-500 text-white',
      in_progress: 'bg-yellow-500 text-black',
      escalated: 'bg-red-500 text-white',
      resolved: 'bg-green-500 text-white',
      closed: 'bg-gray-500 text-white',
    };
    return <Badge className={colors[status] || ''}>{status.replace('_', ' ')}</Badge>;
  };

  const activeIssues = issues.filter(i => ['open', 'in_progress', 'escalated'].includes(i.status));
  const criticalCount = issues.filter(i => i.priority === 'critical' && i.status !== 'resolved' && i.status !== 'closed').length;
  const escalatedCount = issues.filter(i => i.status === 'escalated').length;

  const filteredIssues = issues.filter(i => {
    const matchesTab = activeTab === 'active' 
      ? ['open', 'in_progress', 'escalated'].includes(i.status)
      : activeTab === 'resolved'
      ? ['resolved', 'closed'].includes(i.status)
      : true;
    const matchesPriority = !filter.priority || i.priority === filter.priority;
    const matchesCategory = !filter.category || i.category === filter.category;
    const matchesDepartment = !filter.department || i.department === filter.department;
    return matchesTab && matchesPriority && matchesCategory && matchesDepartment;
  });

  return (
    <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack direction="horizontal" className="justify-between items-start">
            <Stack gap={2}>
              <H1>Live Issue Tracking</H1>
              <Label className="text-ink-400">Real-time issue management and escalation</Label>
            </Stack>
            <Button variant="solid" onClick={() => setShowCreateModal(true)}>
              Report Issue
            </Button>
          </Stack>

          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <Grid cols={4} gap={6}>
            <StatCard label="Active Issues" value={activeIssues.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Critical" value={criticalCount} trend={criticalCount > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-red-800" />
            <StatCard label="Escalated" value={escalatedCount} trend={escalatedCount > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-orange-800" />
            <StatCard label="Resolved Today" value={issues.filter(i => i.status === 'resolved').length} trend="up" className="bg-transparent border-2 border-green-800" />
          </Grid>

          {criticalCount > 0 && (
            <Alert variant="error">
              ⚠️ {criticalCount} critical issue{criticalCount > 1 ? 's' : ''} requiring immediate attention
            </Alert>
          )}

          <Grid cols={3} gap={4}>
            <Select value={filter.priority} onChange={(e) => setFilter({ ...filter, priority: e.target.value })} className="border-ink-700 bg-black text-white">
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
            <Select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })} className="border-ink-700 bg-black text-white">
              <option value="">All Categories</option>
              <option value="technical">Technical</option>
              <option value="safety">Safety</option>
              <option value="logistics">Logistics</option>
              <option value="personnel">Personnel</option>
              <option value="vendor">Vendor</option>
            </Select>
            <Select value={filter.department} onChange={(e) => setFilter({ ...filter, department: e.target.value })} className="border-ink-700 bg-black text-white">
              <option value="">All Departments</option>
              <option value="Audio">Audio</option>
              <option value="Lighting">Lighting</option>
              <option value="Video">Video</option>
              <option value="Stage">Stage</option>
              <option value="Rigging">Rigging</option>
              <option value="Production">Production</option>
              <option value="Safety">Safety</option>
            </Select>
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === 'active'} onClick={() => setActiveTab('active')}>
                Active ({activeIssues.length})
              </Tab>
              <Tab active={activeTab === 'resolved'} onClick={() => setActiveTab('resolved')}>
                Resolved
              </Tab>
              <Tab active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                All Issues
              </Tab>
            </TabsList>

            <TabPanel active={true}>
              <Stack gap={4}>
                {filteredIssues.map(issue => (
                  <Card key={issue.id} className={`border-2 p-4 ${issue.priority === 'critical' ? 'border-red-800 bg-red-900/10' : issue.status === 'escalated' ? 'border-orange-800 bg-orange-900/10' : 'border-ink-800 bg-ink-900/50'}`}>
                    <Grid cols={4} gap={4} className="items-center">
                      <Stack gap={2}>
                        <Stack direction="horizontal" gap={2}>
                          {getPriorityBadge(issue.priority)}
                          {getStatusBadge(issue.status)}
                        </Stack>
                        <Body className="font-display text-white">{issue.title}</Body>
                        <Label size="xs" className="text-ink-400">{issue.id} • {issue.department}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Reported By</Label>
                        <Label className="text-white">{issue.reported_by}</Label>
                        <Label size="xs" className="text-ink-400">{new Date(issue.created_at).toLocaleTimeString()}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Assigned To</Label>
                        <Label className="text-white">{issue.assigned_to || 'Unassigned'}</Label>
                        {issue.location && <Label size="xs" className="text-ink-400">📍 {issue.location}</Label>}
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedIssue(issue)}>
                          View
                        </Button>
                        {issue.status !== 'resolved' && issue.status !== 'closed' && (
                          <Button variant="outline" size="sm" onClick={() => handleEscalate(issue.id)}>
                            Escalate
                          </Button>
                        )}
                      </Stack>
                    </Grid>
                  </Card>
                ))}
                {filteredIssues.length === 0 && (
                  <Card className="p-8 text-center border-2 border-ink-800">
                    <Body className="text-ink-400">No issues found</Body>
                  </Card>
                )}
              </Stack>
            </TabPanel>
          </Tabs>

          <Grid cols={4} gap={4}>
            <Button variant="outlineWhite" onClick={() => setShowCreateModal(true)}>Report Issue</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Report</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/incidents')}>Incidents</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/emergency')}>Emergency</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Report Issue</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input
              placeholder="Issue Title"
              value={newIssue.title}
              onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
              className="border-ink-700 bg-black text-white"
            />
            <Textarea
              placeholder="Description..."
              value={newIssue.description}
              onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
              rows={3}
              className="border-ink-700 bg-black text-white"
            />
            <Grid cols={2} gap={4}>
              <Select
                value={newIssue.category}
                onChange={(e) => setNewIssue({ ...newIssue, category: e.target.value })}
                className="border-ink-700 bg-black text-white"
              >
                <option value="technical">Technical</option>
                <option value="safety">Safety</option>
                <option value="logistics">Logistics</option>
                <option value="personnel">Personnel</option>
                <option value="vendor">Vendor</option>
                <option value="other">Other</option>
              </Select>
              <Select
                value={newIssue.priority}
                onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
                className="border-ink-700 bg-black text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </Grid>
            <Grid cols={2} gap={4}>
              <Input
                placeholder="Department"
                value={newIssue.department}
                onChange={(e) => setNewIssue({ ...newIssue, department: e.target.value })}
                className="border-ink-700 bg-black text-white"
              />
              <Input
                placeholder="Location"
                value={newIssue.location}
                onChange={(e) => setNewIssue({ ...newIssue, location: e.target.value })}
                className="border-ink-700 bg-black text-white"
              />
            </Grid>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={handleCreateIssue}>Report Issue</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedIssue} onClose={() => setSelectedIssue(null)}>
        <ModalHeader><H3>Issue Details</H3></ModalHeader>
        <ModalBody>
          {selectedIssue && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                {getPriorityBadge(selectedIssue.priority)}
                {getStatusBadge(selectedIssue.status)}
                <Badge variant="outline">{selectedIssue.category}</Badge>
              </Stack>
              <Body className="font-display text-white text-xl">{selectedIssue.title}</Body>
              <Body className="text-ink-300">{selectedIssue.description}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Reported By</Label>
                  <Label className="text-white">{selectedIssue.reported_by}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Assigned To</Label>
                  <Label className="text-white">{selectedIssue.assigned_to || 'Unassigned'}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Department</Label>
                  <Label className="text-white">{selectedIssue.department}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Location</Label>
                  <Label className="text-white">{selectedIssue.location || 'N/A'}</Label>
                </Stack>
              </Grid>
              <Stack gap={1}>
                <Label size="xs" className="text-ink-500">Escalation Level</Label>
                <Label className={selectedIssue.escalation_level > 0 ? 'text-orange-400' : 'text-ink-400'}>
                  Level {selectedIssue.escalation_level}
                </Label>
              </Stack>
              {selectedIssue.resolution && (
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Resolution</Label>
                  <Card className="p-3 bg-green-900/20 border border-green-800">
                    <Label className="text-green-400">{selectedIssue.resolution}</Label>
                  </Card>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedIssue(null)}>Close</Button>
          {selectedIssue && selectedIssue.status !== 'resolved' && selectedIssue.status !== 'closed' && (
            <Button variant="solid" onClick={() => handleResolve(selectedIssue.id, 'Issue resolved')}>
              Mark Resolved
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </Section>
  );
}
