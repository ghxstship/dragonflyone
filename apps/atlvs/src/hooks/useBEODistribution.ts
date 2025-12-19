import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface BEODistribution {
  id: string;
  beo_id: string;
  recipient_email: string;
  recipient_name: string;
  recipient_department: string;
  status: 'pending' | 'sent' | 'viewed' | 'acknowledged';
  sent_at?: string;
  viewed_at?: string;
  acknowledged_at?: string;
  notes?: string;
  created_at: string;
}

export interface DistributionSummary {
  total_recipients: number;
  sent_count: number;
  viewed_count: number;
  acknowledged_count: number;
  pending_count: number;
}

export interface SendDistributionInput {
  beo_id: string;
  recipients: Array<{
    email: string;
    name: string;
    department: string;
  }>;
  message?: string;
  include_pdf?: boolean;
}

async function fetchBEODistributions(beoId: string): Promise<{
  distributions: BEODistribution[];
  summary: DistributionSummary;
}> {
  const response = await fetch(`/api/beos/${beoId}/distributions`);
  if (!response.ok) {
    throw new Error('Failed to fetch BEO distributions');
  }
  return response.json();
}

async function sendBEODistribution(input: SendDistributionInput): Promise<{
  distributions: BEODistribution[];
  sent_count: number;
}> {
  const response = await fetch(`/api/beos/${input.beo_id}/distribute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to distribute BEO');
  }
  return response.json();
}

async function resendDistribution(distributionId: string): Promise<BEODistribution> {
  const response = await fetch(`/api/beo-distributions/${distributionId}/resend`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to resend distribution');
  }
  return response.json();
}

async function acknowledgeDistribution(token: string): Promise<BEODistribution> {
  const response = await fetch(`/api/beo-distributions/acknowledge/${token}`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to acknowledge distribution');
  }
  return response.json();
}

export function useBEODistributions(beoId: string) {
  return useQuery({
    queryKey: ['beo-distributions', beoId],
    queryFn: () => fetchBEODistributions(beoId),
    enabled: !!beoId,
  });
}

export function useSendBEODistribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendBEODistribution,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['beo-distributions', variables.beo_id] });
      queryClient.invalidateQueries({ queryKey: ['beo', variables.beo_id] });
    },
  });
}

export function useResendDistribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resendDistribution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beo-distributions'] });
    },
  });
}

export function useAcknowledgeDistribution() {
  return useMutation({
    mutationFn: acknowledgeDistribution,
  });
}
