import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ContactEnrichmentData {
  contact_id: string;
  enrichment_source: 'clearbit' | 'hunter' | 'apollo' | 'manual';
  enriched_at: string;
  confidence_score: number;
  data: {
    company?: {
      name: string;
      domain: string;
      industry: string;
      employee_count?: number;
      annual_revenue?: string;
      location?: string;
      logo_url?: string;
      linkedin_url?: string;
    };
    person?: {
      full_name: string;
      title?: string;
      seniority?: string;
      department?: string;
      linkedin_url?: string;
      twitter_url?: string;
      bio?: string;
      avatar_url?: string;
    };
    social_profiles?: Array<{
      platform: string;
      url: string;
      username: string;
    }>;
    technologies?: string[];
    funding?: {
      total_raised?: string;
      last_round?: string;
      last_round_date?: string;
    };
  };
}

export interface DuplicateContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  similarity_score: number;
  match_fields: string[];
  created_at: string;
}

async function fetchEnrichmentData(contactId: string): Promise<ContactEnrichmentData | null> {
  const response = await fetch(`/api/contacts/${contactId}/enrichment`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch enrichment data');
  }
  return response.json();
}

async function enrichContact(contactId: string): Promise<ContactEnrichmentData> {
  const response = await fetch(`/api/contacts/${contactId}/enrich`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to enrich contact');
  }
  return response.json();
}

async function findDuplicates(input: {
  email?: string;
  phone?: string;
  name?: string;
  excludeId?: string;
}): Promise<{ duplicates: DuplicateContact[]; total: number }> {
  const params = new URLSearchParams();
  if (input.email) params.set('email', input.email);
  if (input.phone) params.set('phone', input.phone);
  if (input.name) params.set('name', input.name);
  if (input.excludeId) params.set('exclude_id', input.excludeId);

  const response = await fetch(`/api/contacts/duplicates?${params}`);
  if (!response.ok) {
    throw new Error('Failed to find duplicates');
  }
  return response.json();
}

async function mergeContacts(input: {
  primaryId: string;
  duplicateIds: string[];
  mergeStrategy: 'keep_primary' | 'keep_newest' | 'merge_all';
}): Promise<{ merged_contact_id: string; merged_count: number }> {
  const response = await fetch('/api/contacts/merge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to merge contacts');
  }
  return response.json();
}

async function calculateCLV(contactId: string): Promise<{
  contact_id: string;
  clv: number;
  total_revenue: number;
  event_count: number;
  average_event_value: number;
  first_event_date: string;
  last_event_date: string;
  predicted_next_event?: string;
  lifetime_months: number;
  engagement_score: number;
}> {
  const response = await fetch(`/api/contacts/${contactId}/clv`);
  if (!response.ok) {
    throw new Error('Failed to calculate CLV');
  }
  return response.json();
}

export function useContactEnrichment(contactId: string) {
  return useQuery({
    queryKey: ['contact-enrichment', contactId],
    queryFn: () => fetchEnrichmentData(contactId),
    enabled: !!contactId,
  });
}

export function useEnrichContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrichContact,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contact-enrichment', data.contact_id] });
      queryClient.invalidateQueries({ queryKey: ['contact', data.contact_id] });
    },
  });
}

export function useFindDuplicates(input: { email?: string; phone?: string; name?: string; excludeId?: string } | null) {
  return useQuery({
    queryKey: ['contact-duplicates', input],
    queryFn: () => findDuplicates(input!),
    enabled: !!input && (!!input.email || !!input.phone || !!input.name),
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

export function useContactCLV(contactId: string) {
  return useQuery({
    queryKey: ['contact-clv', contactId],
    queryFn: () => calculateCLV(contactId),
    enabled: !!contactId,
  });
}
