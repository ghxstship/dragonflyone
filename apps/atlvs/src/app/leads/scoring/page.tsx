'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalTabState } from '@ghxstship/config/hooks';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { Flame, CheckCircle, BarChart3, Settings } from 'lucide-react';
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';

import {
  DEMO_LEADS_SCORING_FULL,
  DEMO_SCORING_RULES_FULL,
  type DemoLeadScoringFull as Lead,
  type DemoScoringRuleFull as ScoringRule,
} from '../../../lib/demo-data';

export default function LeadScoringPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS_SCORING_FULL);
  const [rules, setRules] = useState<ScoringRule[]>(DEMO_SCORING_RULES_FULL);
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useLocalTabState({
    storageKey: 'leads-scoring-tab',
    defaultTab: 'leads',
  });
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
      sql: 'bg-violet-500 text-white',
      opportunity: 'bg-success-500 text-white',
    };
    return <Badge className={colors[status] || ''}>{status.toUpperCase()}</Badge>;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      demographic: 'bg-success-100 text-success-600',
      behavioral: 'bg-violet-100 text-violet-800',
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
            icon={<Flame className="size-5" />}
          />
          <StatCard
            label="SQLs"
            value={sqlCount}
            icon={<CheckCircle className="size-5" />}
          />
          <StatCard
            label="Avg Score"
            value={avgScore}
            icon={<BarChart3 className="size-5" />}
          />
          <StatCard
            label="Active Rules"
            value={rules.filter(r => r.is_active).length}
            icon={<Settings className="size-5" />}
          />
        </Grid>

        <Tabs>
          <TabsList>
            <Tab active={isActive('leads')} onClick={() => setActiveTab('leads')}>
              Scored Leads
            </Tab>
            <Tab active={isActive('rules')} onClick={() => setActiveTab('rules')}>
              Scoring Rules
            </Tab>
            <Tab active={isActive('analytics')} onClick={() => setActiveTab('analytics')}>
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

            <Table variant="dark">
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
                        <Body className="font-weight-bold">{lead.company}</Body>
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
                      <Body className="font-weight-bold">${lead.estimated_value.toLocaleString()}</Body>
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
              <Card key={category} className="p-6 border-2">
                <Stack gap={4}>
                  <H3 className="capitalize">{category} Scoring</H3>
                  <Stack gap={2}>
                    {rules.filter(r => r.category === category).map(rule => (
                      <Card key={rule.id} className={`p-4 border-2 ${!rule.is_active ? 'opacity-50' : ''}`}>
                        <Stack direction="horizontal" className="justify-between items-center">
                          <Stack gap={1}>
                            <Body className="font-weight-bold">{rule.name}</Body>
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
            <Card className="p-6 border-2">
              <Stack gap={4}>
                <H3>Score Distribution</H3>
                <Stack gap={2}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Hot (80+)</Body>
                    <Body className="font-weight-bold">{leads.filter(l => l.score >= 80).length} leads</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Warm (50-79)</Body>
                    <Body className="font-weight-bold">{leads.filter(l => l.score >= 50 && l.score < 80).length} leads</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Cold (&lt;50)</Body>
                    <Body className="font-weight-bold">{leads.filter(l => l.score < 50).length} leads</Body>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
            <Card className="p-6 border-2">
              <Stack gap={4}>
                <H3>Qualification Funnel</H3>
                <Stack gap={2}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Unqualified</Body>
                    <Body className="font-weight-bold">{leads.filter(l => l.qualification_status === 'unqualified').length}</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>MQL</Body>
                    <Body className="font-weight-bold">{leads.filter(l => l.qualification_status === 'mql').length}</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>SQL</Body>
                    <Body className="font-weight-bold">{leads.filter(l => l.qualification_status === 'sql').length}</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Opportunity</Body>
                    <Body className="font-weight-bold">{leads.filter(l => l.qualification_status === 'opportunity').length}</Body>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
            <Card className="p-6 border-2">
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
                        <Body className="font-weight-bold">Avg: {avgSourceScore}</Body>
                      </Stack>
                    );
                  })}
                </Stack>
              </Stack>
            </Card>
            <Card className="p-6 border-2">
              <Stack gap={4}>
                <H3>Pipeline Value</H3>
                <Stack gap={2}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Total Pipeline</Body>
                    <Body className="font-weight-bold text-h6-md">
                      ${leads.reduce((sum, l) => sum + l.estimated_value, 0).toLocaleString()}
                    </Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body>Hot Leads Value</Body>
                    <Body className="font-weight-bold text-success-600">
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

              <Card className="p-4 border-2">
                <Stack gap={3}>
                  <H3>Score Breakdown</H3>
                  <Grid cols={2} gap={4}>
                    <Stack gap={1}>
                      <Label className="text-ink-500">Demographic</Label>
                      <Body className="font-weight-bold">{selectedLead.score_breakdown.demographic} pts</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-ink-500">Behavioral</Label>
                      <Body className="font-weight-bold">{selectedLead.score_breakdown.behavioral} pts</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-ink-500">Engagement</Label>
                      <Body className="font-weight-bold">{selectedLead.score_breakdown.engagement} pts</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label className="text-ink-500">Fit</Label>
                      <Body className="font-weight-bold">{selectedLead.score_breakdown.fit} pts</Body>
                    </Stack>
                  </Grid>
                </Stack>
              </Card>

              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label className="text-ink-500">Estimated Value</Label>
                  <Body className="font-weight-bold text-h6-md">${selectedLead.estimated_value.toLocaleString()}</Body>
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
