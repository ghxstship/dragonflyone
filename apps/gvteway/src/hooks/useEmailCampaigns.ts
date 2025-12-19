'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { log } from '@ghxstship/config';

export interface EmailCampaign {
  id: string;
  name: string;
  description?: string;
  campaign_type: 'one_time' | 'automated' | 'drip' | 'triggered' | 'ab_test';
  event_id?: string;
  template_id?: string;
  subject: string;
  preview_text?: string;
  from_name: string;
  from_email: string;
  reply_to?: string;
  html_content: string;
  text_content?: string;
  audience_type: 'all' | 'segment' | 'list' | 'manual';
  audience_segment_id?: string;
  audience_list_ids?: string[];
  audience_filters?: Record<string, unknown>;
  scheduled_at?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  is_ab_test: boolean;
  ab_test_config?: Record<string, unknown>;
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  template?: {
    id: string;
    name: string;
    thumbnail_url?: string;
  };
  event?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
}

// Demo data for fallback
const DEMO_EMAIL_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'EC-001',
    name: 'Summer Fest Lineup Reveal',
    campaign_type: 'one_time',
    subject: '🎉 The Summer Fest 2025 Lineup is HERE!',
    preview_text: 'Check out this year\'s incredible artists...',
    from_name: 'Summer Fest',
    from_email: 'hello@summerfest.com',
    html_content: '<h1>Lineup Reveal</h1>',
    audience_type: 'all',
    status: 'sent',
    is_ab_test: false,
    sent_at: '2024-11-15T10:00:00Z',
    stats: { sent: 45000, delivered: 44100, opened: 22050, clicked: 8820, bounced: 450, unsubscribed: 45 },
    created_at: '2024-11-10T08:00:00Z',
    updated_at: '2024-11-15T10:00:00Z',
  },
  {
    id: 'EC-002',
    name: 'Early Bird Reminder',
    campaign_type: 'one_time',
    subject: '⏰ Last Chance: Early Bird Ends Tonight!',
    preview_text: 'Don\'t miss your chance to save 20%',
    from_name: 'Summer Fest',
    from_email: 'tickets@summerfest.com',
    html_content: '<h1>Early Bird</h1>',
    audience_type: 'segment',
    status: 'scheduled',
    is_ab_test: false,
    scheduled_at: '2024-12-01T08:00:00Z',
    stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 },
    created_at: '2024-11-20T14:00:00Z',
    updated_at: '2024-11-20T14:00:00Z',
  },
  {
    id: 'EC-003',
    name: 'VIP Upgrade Offer',
    campaign_type: 'triggered',
    subject: '✨ Exclusive VIP Upgrade Opportunity',
    preview_text: 'You\'re invited to upgrade your experience',
    from_name: 'Summer Fest VIP',
    from_email: 'vip@summerfest.com',
    html_content: '<h1>VIP Upgrade</h1>',
    audience_type: 'segment',
    status: 'sending',
    is_ab_test: false,
    stats: { sent: 2500, delivered: 2450, opened: 980, clicked: 392, bounced: 25, unsubscribed: 5 },
    created_at: '2024-11-18T11:00:00Z',
    updated_at: '2024-11-22T15:30:00Z',
  },
  {
    id: 'EC-004',
    name: 'Welcome Series - Day 1',
    campaign_type: 'drip',
    subject: 'Welcome to Summer Fest! 🎶',
    preview_text: 'Thanks for joining our community',
    from_name: 'Summer Fest',
    from_email: 'hello@summerfest.com',
    html_content: '<h1>Welcome</h1>',
    audience_type: 'list',
    status: 'draft',
    is_ab_test: false,
    stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 },
    created_at: '2024-11-21T09:00:00Z',
    updated_at: '2024-11-21T09:00:00Z',
  },
];

export const emailCampaignKeys = {
  all: ['email-campaigns'] as const,
  list: (filters?: Record<string, string>) => [...emailCampaignKeys.all, 'list', filters] as const,
  detail: (id: string) => [...emailCampaignKeys.all, 'detail', id] as const,
};

interface FetchCampaignsParams {
  status?: string;
  campaign_type?: string;
  page?: number;
  limit?: number;
}

async function fetchEmailCampaigns(params?: FetchCampaignsParams): Promise<{ data: EmailCampaign[]; pagination: { total: number; page: number; limit: number } }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.campaign_type) searchParams.set('campaign_type', params.campaign_type);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`/api/marketing/campaigns?${searchParams.toString()}`);
  
  if (response.status === 401) {
    return { data: DEMO_EMAIL_CAMPAIGNS, pagination: { total: DEMO_EMAIL_CAMPAIGNS.length, page: 1, limit: 20 } };
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch email campaigns');
  }
  
  return response.json();
}

interface CreateEmailCampaignData {
  name: string;
  campaign_type: EmailCampaign['campaign_type'];
  subject: string;
  preview_text?: string;
  from_name: string;
  from_email: string;
  reply_to?: string;
  html_content: string;
  text_content?: string;
  audience_type: EmailCampaign['audience_type'];
  audience_segment_id?: string;
  scheduled_at?: string;
  event_id?: string;
}

async function createEmailCampaign(data: CreateEmailCampaignData): Promise<EmailCampaign> {
  const response = await fetch('/api/marketing/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'Failed to create campaign');
  }
  
  const result = await response.json();
  return result.data;
}

async function updateEmailCampaign({ id, ...data }: Partial<EmailCampaign> & { id: string }): Promise<void> {
  const response = await fetch(`/api/marketing/campaigns/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update campaign');
  }
}

async function deleteEmailCampaign(id: string): Promise<void> {
  const response = await fetch(`/api/marketing/campaigns/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete campaign');
  }
}

async function sendEmailCampaign(id: string): Promise<void> {
  const response = await fetch(`/api/marketing/campaigns/${id}/send`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to send campaign');
  }
}

export function useEmailCampaigns(params?: FetchCampaignsParams) {
  return useQuery({
    queryKey: emailCampaignKeys.list(params as Record<string, string>),
    queryFn: () => fetchEmailCampaigns(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEmailCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmailCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.all });
    },
    onError: (error) => {
      log.error('Failed to create email campaign:', error);
    },
  });
}

export function useUpdateEmailCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmailCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.all });
    },
    onError: (error) => {
      log.error('Failed to update email campaign:', error);
    },
  });
}

export function useDeleteEmailCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmailCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.all });
    },
    onError: (error) => {
      log.error('Failed to delete email campaign:', error);
    },
  });
}

export function useSendEmailCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendEmailCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.all });
    },
    onError: (error) => {
      log.error('Failed to send email campaign:', error);
    },
  });
}

export function useEmailCampaignsData(params?: FetchCampaignsParams) {
  const campaignsQuery = useEmailCampaigns(params);
  const createMutation = useCreateEmailCampaign();
  const updateMutation = useUpdateEmailCampaign();
  const deleteMutation = useDeleteEmailCampaign();
  const sendMutation = useSendEmailCampaign();

  return {
    campaigns: campaignsQuery.data?.data || [],
    pagination: campaignsQuery.data?.pagination,
    isLoading: campaignsQuery.isLoading,
    error: campaignsQuery.error,
    
    createCampaign: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    
    updateCampaign: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    
    deleteCampaign: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    
    sendCampaign: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    
    refetch: campaignsQuery.refetch,
  };
}
