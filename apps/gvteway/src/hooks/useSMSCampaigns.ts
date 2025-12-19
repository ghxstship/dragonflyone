'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DEMO_SMS_CAMPAIGNS,
  DEMO_AUDIENCE_SEGMENTS,
  type DemoSMSCampaign,
  type DemoAudienceSegment,
} from '@/lib/demo-data';

export interface SMSCampaign {
  id: string;
  name: string;
  message: string;
  event_id?: string;
  event_name?: string;
  audience_segment_id?: string;
  audience_size: number;
  sent_count: number;
  delivered_count: number;
  click_count: number;
  status: 'Draft' | 'Scheduled' | 'Sending' | 'Completed' | 'Paused';
  scheduled_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AudienceSegment {
  id: string;
  name: string;
  count: number;
  description?: string;
}

interface SMSCampaignsResponse {
  campaigns: SMSCampaign[];
}

interface CreateCampaignInput {
  name: string;
  message: string;
  eventId?: string;
  audienceSegmentId?: string;
  scheduledDate?: string;
}

function mapDemoToSMSCampaign(demo: DemoSMSCampaign): SMSCampaign {
  return {
    id: demo.id,
    name: demo.name,
    message: demo.message,
    event_name: demo.eventName,
    audience_size: demo.audienceSize,
    sent_count: demo.sentCount,
    delivered_count: demo.deliveredCount,
    click_count: demo.clickCount,
    status: demo.status as SMSCampaign['status'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function mapDemoToAudienceSegment(demo: DemoAudienceSegment): AudienceSegment {
  return {
    id: demo.id,
    name: demo.name,
    count: demo.count,
  };
}

async function fetchSMSCampaigns(filters?: { eventId?: string; status?: string }): Promise<SMSCampaign[]> {
  const params = new URLSearchParams();
  if (filters?.eventId) params.set('eventId', filters.eventId);
  if (filters?.status) params.set('status', filters.status);

  const url = `/api/sms-campaigns${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    return DEMO_SMS_CAMPAIGNS.map(mapDemoToSMSCampaign);
  }
  
  const data: SMSCampaignsResponse = await response.json();
  
  if (!data.campaigns || data.campaigns.length === 0) {
    return DEMO_SMS_CAMPAIGNS.map(mapDemoToSMSCampaign);
  }
  
  return data.campaigns;
}

async function fetchAudienceSegments(): Promise<AudienceSegment[]> {
  try {
    const response = await fetch('/api/audience-segments');
    if (!response.ok) {
      return DEMO_AUDIENCE_SEGMENTS.map(mapDemoToAudienceSegment);
    }
    const data = await response.json();
    if (!data.segments || data.segments.length === 0) {
      return DEMO_AUDIENCE_SEGMENTS.map(mapDemoToAudienceSegment);
    }
    return data.segments;
  } catch {
    return DEMO_AUDIENCE_SEGMENTS.map(mapDemoToAudienceSegment);
  }
}

async function createCampaign(input: CreateCampaignInput): Promise<SMSCampaign> {
  const response = await fetch('/api/sms-campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create campaign');
  }
  
  const data = await response.json();
  return data.campaign;
}

async function updateCampaignStatus(id: string, status: string): Promise<SMSCampaign> {
  const response = await fetch('/api/sms-campaigns', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update campaign');
  }
  
  const data = await response.json();
  return data.campaign;
}

async function deleteCampaign(id: string): Promise<void> {
  const response = await fetch(`/api/sms-campaigns?id=${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete campaign');
  }
}

export function useSMSCampaignsData(filters?: { eventId?: string; status?: string }) {
  const queryClient = useQueryClient();

  const campaignsQuery = useQuery({
    queryKey: ['sms-campaigns', filters],
    queryFn: () => fetchSMSCampaigns(filters),
    staleTime: 30000,
  });

  const audienceQuery = useQuery({
    queryKey: ['audience-segments'],
    queryFn: fetchAudienceSegments,
    staleTime: 60000,
  });

  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateCampaignStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns'] });
    },
  });

  return {
    campaigns: campaignsQuery.data || [],
    audienceSegments: audienceQuery.data || [],
    isLoading: campaignsQuery.isLoading || audienceQuery.isLoading,
    error: campaignsQuery.error || audienceQuery.error,
    refetch: () => {
      campaignsQuery.refetch();
      audienceQuery.refetch();
    },
    createCampaign: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    deleteCampaign: deleteMutation.mutateAsync,
  };
}
