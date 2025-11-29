'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  Container,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
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
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';

interface Lead {
  id: string;
  company: string;
  contact_name: string;
  contact_email: string;
  contact_title: string;
  source: 'website' | 'referral' | 'event' | 'cold_outreach' | 'inbound';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  score: number;
  score_breakdown: ScoreBreakdown;
  estimated_value: number;
  created_at: string;
  last_activity: string;
  qualification_status: 'unqualified' | 'mql' | 'sql' | 'opportunity';
}

interface ScoreBreakdown {
  demographic: number;
  behavioral: number;
  engagement: number;
  fit: number;
}

interface ScoringRule {
  id: string;
  category: 'demographic' | 'behavioral' | 'engagement' | 'fit';
  name: string;
  condition: string;
  points: number;
  is_active: boolean;
}

const mockLeads: Lead[] = [
  { id: 'LEAD-001', company: 'TechCorp Inc', contact_name: 'John Smith', contact_email: 'john@techcorp.com', contact_title: 'VP of Events', source: 'website', status: 'qualified', score: 85, score_breakdown: { demographic: 25, behavioral: 20, engagement: 25, fit: 15 }, estimated_value: 150000, created_at: '2024-11-20T10:00:00Z', last_activity: '2024-11-24T14:00:00Z', qualification_status: 'sql' },
  { id: 'LEAD-002', company: 'Global Events Ltd', contact_name: 'Sarah Johnson', contact_email: 'sarah@globalevents.com', contact_title: 'Event Director', source: 'referral', status: 'proposal', score: 92, score_breakdown: { demographic: 30, behavioral: 22, engagement: 25, fit: 15 }, estimated_value: 250000, created_at: '2024-11-15T09:00:00Z', last_activity: '2024-11-24T10:00:00Z', qualification_status: 'opportunity' },
  { id: 'LEAD-003', company: 'StartupXYZ', contact_name: 'Mike Chen', contact_email: 'mike@startupxyz.com', contact_title: 'CEO', source: 'event', status: 'contacted', score: 45, score_breakdown: { demographic: 10, behavioral: 15, engagement: 10, fit: 10 }, estimated_value: 25000, created_at: '2024-11-22T14:00:00Z', last_activity: '2024-11-23T16:00:00Z', qualification_status: 'mql' },
  { id: 'LEAD-004', company: 'Enterprise Solutions', contact_name: 'Lisa Park', contact_email: 'lisa@enterprise.com', contact_title: 'CMO', source: 'inbound', status: 'new', score: 72, score_breakdown: { demographic: 20, behavioral: 18, engagement: 20, fit: 14 }, estimated_value: 100000, created_at: '2024-11-24T08:00:00Z', last_activity: '2024-11-24T08:00:00Z', qualification_status: 'mql' },
  { id: 'LEAD-005', company: 'Local Business Co', contact_name: 'Tom Wilson', contact_email: 'tom@localbiz.com', contact_title: 'Owner', source: 'cold_outreach', status: 'contacted', score: 28, score_breakdown: { demographic: 5, behavioral: 8, engagement: 10, fit: 5 }, estimated_value: 10000, created_at: '2024-11-21T11:00:00Z', last_activity: '2024-11-22T09:00:00Z', qualification_status: 'unqualified' },
];

const mockScoringRules: ScoringRule[] = [
  { id: 'RULE-001', category: 'demographic', name: 'Company Size > 500', condition: 'employees > 500', points: 15, is_active: true },
  { id: 'RULE-002', category: 'demographic', name: 'Decision Maker Title', condition: 'title contains VP, Director, C-level', points: 10, is_active: true },
  { id: 'RULE-003', category: 'demographic', name: 'Target Industry', condition: 'industry in [Events, Entertainment, Corporate]', points: 10, is_active: true },
  { id: 'RULE-004', category: 'behavioral', name: 'Visited Pricing Page', condition: 'page_view = pricing', points: 10, is_active: true },
  { id: 'RULE-005', category: 'behavioral', name: 'Downloaded Content', condition: 'download_count > 0', points: 8, is_active: true },
  { id: 'RULE-006', category: 'behavioral', name: 'Requested Demo', condition: 'demo_request = true', points: 15, is_active: true },
  { id: 'RULE-007', category: 'engagement', name: 'Email Opens > 3', condition: 'email_opens > 3', points: 10, is_active: true },
  { id: 'RULE-008', category: 'engagement', name: 'Website Visits > 5', condition: 'website_visits > 5', points: 10, is_active: true },
  { id: 'RULE-009', category: 'engagement', name: 'Recent Activity (7 days)', condition: 'last_activity < 7 days', points: 10, is_active: true },
  { id: 'RULE-010', category: 'fit', name: 'Budget Confirmed', condition: 'budget_confirmed = true', points: 15, is_active: true },
  { id: 'RULE-011', category: 'fit', name: 'Timeline < 6 months', condition: 'timeline < 6 months', points: 10, is_active: true },
];

export default function LeadScoringPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [rules, setRules] = useState<ScoringRule[]>(mockScoringRules);
  const [activeTab, setActiveTab] = useState('leads');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [filter, setFilter] = useState({ qualification: '', source: '', minScore: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newRule, setNewRule] = useState({
    category: 'demographic',
    name: '',
    condition: '',
    points: 10,
  });

  const handleAddRule = () => {
    if (!newRule.name || !newRule.condition) {
      setError('Please fill in all fields');
      return;
    }

    const rule: ScoringRule = {
      id: `RULE-${Date.now()}`,
      category: newRule.category as ScoringRule['category'],
      name: newRule.name,
      condition: newRule.condition,
      points: newRule.points,
      is_active: true,
    };

    setRules([...rules, rule]);
    setShowRuleModal(false);
    setNewRule({ category: 'demographic', name: '', condition: '', points: 10 });
    setSuccess('Scoring rule added');
  };

  const handleQualify = (leadId: string, newStatus: Lead['qualification_status']) => {
    setLeads(leads.map(l =>
      l.id === leadId ? { ...l, qualification_status: newStatus } : l
    ));
    setSuccess(`Lead ${newStatus === 'sql' ? 'qualified as SQL' : newStatus === 'opportunity' ? 'converted to opportunity' : 'updated'}`);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-success-500 text-white">Hot ({score})</Badge>;
    if (score >= 50) return <Badge className="bg-warning-500 text-black">Warm ({score})</Badge>;
    return <Badge className="bg-ink-500 text-white">Cold ({score})</Badge>;
  };

  const getQualificationBadge = (status: string) => {
    const colors: Record<string, string> = {
      unqualified: 'bg-ink-500 text-white',
      mql: 'bg-info-500 text-white',
      sql: 'bg-purple-500 text-white',
      opportunity: 'bg-success-500 text-white',
    };
    return <Badge className={colors[status] || ''}>{status.toUpperCase()}</Badge>;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      demographic: 'bg-info-100 text-info-800',
      behavioral: 'bg-purple-100 text-purple-800',
      engagement: 'bg-success-100 text-success-800',
      fit: 'bg-warning-100 text-warning-800',
    };
    return colors[category] || '';
  };

  const filteredLeads = leads.filter(l => {
    const matchesQualification = !filter.qualification || l.qualification_status === filter.qualification;
    const matchesSource = !filter.source || l.source === filter.source;
    const matchesScore = !filter.minScore || l.score >= parseInt(filter.minScore);
    return matchesQualification && matchesSource && matchesScore;
  }).sort((a, b) => b.score - a.score);

  const hotLeads = leads.filter(l => l.score >= 80).length;
  const sqlCount = leads.filter(l => l.qualification_status === 'sql').length;
  const avgScore = Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length);

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="Lead Scoring"
        subtitle="Automated lead qualification and scoring"
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Leads', href: '/leads' }, { label: 'Scoring' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        primaryAction={{ label: 'View Pipeline', onClick: () => router.push('/deals') }}
        secondaryActions={[{ id: 'add-rule', label: 'Add Rule', onClick: () => setShowRuleModal(true) }]}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

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
            label="Hot Leads"
            value={hotLeads}
            icon={<span>🔥</span>}
          />
          <StatCard
            label="SQLs"
            value={sqlCount}
            icon={<span>✅</span>}
          />
          <StatCard
            label="Avg Score"
            value={avgScore}
            icon={<span>📊</span>}
          />
          <StatCard
            label="Active Rules"
            value={rules.filter(r => r.is_active).length}
            icon={<span>⚙️</span>}
          />
        </Grid>

        <Tabs>
          <TabsList>
            <Tab active={activeTab === 'leads'} onClick={() => setActiveTab('leads')}>
              Scored Leads
            </Tab>
            <Tab active={activeTab === 'rules'} onClick={() => setActiveTab('rules')}>
              Scoring Rules
            </Tab>
            <Tab active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
              Analytics
            </Tab>
          </TabsList>
        </Tabs>

        {activeTab === 'leads' && (
          <Stack gap={6} className="mt-6">
            <Stack direction="horizontal" gap={4}>
              <Field label="" className="w-48">
                <Select
                  value={filter.qualification}
                  onChange={(e) => setFilter({ ...filter, qualification: e.target.value })}
                >
                  <option value="">All Qualifications</option>
                  <option value="unqualified">Unqualified</option>
                  <option value="mql">MQL</option>
                  <option value="sql">SQL</option>
                  <option value="opportunity">Opportunity</option>
                </Select>
              </Field>
              <Field label="" className="w-48">
                <Select
                  value={filter.source}
                  onChange={(e) => setFilter({ ...filter, source: e.target.value })}
                >
                  <option value="">All Sources</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="event">Event</option>
                  <option value="inbound">Inbound</option>
                  <option value="cold_outreach">Cold Outreach</option>
                </Select>
              </Field>
              <Field label="" className="w-48">
                <Select
                  value={filter.minScore}
                  onChange={(e) => setFilter({ ...filter, minScore: e.target.value })}
                >
                  <option value="">Any Score</option>
                  <option value="80">Hot (80+)</option>
                  <option value="50">Warm (50+)</option>
                  <option value="0">All</option>
                </Select>
              </Field>
            </Stack>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Est. Value</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map(lead => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Stack gap={1}>
                        <Body className="font-bold">{lead.company}</Body>
                        <Label className="text-ink-500">{lead.contact_name} • {lead.contact_title}</Label>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {getScoreBadge(lead.score)}
                    </TableCell>
                    <TableCell>
                      {getQualificationBadge(lead.qualification_status)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{lead.source.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      <Body className="font-bold">${lead.estimated_value.toLocaleString()}</Body>
                    </TableCell>
                    <TableCell>
                      <Label className="text-ink-500">
                        {new Date(lead.last_activity).toLocaleDateString()}
                      </Label>
                    </TableCell>
                    <TableCell>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}>
                          Details
                        </Button>
                        {lead.qualification_status === 'mql' && (
                          <Button variant="outline" size="sm" onClick={() => handleQualify(lead.id, 'sql')}>
                            Qualify
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
        )}

        {activeTab === 'rules' && (
          <Stack gap={4} className="mt-6">
            {['demographic', 'behavioral', 'engagement', 'fit'].map(category => (
              <Card key={category} className="p-6 border">
                <Stack gap={4}>
                  <H3 className="capitalize">{category} Scoring</H3>
                  <Stack gap={2}>
                    {rules.filter(r => r.category === category).map(rule => (
                      <Card key={rule.id} className={`p-4 border ${!rule.is_active ? 'opacity-50' : ''}`}>
                        <Stack direction="horizontal" className="justify-between items-center">
                          <Stack gap={1}>
                            <Body className="font-bold">{rule.name}</Body>
                            <Label className="text-ink-500 font-mono">{rule.condition}</Label>
                          </Stack>
                          <Stack direction="horizontal" gap={4} className="items-center">
                            <Badge className={getCategoryColor(category)}>+{rule.points} pts</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRules(rules.map(r =>
                                r.id === rule.id ? { ...r, is_active: !r.is_active } : r
                              ))}
                            >
                              {rule.is_active ? 'Disable' : 'Enable'}
                            </Button>
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}

        {activeTab === 'analytics' && (
          <Grid cols={2} gap={6} className="mt-6">
            <Card className="p-6 border">
              <Stack gap={4}>
                <H3>Score Distribution</H3>
                <Stack gap={2}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Hot (80+)</Body>
                    <Body className="font-bold">{leads.filter(l => l.score >= 80).length} leads</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Warm (50-79)</Body>
                    <Body className="font-bold">{leads.filter(l => l.score >= 50 && l.score < 80).length} leads</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Cold (&lt;50)</Body>
                    <Body className="font-bold">{leads.filter(l => l.score < 50).length} leads</Body>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
            <Card className="p-6 border">
              <Stack gap={4}>
                <H3>Qualification Funnel</H3>
                <Stack gap={2}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Unqualified</Body>
                    <Body className="font-bold">{leads.filter(l => l.qualification_status === 'unqualified').length}</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>MQL</Body>
                    <Body className="font-bold">{leads.filter(l => l.qualification_status === 'mql').length}</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>SQL</Body>
                    <Body className="font-bold">{leads.filter(l => l.qualification_status === 'sql').length}</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Opportunity</Body>
                    <Body className="font-bold">{leads.filter(l => l.qualification_status === 'opportunity').length}</Body>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
            <Card className="p-6 border">
              <Stack gap={4}>
                <H3>Source Performance</H3>
                <Stack gap={2}>
                  {['website', 'referral', 'event', 'inbound', 'cold_outreach'].map(source => {
                    const sourceLeads = leads.filter(l => l.source === source);
                    const avgSourceScore = sourceLeads.length > 0
                      ? Math.round(sourceLeads.reduce((sum, l) => sum + l.score, 0) / sourceLeads.length)
                      : 0;
                    return (
                      <Stack key={source} direction="horizontal" className="justify-between">
                        <Body className="capitalize">{source.replace('_', ' ')}</Body>
                        <Body className="font-bold">Avg: {avgSourceScore}</Body>
                      </Stack>
                    );
                  })}
                </Stack>
              </Stack>
            </Card>
            <Card className="p-6 border">
              <Stack gap={4}>
                <H3>Pipeline Value</H3>
                <Stack gap={2}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Total Pipeline</Body>
                    <Body className="font-bold text-h6-md">
                      ${leads.reduce((sum, l) => sum + l.estimated_value, 0).toLocaleString()}
                    </Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Hot Leads Value</Body>
                    <Body className="font-bold text-success-600">
                      ${leads.filter(l => l.score >= 80).reduce((sum, l) => sum + l.estimated_value, 0).toLocaleString()}
                    </Body>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        )}

        <Modal
          open={showRuleModal}
          onClose={() => setShowRuleModal(false)}
          title="Add Scoring Rule"
        >
          <Stack gap={4}>
            <Field label="Category">
              <Select
                value={newRule.category}
                onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
              >
                <option value="demographic">Demographic</option>
                <option value="behavioral">Behavioral</option>
                <option value="engagement">Engagement</option>
                <option value="fit">Fit</option>
              </Select>
            </Field>
            <Field label="Rule Name">
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="e.g., Company Size > 1000"
              />
            </Field>
            <Field label="Condition">
              <Input
                value={newRule.condition}
                onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                placeholder="e.g., employees > 1000"
              />
            </Field>
            <Field label="Points">
              <Input
                type="number"
                value={newRule.points}
                onChange={(e) => setNewRule({ ...newRule, points: parseInt(e.target.value) || 0 })}
                min={1}
                max={50}
              />
            </Field>
            <Stack direction="horizontal" gap={4}>
              <Button variant="solid" onClick={handleAddRule}>
                Add Rule
              </Button>
              <Button variant="outline" onClick={() => setShowRuleModal(false)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Modal>

        <Modal
          open={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title="Lead Details"
        >
          {selectedLead && (
            <Stack gap={6}>
              <Stack gap={2}>
                <H2>{selectedLead.company}</H2>
                <Body>{selectedLead.contact_name} • {selectedLead.contact_title}</Body>
                <Body className="text-ink-500">{selectedLead.contact_email}</Body>
              </Stack>

              <Stack direction="horizontal" gap={4}>
                {getScoreBadge(selectedLead.score)}
                {getQualificationBadge(selectedLead.qualification_status)}
              </Stack>

              <Card className="p-4 border">
                <Stack gap={3}>
                  <H3>Score Breakdown</H3>
                  <Grid cols={2} gap={4}>
                    <Stack gap={1}>
                      <Label className="text-ink-500">Demographic</Label>
                      <Body className="font-bold">{selectedLead.score_breakdown.demographic} pts</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-ink-500">Behavioral</Label>
                      <Body className="font-bold">{selectedLead.score_breakdown.behavioral} pts</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-ink-500">Engagement</Label>
                      <Body className="font-bold">{selectedLead.score_breakdown.engagement} pts</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-ink-500">Fit</Label>
                      <Body className="font-bold">{selectedLead.score_breakdown.fit} pts</Body>
                    </Stack>
                  </Grid>
                </Stack>
              </Card>

              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label className="text-ink-500">Estimated Value</Label>
                  <Body className="font-bold text-h6-md">${selectedLead.estimated_value.toLocaleString()}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-ink-500">Source</Label>
                  <Body className="capitalize">{selectedLead.source.replace('_', ' ')}</Body>
                </Stack>
              </Grid>

              <Stack direction="horizontal" gap={4}>
                {selectedLead.qualification_status === 'mql' && (
                  <Button variant="solid" onClick={() => { handleQualify(selectedLead.id, 'sql'); setSelectedLead(null); }}>
                    Qualify as SQL
                  </Button>
                )}
                {selectedLead.qualification_status === 'sql' && (
                  <Button variant="solid" onClick={() => { handleQualify(selectedLead.id, 'opportunity'); setSelectedLead(null); }}>
                    Convert to Opportunity
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedLead(null)}>
                  Close
                </Button>
              </Stack>
            </Stack>
          )}
        </Modal>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
