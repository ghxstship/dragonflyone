import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PricingRule {
  id: string;
  space_id: string;
  pricing_type: 'hourly' | 'half_day' | 'full_day' | 'per_person' | 'flat' | 'custom';
  name: string;
  base_price: number;
  currency: string;
  conditions: {
    min_hours?: number;
    max_hours?: number;
    min_guests?: number;
    max_guests?: number;
    days_of_week?: number[];
    date_ranges?: Array<{ start: string; end: string }>;
    event_types?: string[];
  };
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePricingRuleInput {
  space_id: string;
  pricing_type: PricingRule['pricing_type'];
  name: string;
  base_price: number;
  currency?: string;
  conditions?: PricingRule['conditions'];
  is_active?: boolean;
  priority?: number;
}

export interface UpdatePricingRuleInput extends Partial<Omit<CreatePricingRuleInput, 'space_id'>> {
  id: string;
}

async function fetchPricingRules(spaceId: string): Promise<{ rules: PricingRule[]; total: number }> {
  const response = await fetch(`/api/spaces/${spaceId}/pricing-rules`);
  if (!response.ok) {
    throw new Error('Failed to fetch pricing rules');
  }
  return response.json();
}

async function createPricingRule(input: CreatePricingRuleInput): Promise<PricingRule> {
  const response = await fetch(`/api/spaces/${input.space_id}/pricing-rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create pricing rule');
  }
  return response.json();
}

async function updatePricingRule({ id, ...input }: UpdatePricingRuleInput & { space_id: string }): Promise<PricingRule> {
  const response = await fetch(`/api/spaces/${input.space_id}/pricing-rules/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update pricing rule');
  }
  return response.json();
}

async function deletePricingRule({ id, spaceId }: { id: string; spaceId: string }): Promise<void> {
  const response = await fetch(`/api/spaces/${spaceId}/pricing-rules/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete pricing rule');
  }
}

export function useSpacePricingRules(spaceId: string) {
  return useQuery({
    queryKey: ['space-pricing-rules', spaceId],
    queryFn: () => fetchPricingRules(spaceId),
    enabled: !!spaceId,
  });
}

export function useCreatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPricingRule,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['space-pricing-rules', data.space_id] });
      queryClient.invalidateQueries({ queryKey: ['venue-space', data.space_id] });
    },
  });
}

export function useUpdatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePricingRuleInput & { space_id: string }) => updatePricingRule(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['space-pricing-rules', data.space_id] });
      queryClient.invalidateQueries({ queryKey: ['venue-space', data.space_id] });
    },
  });
}

export function useDeletePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePricingRule,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['space-pricing-rules', variables.spaceId] });
      queryClient.invalidateQueries({ queryKey: ['venue-space', variables.spaceId] });
    },
  });
}
