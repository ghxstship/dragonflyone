'use client';

import { useState } from 'react';
import { Plus, Mail, Play, Pause, Edit2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Form,
  Grid,
  H3,
  Input,
  Label,
  MainContent,
  Modal,
  Select,
  Skeleton,
  Stack,
  StatCard,
  Text,
  Textarea,
} from '@ghxstship/ui';

interface NurtureCampaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  trigger_type: 'manual' | 'time_delay' | 'action_based' | 'score_based';
  target_segment?: string;
  steps: NurtureStep[];
  enrolled_count: number;
  completed_count: number;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
}

interface NurtureStep {
  id: string;
  type: 'email' | 'sms' | 'task' | 'wait';
  name: string;
  delay_days?: number;
  template_id?: string;
  completed_count?: number;
}

const DEMO_CAMPAIGNS: NurtureCampaign[] = [
  {
    id: 'NC-001',
    name: 'New Lead Welcome Series',
    description: 'Automated welcome sequence for new leads',
    status: 'active',
    trigger_type: 'action_based',
    target_segment: 'New Leads',
    steps: [
      { id: 's1', type: 'email', name: 'Welcome Email', completed_count: 145 },
      { id: 's2', type: 'wait', name: 'Wait 3 Days', delay_days: 3 },
      { id: 's3', type: 'email', name: 'Introduction to Services', completed_count: 98 },
      { id: 's4', type: 'task', name: 'Schedule Follow-up Call', completed_count: 67 },
    ],
    enrolled_count: 156,
    completed_count: 67,
    conversion_rate: 43,
    created_at: '2024-11-15T10:00:00Z',
    updated_at: '2024-12-01T15:30:00Z',
  },
  {
    id: 'NC-002',
    name: 'Re-engagement Campaign',
    description: 'Win back inactive leads',
    status: 'active',
    trigger_type: 'score_based',
    target_segment: 'Inactive 30+ Days',
    steps: [
      { id: 's1', type: 'email', name: 'We Miss You', completed_count: 89 },
      { id: 's2', type: 'wait', name: 'Wait 7 Days', delay_days: 7 },
      { id: 's3', type: 'email', name: 'Special Offer', completed_count: 45 },
    ],
    enrolled_count: 112,
    completed_count: 34,
    conversion_rate: 30,
    created_at: '2024-10-20T09:00:00Z',
    updated_at: '2024-11-28T11:00:00Z',
  },
  {
    id: 'NC-003',
    name: 'Event Follow-up Sequence',
    description: 'Post-event nurture for attendees',
    status: 'paused',
    trigger_type: 'manual',
    target_segment: 'Event Attendees',
    steps: [
      { id: 's1', type: 'email', name: 'Thank You for Attending', completed_count: 234 },
      { id: 's2', type: 'wait', name: 'Wait 2 Days', delay_days: 2 },
      { id: 's3', type: 'email', name: 'Event Resources', completed_count: 189 },
      { id: 's4', type: 'wait', name: 'Wait 5 Days', delay_days: 5 },
      { id: 's5', type: 'email', name: 'Book a Consultation', completed_count: 78 },
    ],
    enrolled_count: 250,
    completed_count: 78,
    conversion_rate: 31,
    created_at: '2024-09-15T14:00:00Z',
    updated_at: '2024-11-01T09:00:00Z',
  },
];

export default function LeadNurturingPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['nurture-campaigns', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const response = await fetch(`/api/leads/nurturing?${params}`);
      if (!response.ok) {
        return { campaigns: DEMO_CAMPAIGNS };
      }
      const result = await response.json();
      return result.campaigns?.length ? result : { campaigns: DEMO_CAMPAIGNS };
    },
  });

  const campaigns: NurtureCampaign[] = data?.campaigns || DEMO_CAMPAIGNS;

  const filteredCampaigns = statusFilter
    ? campaigns.filter((c) => c.status === statusFilter)
    : campaigns;

  const createCampaign = useMutation({
    mutationFn: async (campaign: Partial<NurtureCampaign>) => {
      const response = await fetch('/api/leads/nurturing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
      });
      if (!response.ok) throw new Error('Failed to create campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurture-campaigns'] });
      setShowCreateModal(false);
    },
  });

  const toggleCampaign = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/leads/nurturing/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurture-campaigns'] });
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/leads/nurturing/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nurture-campaigns'] });
    },
  });

  const getStatusVariant = (status: string): 'success' | 'warning' | 'info' | 'error' => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'info';
      default: return 'info';
    }
  };

  const totalEnrolled = campaigns.reduce((sum, c) => sum + c.enrolled_count, 0);
  const totalCompleted = campaigns.reduce((sum, c) => sum + c.completed_count, 0);
  const avgConversionRate = campaigns.length
    ? Math.round(campaigns.reduce((sum, c) => sum + c.conversion_rate, 0) / campaigns.length)
    : 0;

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Lead Nurturing" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={6}>
              <Grid cols={4} gap={4}>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </Grid>
              <Skeleton className="h-64" />
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Lead Nurturing" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load nurture campaigns"
              description="There was an error loading your campaigns. Please try again."
              action={{ label: 'Retry', onClick: () => queryClient.invalidateQueries({ queryKey: ['nurture-campaigns'] }) }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Lead Nurturing"
        subtitle="Automated campaigns to nurture leads through the sales funnel"
      />
      <Box className="px-6 py-3 border-b border-border flex items-center justify-end">
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </Box>
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Grid cols={4} gap={4}>
              <StatCard
                value={String(campaigns.filter((c) => c.status === 'active').length)}
                label="Active Campaigns"
              />
              <StatCard
                value={String(totalEnrolled)}
                label="Total Enrolled"
              />
              <StatCard
                value={String(totalCompleted)}
                label="Completed"
              />
              <StatCard
                value={`${avgConversionRate}%`}
                label="Avg Conversion"
              />
            </Grid>

            <Box>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
              </Select>
            </Box>

            {filteredCampaigns.length === 0 ? (
              <EmptyState
                title="No nurture campaigns"
                description="Create automated campaigns to nurture your leads"
                icon={<Mail className="h-12 w-12" />}
                action={{ label: 'Create First Campaign', onClick: () => setShowCreateModal(true) }}
              />
            ) : (
              <Stack gap={4}>
                {filteredCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="p-6">
                    <Stack direction="horizontal" className="justify-between mb-4">
                      <Stack gap={2}>
                        <Stack direction="horizontal" gap={3} className="items-center">
                          <H3>{campaign.name}</H3>
                          <Badge variant={getStatusVariant(campaign.status)}>
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </Badge>
                        </Stack>
                        {campaign.description && (
                          <Body size="sm" className="text-muted-foreground">{campaign.description}</Body>
                        )}
                        <Stack direction="horizontal" gap={4}>
                          <Text size="xs" className="text-muted-foreground">Trigger: {campaign.trigger_type.replace('_', ' ')}</Text>
                          {campaign.target_segment && (
                            <Text size="xs" className="text-muted-foreground">Segment: {campaign.target_segment}</Text>
                          )}
                          <Text size="xs" className="text-muted-foreground">{campaign.steps.length} steps</Text>
                        </Stack>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        {campaign.status === 'active' ? (
                          <Button
                            variant="ghost"
                            onClick={() => toggleCampaign.mutate({ id: campaign.id, status: 'paused' })}
                          >
                            <Pause className="h-4 w-4 text-warning" />
                          </Button>
                        ) : campaign.status === 'paused' || campaign.status === 'draft' ? (
                          <Button
                            variant="ghost"
                            onClick={() => toggleCampaign.mutate({ id: campaign.id, status: 'active' })}
                          >
                            <Play className="h-4 w-4 text-success" />
                          </Button>
                        ) : null}
                        <Button variant="ghost">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Delete this campaign?')) {
                              deleteCampaign.mutate(campaign.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </Stack>
                    </Stack>

                    <Grid cols={4} gap={4} className="mb-4">
                      <Box className="text-center">
                        <Body className="text-h4-md font-weight-bold">{campaign.enrolled_count}</Body>
                        <Body size="xs" className="text-muted-foreground">Enrolled</Body>
                      </Box>
                      <Box className="text-center">
                        <Body className="text-h4-md font-weight-bold">{campaign.completed_count}</Body>
                        <Body size="xs" className="text-muted-foreground">Completed</Body>
                      </Box>
                      <Box className="text-center">
                        <Body className="text-h4-md font-weight-bold">{campaign.conversion_rate}%</Body>
                        <Body size="xs" className="text-muted-foreground">Conversion</Body>
                      </Box>
                      <Box className="text-center">
                        <Body className="text-h4-md font-weight-bold">
                          {campaign.enrolled_count - campaign.completed_count}
                        </Body>
                        <Body size="xs" className="text-muted-foreground">In Progress</Body>
                      </Box>
                    </Grid>

                    <Box className="border-t border-border pt-4">
                      <Body size="xs" className="text-muted-foreground mb-2">Campaign Steps:</Body>
                      <Stack direction="horizontal" gap={2} className="overflow-x-auto pb-2">
                        {campaign.steps.map((step, index) => (
                          <Stack key={step.id} direction="horizontal" className="items-center">
                            <Badge variant={step.type === 'email' ? 'info' : step.type === 'task' ? 'success' : 'warning'}>
                              {step.type === 'wait' ? `Wait ${step.delay_days}d` : step.name}
                            </Badge>
                            {index < campaign.steps.length - 1 && (
                              <Box className="w-4 h-0.5 bg-border mx-1" />
                            )}
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  </Card>
                ))}
              </Stack>
            )}

            <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Nurture Campaign">
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createCampaign.mutate({
                    name: formData.get('name') as string,
                    description: formData.get('description') as string || undefined,
                    trigger_type: formData.get('trigger_type') as NurtureCampaign['trigger_type'],
                    target_segment: formData.get('target_segment') as string || undefined,
                    status: 'draft',
                    steps: [],
                    enrolled_count: 0,
                    completed_count: 0,
                    conversion_rate: 0,
                  });
                }}
              >
                <Stack gap={4}>
                  <Stack gap={2}>
                    <Label>Campaign Name *</Label>
                    <Input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g., New Lead Welcome Series"
                    />
                  </Stack>
                  <Stack gap={2}>
                    <Label>Description</Label>
                    <Textarea
                      name="description"
                      rows={2}
                      placeholder="Brief description of this campaign"
                    />
                  </Stack>
                  <Grid cols={2} gap={4}>
                    <Stack gap={2}>
                      <Label>Trigger Type *</Label>
                      <Select name="trigger_type" required>
                        <option value="manual">Manual Enrollment</option>
                        <option value="action_based">Action Based</option>
                        <option value="time_delay">Time Delay</option>
                        <option value="score_based">Score Based</option>
                      </Select>
                    </Stack>
                    <Stack gap={2}>
                      <Label>Target Segment</Label>
                      <Input
                        type="text"
                        name="target_segment"
                        placeholder="e.g., New Leads"
                      />
                    </Stack>
                  </Grid>
                  <Stack direction="horizontal" gap={3} className="justify-end pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCampaign.isPending}>
                      {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
                    </Button>
                  </Stack>
                </Stack>
              </Form>
            </Modal>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
