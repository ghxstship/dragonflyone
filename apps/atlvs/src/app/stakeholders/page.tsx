'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Section,
  Display,
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
  LoadingSpinner,
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
  StatCard,
} from '@ghxstship/ui';

interface Stakeholder {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  permission_level: 'view' | 'comment' | 'edit' | 'admin';
  projects: string[];
  last_activity: string;
  status: 'active' | 'invited' | 'inactive';
}

interface Communication {
  id: string;
  type: 'email' | 'meeting' | 'update' | 'announcement';
  subject: string;
  content: string;
  recipients: string[];
  sent_at: string;
  sent_by: string;
  project_id?: string;
}

export default function StakeholdersPage() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stakeholders');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: '',
    organization: '',
    permission_level: 'view',
    projects: [] as string[],
  });

  const [composeForm, setComposeForm] = useState({
    type: 'update',
    subject: '',
    content: '',
    recipients: [] as string[],
    project_id: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [stakeholdersRes, commsRes] = await Promise.all([
        fetch('/api/stakeholders'),
        fetch('/api/stakeholders/communications'),
      ]);

      if (stakeholdersRes.ok) {
        const data = await stakeholdersRes.json();
        setStakeholders(data.stakeholders || []);
      }

      if (commsRes.ok) {
        const data = await commsRes.json();
        setCommunications(data.communications || []);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/stakeholders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      });

      if (response.ok) {
        setSuccess('Stakeholder invited successfully');
        setShowInviteModal(false);
        setInviteForm({
          name: '',
          email: '',
          role: '',
          organization: '',
          permission_level: 'view',
          projects: [],
        });
        fetchData();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to invite stakeholder');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleSendCommunication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/stakeholders/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composeForm),
      });

      if (response.ok) {
        setSuccess('Communication sent successfully');
        setShowComposeModal(false);
        setComposeForm({
          type: 'update',
          subject: '',
          content: '',
          recipients: [],
          project_id: '',
        });
        fetchData();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send communication');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const getPermissionBadge = (level: string) => {
    const variants: Record<string, string> = {
      admin: 'bg-purple-500 text-white',
      edit: 'bg-blue-500 text-white',
      comment: 'bg-green-500 text-white',
      view: 'bg-gray-500 text-white',
    };
    return <Badge className={variants[level] || ''}>{level.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-500 text-white',
      invited: 'bg-yellow-500 text-white',
      inactive: 'bg-gray-400 text-white',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      email: '✉️',
      meeting: '📅',
      update: '📢',
      announcement: '📣',
    };
    return icons[type] || '📝';
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </Section>
    );
  }

  const activeStakeholders = stakeholders.filter(s => s.status === 'active').length;
  const pendingInvites = stakeholders.filter(s => s.status === 'invited').length;
  const recentComms = communications.filter(c => {
    const sentDate = new Date(c.sent_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sentDate > weekAgo;
  }).length;

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Section className="border-b-2 border-black py-8 mb-8">
          <Stack direction="horizontal" className="justify-between items-center">
            <Stack>
              <Display>STAKEHOLDER HUB</Display>
              <Body className="mt-2 text-gray-600">
                Manage stakeholder access and communications
              </Body>
            </Stack>
            <Stack direction="horizontal" gap={2}>
              <Button variant="outline" onClick={() => setShowComposeModal(true)}>
                Send Update
              </Button>
              <Button variant="solid" onClick={() => setShowInviteModal(true)}>
                Invite Stakeholder
              </Button>
            </Stack>
          </Stack>
        </Section>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid cols={4} gap={6} className="mb-8">
          <StatCard
            label="Active Stakeholders"
            value={activeStakeholders}
            icon={<Body>👥</Body>}
          />
          <StatCard
            label="Pending Invites"
            value={pendingInvites}
            icon={<Body>📨</Body>}
          />
          <StatCard
            label="Communications (7d)"
            value={recentComms}
            icon={<Body>📬</Body>}
          />
          <StatCard
            label="Total Projects"
            value={new Set(stakeholders.flatMap(s => s.projects)).size}
            icon={<Body>📁</Body>}
          />
        </Grid>

        <Tabs>
          <TabsList>
            <Tab active={activeTab === 'stakeholders'} onClick={() => setActiveTab('stakeholders')}>
              Stakeholders
            </Tab>
            <Tab active={activeTab === 'communications'} onClick={() => setActiveTab('communications')}>
              Communications
            </Tab>
            <Tab active={activeTab === 'permissions'} onClick={() => setActiveTab('permissions')}>
              Permission Matrix
            </Tab>
          </TabsList>
        </Tabs>

        {activeTab === 'stakeholders' && (
          <Card className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stakeholders.map((stakeholder) => (
                  <TableRow key={stakeholder.id}>
                    <TableCell>{stakeholder.name}</TableCell>
                    <TableCell>{stakeholder.organization}</TableCell>
                    <TableCell>{stakeholder.role}</TableCell>
                    <TableCell>{getPermissionBadge(stakeholder.permission_level)}</TableCell>
                    <TableCell>{stakeholder.projects?.length || 0}</TableCell>
                    <TableCell>{getStatusBadge(stakeholder.status)}</TableCell>
                    <TableCell>
                      <Body className="text-sm text-gray-500">
                        {stakeholder.last_activity ? new Date(stakeholder.last_activity).toLocaleDateString() : 'Never'}
                      </Body>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Manage</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {activeTab === 'communications' && (
          <Stack gap={4} className="mt-6">
            {communications.length > 0 ? (
              communications.map(comm => (
                <Card key={comm.id} className="p-6">
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Stack direction="horizontal" gap={4} className="items-start">
                      <Body className="text-2xl">{getTypeIcon(comm.type)}</Body>
                      <Stack gap={1}>
                        <H3>{comm.subject}</H3>
                        <Body className="text-gray-600 text-sm line-clamp-2">
                          {comm.content}
                        </Body>
                        <Stack direction="horizontal" gap={4} className="mt-2">
                          <Body className="text-xs text-gray-500">
                            Sent by {comm.sent_by}
                          </Body>
                          <Body className="text-xs text-gray-500">
                            {new Date(comm.sent_at).toLocaleString()}
                          </Body>
                          <Body className="text-xs text-gray-500">
                            {comm.recipients.length} recipients
                          </Body>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Badge>{comm.type}</Badge>
                  </Stack>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <H3 className="mb-4">NO COMMUNICATIONS</H3>
                <Body className="text-gray-600 mb-6">
                  Start engaging with your stakeholders
                </Body>
                <Button variant="solid" onClick={() => setShowComposeModal(true)}>
                  Send First Update
                </Button>
              </Card>
            )}
          </Stack>
        )}

        {activeTab === 'permissions' && (
          <Card className="mt-6 p-6">
            <H3 className="mb-6">PERMISSION MATRIX</H3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stakeholder</TableHead>
                  <TableHead>View</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Edit</TableHead>
                  <TableHead>Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stakeholders.map((stakeholder) => (
                  <TableRow key={stakeholder.id}>
                    <TableCell>{stakeholder.name}</TableCell>
                    <TableCell className="text-center">✓</TableCell>
                    <TableCell className="text-center">
                      {['comment', 'edit', 'admin'].includes(stakeholder.permission_level) ? '✓' : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {['edit', 'admin'].includes(stakeholder.permission_level) ? '✓' : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {stakeholder.permission_level === 'admin' ? '✓' : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        <Modal
          open={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title="Invite Stakeholder"
        >
          <form onSubmit={handleInvite}>
            <Stack gap={4}>
              <Field label="Name" required>
                <Input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  required
                />
              </Field>

              <Field label="Email" required>
                <Input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  required
                />
              </Field>

              <Field label="Organization">
                <Input
                  value={inviteForm.organization}
                  onChange={(e) => setInviteForm({ ...inviteForm, organization: e.target.value })}
                />
              </Field>

              <Field label="Role">
                <Input
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  placeholder="e.g., Client, Partner, Investor"
                />
              </Field>

              <Field label="Permission Level">
                <Select
                  value={inviteForm.permission_level}
                  onChange={(e) => setInviteForm({ ...inviteForm, permission_level: e.target.value as any })}
                >
                  <option value="view">View Only</option>
                  <option value="comment">Can Comment</option>
                  <option value="edit">Can Edit</option>
                  <option value="admin">Admin</option>
                </Select>
              </Field>

              <Stack direction="horizontal" gap={4}>
                <Button type="submit" variant="solid">
                  Send Invitation
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </form>
        </Modal>

        <Modal
          open={showComposeModal}
          onClose={() => setShowComposeModal(false)}
          title="Send Communication"
        >
          <form onSubmit={handleSendCommunication}>
            <Stack gap={4}>
              <Field label="Type">
                <Select
                  value={composeForm.type}
                  onChange={(e) => setComposeForm({ ...composeForm, type: e.target.value })}
                >
                  <option value="update">Project Update</option>
                  <option value="announcement">Announcement</option>
                  <option value="meeting">Meeting Invite</option>
                  <option value="email">General Email</option>
                </Select>
              </Field>

              <Field label="Subject" required>
                <Input
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  required
                />
              </Field>

              <Field label="Message" required>
                <Textarea
                  value={composeForm.content}
                  onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                  rows={5}
                  required
                />
              </Field>

              <Field label="Recipients">
                <Select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !composeForm.recipients.includes(e.target.value)) {
                      setComposeForm({
                        ...composeForm,
                        recipients: [...composeForm.recipients, e.target.value],
                      });
                    }
                  }}
                >
                  <option value="">Add recipient...</option>
                  <option value="all">All Stakeholders</option>
                  {stakeholders.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
                {composeForm.recipients.length > 0 && (
                  <Stack direction="horizontal" gap={2} className="mt-2 flex-wrap">
                    {composeForm.recipients.map(r => (
                      <Badge key={r} className="cursor-pointer" onClick={() => {
                        setComposeForm({
                          ...composeForm,
                          recipients: composeForm.recipients.filter(rec => rec !== r),
                        });
                      }}>
                        {r === 'all' ? 'All Stakeholders' : stakeholders.find(s => s.id === r)?.name || r} ×
                      </Badge>
                    ))}
                  </Stack>
                )}
              </Field>

              <Stack direction="horizontal" gap={4}>
                <Button type="submit" variant="solid">
                  Send
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowComposeModal(false)}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </form>
        </Modal>
      </Container>
    </Section>
  );
}
