'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Mail, Users, BarChart3, Play, Pause, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Body,
  Button,
  Form,
  H1,
  H3,
  Input,
  Label,
  Select,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success';
      case 'paused':
        return 'bg-warning/20 text-warning';
      case 'completed':
        return 'bg-primary/20 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const totalEnrolled = campaigns.reduce((sum, c) => sum + c.enrolled_count, 0);
  const totalCompleted = campaigns.reduce((sum, c) => sum + c.completed_count, 0);
  const avgConversionRate = campaigns.length
    ? Math.round(campaigns.reduce((sum, c) => sum + c.conversion_rate, 0) / campaigns.length)
    : 0;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading campaigns...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <Body className="text-destructive">Failed to load nurture campaigns</Body>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['nurture-campaigns'] })}
            className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-button"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/leads"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">Lead Nurturing</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Automated campaigns to nurture leads through the sales funnel
            </Body>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <Text className="text-body-sm font-weight-medium">New Campaign</Text>
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Active Campaigns</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">
            {campaigns.filter((c) => c.status === 'active').length}
          </Body>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-success" />
            <Text className="text-body-sm text-muted-foreground">Total Enrolled</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-success">{totalEnrolled}</Body>
        </div>
        <div className="bg-background border-2 border-secondary/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-secondary" />
            <Text className="text-body-sm text-muted-foreground">Completed</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-secondary">{totalCompleted}</Body>
        </div>
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-warning" />
            <Text className="text-body-sm text-muted-foreground">Avg Conversion</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-warning">{avgConversionRate}%</Body>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:border-primary"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
        </Select>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No nurture campaigns
          </H3>
          <Body className="text-body-sm text-muted-foreground mb-4">
            Create automated campaigns to nurture your leads
          </Body>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button"
          >
            <Plus className="h-4 w-4" />
            Create First Campaign
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-background border-2 border-border rounded-card overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <H3 className="text-body-lg font-weight-semibold text-foreground">
                        {campaign.name}
                      </H3>
                      <Text className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Text>
                    </div>
                    {campaign.description && (
                      <Body className="text-body-sm text-muted-foreground">{campaign.description}</Body>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-body-xs text-muted-foreground">
                      <Text>Trigger: {campaign.trigger_type.replace('_', ' ')}</Text>
                      {campaign.target_segment && (
                        <Text>Segment: {campaign.target_segment}</Text>
                      )}
                      <Text>{campaign.steps.length} steps</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.status === 'active' ? (
                      <Button
                        onClick={() => toggleCampaign.mutate({ id: campaign.id, status: 'paused' })}
                        className="p-2 hover:bg-warning/10 rounded-button transition-colors"
                        title="Pause Campaign"
                      >
                        <Pause className="h-4 w-4 text-warning" />
                      </Button>
                    ) : campaign.status === 'paused' || campaign.status === 'draft' ? (
                      <Button
                        onClick={() => toggleCampaign.mutate({ id: campaign.id, status: 'active' })}
                        className="p-2 hover:bg-success/10 rounded-button transition-colors"
                        title="Activate Campaign"
                      >
                        <Play className="h-4 w-4 text-success" />
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="icon" className="p-2">
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      onClick={() => {
                        if (confirm('Delete this campaign?')) {
                          deleteCampaign.mutate(campaign.id);
                        }
                      }}
                      className="p-2 hover:bg-destructive/10 rounded-button transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <Body className="text-h4-md font-weight-bold text-foreground">{campaign.enrolled_count}</Body>
                    <Body className="text-body-xs text-muted-foreground">Enrolled</Body>
                  </div>
                  <div className="text-center">
                    <Body className="text-h4-md font-weight-bold text-foreground">{campaign.completed_count}</Body>
                    <Body className="text-body-xs text-muted-foreground">Completed</Body>
                  </div>
                  <div className="text-center">
                    <Body className="text-h4-md font-weight-bold text-foreground">{campaign.conversion_rate}%</Body>
                    <Body className="text-body-xs text-muted-foreground">Conversion</Body>
                  </div>
                  <div className="text-center">
                    <Body className="text-h4-md font-weight-bold text-foreground">
                      {campaign.enrolled_count - campaign.completed_count}
                    </Body>
                    <Body className="text-body-xs text-muted-foreground">In Progress</Body>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <Body className="text-body-xs text-muted-foreground mb-2">Campaign Steps:</Body>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {campaign.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div className={`px-3 py-1.5 rounded text-body-xs whitespace-nowrap ${
                          step.type === 'email' ? 'bg-primary/10 text-primary' :
                          step.type === 'wait' ? 'bg-muted text-muted-foreground' :
                          step.type === 'task' ? 'bg-secondary/10 text-secondary' :
                          'bg-accent/10 text-accent'
                        }`}>
                          {step.type === 'wait' ? `Wait ${step.delay_days}d` : step.name}
                        </div>
                        {index < campaign.steps.length - 1 && (
                          <div className="w-4 h-0.5 bg-border mx-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-lg w-full mx-4">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-4">
              Create Nurture Campaign
            </H3>
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
              className="space-y-4"
            >
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Campaign Name *
                </Label>
                <Input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., New Lead Welcome Series"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Description
                </Label>
                <Textarea
                  name="description"
                  rows={2}
                  placeholder="Brief description of this campaign"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Trigger Type *
                  </Label>
                  <Select
                    name="trigger_type"
                    required
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  >
                    <option value="manual">Manual Enrollment</option>
                    <option value="action_based">Action Based</option>
                    <option value="time_delay">Time Delay</option>
                    <option value="score_based">Score Based</option>
                  </Select>
                </div>
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Target Segment
                  </Label>
                  <Input
                    type="text"
                    name="target_segment"
                    placeholder="e.g., New Leads"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCampaign.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
