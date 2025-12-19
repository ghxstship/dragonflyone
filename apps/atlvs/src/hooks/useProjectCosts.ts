'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ProjectCost {
  id: string;
  booking_id: string;
  cost_type: string;
  category: string;
  description: string;
  vendor_id?: string;
  vendor_profile?: { id: string; name: string };
  budgeted_amount: number;
  actual_amount: number;
  variance: number;
  status: string;
  notes?: string;
  created_at: string;
}

export interface ProjectCostsSummary {
  total_budgeted: number;
  total_actual: number;
  total_variance: number;
  variance_percent: number;
  is_over_budget: boolean;
  projected_profit: number;
  projected_margin: number;
}

export interface CategoryTotal {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  item_count: number;
}

interface ProjectCostsResponse {
  booking: {
    id: string;
    booking_number: string;
    event_name?: string;
    estimated_revenue: number;
    budget: number;
  };
  costs: ProjectCost[];
  invoices: Array<{
    id: string;
    invoice_number: string;
    total_amount: number;
    status: string;
    vendor_profile?: { id: string; name: string };
  }>;
  summary: ProjectCostsSummary;
  by_category: CategoryTotal[];
}

const DEMO_PROJECT_COSTS: ProjectCostsResponse = {
  booking: {
    id: 'demo-booking',
    booking_number: 'BK-2024-001',
    event_name: 'Annual Corporate Gala',
    estimated_revenue: 150000,
    budget: 95000,
  },
  costs: [
    {
      id: '1',
      booking_id: 'demo-booking',
      cost_type: 'vendor',
      category: 'Catering',
      description: 'Full-service catering for 200 guests',
      budgeted_amount: 25000,
      actual_amount: 23500,
      variance: 1500,
      status: 'invoiced',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      booking_id: 'demo-booking',
      cost_type: 'vendor',
      category: 'AV Production',
      description: 'Sound, lighting, and video',
      budgeted_amount: 35000,
      actual_amount: 38000,
      variance: -3000,
      status: 'invoiced',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      booking_id: 'demo-booking',
      cost_type: 'rental',
      category: 'Decor',
      description: 'Floral and table settings',
      budgeted_amount: 15000,
      actual_amount: 14200,
      variance: 800,
      status: 'invoiced',
      created_at: new Date().toISOString(),
    },
  ],
  invoices: [],
  summary: {
    total_budgeted: 95000,
    total_actual: 87700,
    total_variance: 7300,
    variance_percent: 7.7,
    is_over_budget: false,
    projected_profit: 62300,
    projected_margin: 41.5,
  },
  by_category: [
    { category: 'AV Production', budgeted: 35000, actual: 38000, variance: -3000, item_count: 1 },
    { category: 'Catering', budgeted: 25000, actual: 23500, variance: 1500, item_count: 1 },
    { category: 'Decor', budgeted: 15000, actual: 14200, variance: 800, item_count: 1 },
  ],
};

export function useProjectCosts(bookingId: string | undefined) {
  return useQuery({
    queryKey: ['project-costs', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      
      const response = await fetch(`/api/project-costs/${bookingId}`);
      if (response.status === 401) {
        return DEMO_PROJECT_COSTS;
      }
      if (!response.ok) {
        return DEMO_PROJECT_COSTS;
      }
      return response.json() as Promise<ProjectCostsResponse>;
    },
    enabled: !!bookingId,
  });
}

interface CreateProjectCostInput {
  booking_id: string;
  cost_type: string;
  category: string;
  description: string;
  vendor_id?: string;
  budgeted_amount: number;
  actual_amount?: number;
  notes?: string;
}

export function useCreateProjectCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectCostInput) => {
      const response = await fetch('/api/project-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project cost');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-costs', variables.booking_id] });
    },
  });
}

interface UpdateProjectCostInput {
  id: string;
  booking_id: string;
  actual_amount?: number;
  status?: string;
  notes?: string;
}

export function useUpdateProjectCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateProjectCostInput) => {
      const response = await fetch(`/api/project-costs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update project cost');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-costs', variables.booking_id] });
    },
  });
}
