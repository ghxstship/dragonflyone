'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ContactInteraction {
  id: string;
  contact_id: string;
  organization_id: string;
  interaction_type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'site_visit' | 'proposal_sent' | 'contract_signed' | 'payment_received' | 'other';
  subject: string;
  body?: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
}

export interface TimelineItem {
  id: string;
  type: 'interaction' | 'lead' | 'booking' | 'proposal';
  title: string;
  description?: string;
  date: string;
  metadata?: Record<string, unknown>;
}

interface InteractionsResponse {
  interactions: ContactInteraction[];
  total: number;
  limit: number;
  offset: number;
}

interface TimelineResponse {
  timeline: TimelineItem[];
  total: number;
}

interface CreateInteractionInput {
  interaction_type: ContactInteraction['interaction_type'];
  subject: string;
  body?: string;
  metadata?: Record<string, unknown>;
  related_entity_type?: string;
  related_entity_id?: string;
}

async function fetchInteractions(
  contactId: string,
  params?: { limit?: number; offset?: number; type?: string }
): Promise<InteractionsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());
  if (params?.type) searchParams.set('type', params.type);

  const res = await fetch(`/api/contacts/${contactId}/interactions?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch interactions');
  return res.json();
}

async function fetchTimeline(contactId: string, limit?: number): Promise<TimelineResponse> {
  const searchParams = new URLSearchParams();
  if (limit) searchParams.set('limit', limit.toString());

  const res = await fetch(`/api/contacts/${contactId}/timeline?${searchParams}`);
  if (!res.ok) throw new Error('Failed to fetch timeline');
  return res.json();
}

async function createInteraction(
  contactId: string,
  input: CreateInteractionInput
): Promise<{ interaction: ContactInteraction }> {
  const res = await fetch(`/api/contacts/${contactId}/interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create interaction');
  return res.json();
}

export function useContactInteractions(
  contactId: string | undefined,
  params?: { limit?: number; offset?: number; type?: string }
) {
  return useQuery({
    queryKey: ['contact-interactions', contactId, params],
    queryFn: () => fetchInteractions(contactId!, params),
    enabled: !!contactId,
  });
}

export function useContactTimeline(contactId: string | undefined, limit?: number) {
  return useQuery({
    queryKey: ['contact-timeline', contactId, limit],
    queryFn: () => fetchTimeline(contactId!, limit),
    enabled: !!contactId,
  });
}

export function useCreateInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, input }: { contactId: string; input: CreateInteractionInput }) =>
      createInteraction(contactId, input),
    onSuccess: (_, { contactId }) => {
      queryClient.invalidateQueries({ queryKey: ['contact-interactions', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contact-timeline', contactId] });
    },
  });
}

export interface DuplicateGroup {
  match_type: 'email' | 'phone' | 'name';
  match_value: string;
  confidence: number;
  contacts: Array<{
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    company?: string;
    created_at: string;
  }>;
}

interface DuplicatesResponse {
  duplicate_groups: DuplicateGroup[];
  total_groups: number;
  total_duplicates: number;
}

interface MergeContactsInput {
  primary_contact_id: string;
  secondary_contact_ids: string[];
  merge_strategy?: 'keep_primary' | 'keep_newest' | 'merge_fields';
}

async function fetchDuplicates(organizationId: string): Promise<DuplicatesResponse> {
  const res = await fetch(`/api/contacts/duplicates?organization_id=${organizationId}`);
  if (!res.ok) throw new Error('Failed to fetch duplicates');
  return res.json();
}

async function mergeContacts(input: MergeContactsInput): Promise<{ contact: unknown; merged_count: number }> {
  const res = await fetch('/api/contacts/merge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to merge contacts');
  return res.json();
}

export function useContactDuplicates(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['contact-duplicates', organizationId],
    queryFn: () => fetchDuplicates(organizationId!),
    enabled: !!organizationId,
  });
}

export function useMergeContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mergeContacts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-duplicates'] });
    },
  });
}
