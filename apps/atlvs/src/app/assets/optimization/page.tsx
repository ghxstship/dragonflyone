'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
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

interface OptimizationRecommendation {
  id: string;
  type: 'underutilized' | 'overutilized' | 'maintenance_due' | 'replacement' | 'consolidation' | 'reallocation';
  priority: 'high' | 'medium' | 'low';
  asset_id: string;
  asset_name: string;
  category: string;
  current_utilization: number;
  target_utilization: number;
  recommendation: string;
  potential_savings: number;
  action_items: string[];
  status: 'pending' | 'in_progress' | 'implemented' | 'dismissed';
}

interface UsagePattern {
  asset_id: string;
  asset_name: string;
  category: string;
  avg_utilization: number;
  peak_utilization: number;
  idle_days: number;
  total_checkouts: number;
  avg_checkout_duration: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

const mockRecommendations: OptimizationRecommendation[] = [
  { id: 'REC-001', type: 'underutilized', priority: 'high', asset_id: 'AST-001', asset_name: 'LED Wall Panel Set A', category: 'Video', current_utilization: 15, target_utilization: 60, recommendation: 'Consider rental pooling or sale. Asset has been idle for 85% of the quarter.', potential_savings: 25000, action_items: ['List on rental marketplace', 'Get appraisal for sale', 'Review upcoming project needs'], status: 'pending' },
  { id: 'REC-002', type: 'overutilized', priority: 'medium', asset_id: 'AST-002', asset_name: 'Meyer Sound Line Array', category: 'Audio', current_utilization: 95, target_utilization: 75, recommendation: 'High demand asset. Consider purchasing additional units to reduce scheduling conflicts.', potential_savings: 15000, action_items: ['Request capital budget', 'Evaluate rental costs vs purchase', 'Review booking conflicts'], status: 'in_progress' },
  { id: 'REC-003', type: 'maintenance_due', priority: 'high', asset_id: 'AST-003', asset_name: 'Lighting Console grandMA3', category: 'Lighting', current_utilization: 70, target_utilization: 70, recommendation: 'Preventive maintenance overdue by 30 days. Schedule service to avoid downtime.', potential_savings: 5000, action_items: ['Schedule maintenance window', 'Arrange backup console', 'Update service records'], status: 'pending' },
  { id: 'REC-004', type: 'consolidation', priority: 'low', asset_id: 'AST-004', asset_name: 'Cable Inventory', category: 'Infrastructure', current_utilization: 40, target_utilization: 60, recommendation: 'Multiple cable types with low utilization. Consolidate to standard types.', potential_savings: 8000, action_items: ['Audit cable inventory', 'Identify redundant types', 'Create standardization plan'], status: 'pending' },
  { id: 'REC-005', type: 'replacement', priority: 'medium', asset_id: 'AST-005', asset_name: 'PTZ Camera Set', category: 'Video', current_utilization: 65, target_utilization: 70, recommendation: 'Asset approaching end of life. Plan replacement within 6 months.', potential_savings: 12000, action_items: ['Research replacement models', 'Get quotes', 'Plan transition timeline'], status: 'pending' },
];

const mockUsagePatterns: UsagePattern[] = [
  { asset_id: 'AST-001', asset_name: 'LED Wall Panel Set A', category: 'Video', avg_utilization: 15, peak_utilization: 45, idle_days: 78, total_checkouts: 4, avg_checkout_duration: 3, trend: 'decreasing' },
  { asset_id: 'AST-002', asset_name: 'Meyer Sound Line Array', category: 'Audio', avg_utilization: 95, peak_utilization: 100, idle_days: 5, total_checkouts: 28, avg_checkout_duration: 2, trend: 'increasing' },
  { asset_id: 'AST-003', asset_name: 'Lighting Console grandMA3', category: 'Lighting', avg_utilization: 70, peak_utilization: 90, idle_days: 27, total_checkouts: 18, avg_checkout_duration: 3, trend: 'stable' },
  { asset_id: 'AST-006', asset_name: 'Truss System', category: 'Rigging', avg_utilization: 55, peak_utilization: 85, idle_days: 40, total_checkouts: 12, avg_checkout_duration: 4, trend: 'stable' },
  { asset_id: 'AST-007', asset_name: 'Generator 100kW', category: 'Power', avg_utilization: 30, peak_utilization: 60, idle_days: 63, total_checkouts: 6, avg_checkout_duration: 2, trend: 'decreasing' },
];

export default function AssetOptimizationPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>(mockRecommendations);
  const [usagePatterns, setUsagePatterns] = useState<UsagePattern[]>(mockUsagePatterns);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [selectedRec, setSelectedRec] = useState<OptimizationRecommendation | null>(null);
  const [filter, setFilter] = useState({ type: '', priority: '', status: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImplement = (recId: string) => {
    setRecommendations(recommendations.map(r =>
      r.id === recId ? { ...r, status: 'implemented' as const } : r
    ));
    setSuccess('Recommendation marked as implemented');
  };

  const handleDismiss = (recId: string) => {
    setRecommendations(recommendations.map(r =>
      r.id === recId ? { ...r, status: 'dismissed' as const } : r
    ));
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      underutilized: 'bg-yellow-500 text-black',
      overutilized: 'bg-red-500 text-white',
      maintenance_due: 'bg-orange-500 text-white',
      replacement: 'bg-purple-500 text-white',
      consolidation: 'bg-blue-500 text-white',
      reallocation: 'bg-green-500 text-white',
    };
    return <Badge className={colors[type] || ''}>{type.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-500 text-white',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-green-500 text-white',
    };
    return <Badge className={colors[priority] || ''}>{priority}</Badge>;
  };

  const getUtilizationColor = (util: number) => {
    if (util < 30) return 'text-red-400';
    if (util < 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '➡️';
    }
  };

  const filteredRecs = recommendations.filter(r => {
    const matchesType = !filter.type || r.type === filter.type;
    const matchesPriority = !filter.priority || r.priority === filter.priority;
    const matchesStatus = !filter.status || r.status === filter.status;
    return matchesType && matchesPriority && matchesStatus;
  });

  const totalSavings = recommendations
    .filter(r => r.status !== 'dismissed')
    .reduce((sum, r) => sum + r.potential_savings, 0);

  const pendingCount = recommendations.filter(r => r.status === 'pending').length;
  const highPriorityCount = recommendations.filter(r => r.priority === 'high' && r.status === 'pending').length;

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Section className="border-b-2 border-black py-8 mb-8">
          <Stack direction="horizontal" className="justify-between items-center">
            <Stack>
              <Display>INVENTORY OPTIMIZATION</Display>
              <Body className="mt-2 text-gray-600">
                Usage patterns and optimization recommendations
              </Body>
            </Stack>
            <Button variant="solid" onClick={() => router.push('/assets')}>
              View All Assets
            </Button>
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
            label="Pending Actions"
            value={pendingCount}
            icon={<span>📋</span>}
          />
          <StatCard
            label="High Priority"
            value={highPriorityCount}
            icon={<span>🔴</span>}
          />
          <StatCard
            label="Potential Savings"
            value={`$${(totalSavings / 1000).toFixed(0)}K`}
            icon={<span>💰</span>}
          />
          <StatCard
            label="Avg Utilization"
            value={`${Math.round(usagePatterns.reduce((sum, p) => sum + p.avg_utilization, 0) / usagePatterns.length)}%`}
            icon={<span>📊</span>}
          />
        </Grid>

        <Tabs>
          <TabsList>
            <Tab active={activeTab === 'recommendations'} onClick={() => setActiveTab('recommendations')}>
              Recommendations ({pendingCount})
            </Tab>
            <Tab active={activeTab === 'patterns'} onClick={() => setActiveTab('patterns')}>
              Usage Patterns
            </Tab>
            <Tab active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
              Implementation History
            </Tab>
          </TabsList>
        </Tabs>

        {activeTab === 'recommendations' && (
          <Stack gap={6} className="mt-6">
            <Stack direction="horizontal" gap={4}>
              <Field label="" className="w-48">
                <Select
                  value={filter.type}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="underutilized">Underutilized</option>
                  <option value="overutilized">Overutilized</option>
                  <option value="maintenance_due">Maintenance Due</option>
                  <option value="replacement">Replacement</option>
                  <option value="consolidation">Consolidation</option>
                </Select>
              </Field>
              <Field label="" className="w-48">
                <Select
                  value={filter.priority}
                  onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Select>
              </Field>
              <Field label="" className="w-48">
                <Select
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="implemented">Implemented</option>
                  <option value="dismissed">Dismissed</option>
                </Select>
              </Field>
            </Stack>

            <Stack gap={4}>
              {filteredRecs.map(rec => (
                <Card key={rec.id} className={`p-6 border-2 ${rec.priority === 'high' ? 'border-red-200' : 'border-gray-200'}`}>
                  <Grid cols={4} gap={6}>
                    <Stack gap={2}>
                      <Stack direction="horizontal" gap={2}>
                        {getTypeBadge(rec.type)}
                        {getPriorityBadge(rec.priority)}
                      </Stack>
                      <H3>{rec.asset_name}</H3>
                      <Body className="text-sm text-gray-500">{rec.category}</Body>
                    </Stack>
                    <Stack gap={2}>
                      <Label className="text-gray-500">Utilization</Label>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Body className={`text-2xl font-bold ${getUtilizationColor(rec.current_utilization)}`}>
                          {rec.current_utilization}%
                        </Body>
                        <Body className="text-gray-400">→</Body>
                        <Body className="text-lg text-gray-600">{rec.target_utilization}%</Body>
                      </Stack>
                    </Stack>
                    <Stack gap={2}>
                      <Label className="text-gray-500">Potential Savings</Label>
                      <Body className="text-2xl font-bold text-green-600">
                        ${rec.potential_savings.toLocaleString()}
                      </Body>
                    </Stack>
                    <Stack gap={2} className="items-end">
                      <Badge variant={rec.status === 'pending' ? 'outline' : 'solid'}>
                        {rec.status.replace('_', ' ')}
                      </Badge>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedRec(rec)}>
                          Details
                        </Button>
                        {rec.status === 'pending' && (
                          <Button variant="solid" size="sm" onClick={() => handleImplement(rec.id)}>
                            Implement
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Grid>
                  <Body className="mt-4 text-gray-600">{rec.recommendation}</Body>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}

        {activeTab === 'patterns' && (
          <Table className="mt-6">
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Avg Utilization</TableHead>
                <TableHead>Peak</TableHead>
                <TableHead>Idle Days</TableHead>
                <TableHead>Checkouts</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usagePatterns.map(pattern => (
                <TableRow key={pattern.asset_id}>
                  <TableCell>
                    <Body className="font-bold">{pattern.asset_name}</Body>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{pattern.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Body className={`font-bold ${getUtilizationColor(pattern.avg_utilization)}`}>
                      {pattern.avg_utilization}%
                    </Body>
                  </TableCell>
                  <TableCell>{pattern.peak_utilization}%</TableCell>
                  <TableCell>
                    <Body className={pattern.idle_days > 60 ? 'text-red-500' : ''}>
                      {pattern.idle_days} days
                    </Body>
                  </TableCell>
                  <TableCell>{pattern.total_checkouts}</TableCell>
                  <TableCell>
                    {getTrendIcon(pattern.trend)} {pattern.trend}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {activeTab === 'history' && (
          <Stack gap={4} className="mt-6">
            {recommendations.filter(r => r.status === 'implemented').map(rec => (
              <Card key={rec.id} className="p-4 border border-green-200 bg-green-50">
                <Stack direction="horizontal" className="justify-between items-center">
                  <Stack gap={1}>
                    <Body className="font-bold">{rec.asset_name}</Body>
                    <Body className="text-sm text-gray-600">{rec.recommendation}</Body>
                  </Stack>
                  <Stack className="text-right">
                    <Body className="text-green-600 font-bold">
                      ${rec.potential_savings.toLocaleString()} saved
                    </Body>
                    <Badge className="bg-green-500 text-white">Implemented</Badge>
                  </Stack>
                </Stack>
              </Card>
            ))}
            {recommendations.filter(r => r.status === 'implemented').length === 0 && (
              <Card className="p-8 text-center">
                <Body className="text-gray-500">No implemented recommendations yet</Body>
              </Card>
            )}
          </Stack>
        )}

        <Modal
          open={!!selectedRec}
          onClose={() => setSelectedRec(null)}
          title="Recommendation Details"
        >
          {selectedRec && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                {getTypeBadge(selectedRec.type)}
                {getPriorityBadge(selectedRec.priority)}
              </Stack>
              <H2>{selectedRec.asset_name}</H2>
              <Body>{selectedRec.recommendation}</Body>
              
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label className="text-gray-500">Current Utilization</Label>
                  <Body className="text-2xl font-bold">{selectedRec.current_utilization}%</Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-gray-500">Target Utilization</Label>
                  <Body className="text-2xl font-bold">{selectedRec.target_utilization}%</Body>
                </Stack>
              </Grid>

              <Stack gap={2}>
                <Label className="text-gray-500">Action Items</Label>
                {selectedRec.action_items.map((item, idx) => (
                  <Card key={idx} className="p-3 border">
                    <Stack direction="horizontal" gap={2}>
                      <Body>{idx + 1}.</Body>
                      <Body>{item}</Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>

              <Stack direction="horizontal" gap={4}>
                {selectedRec.status === 'pending' && (
                  <>
                    <Button variant="solid" onClick={() => { handleImplement(selectedRec.id); setSelectedRec(null); }}>
                      Mark Implemented
                    </Button>
                    <Button variant="outline" onClick={() => { handleDismiss(selectedRec.id); setSelectedRec(null); }}>
                      Dismiss
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setSelectedRec(null)}>
                  Close
                </Button>
              </Stack>
            </Stack>
          )}
        </Modal>
      </Container>
    </Section>
  );
}
