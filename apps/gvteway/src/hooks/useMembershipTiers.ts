'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DEMO_MEMBERSHIP_TIERS, DEMO_AVAILABLE_BENEFITS } from '@/lib/demo-data';

// Types
export interface MembershipBenefit {
  id: string;
  name: string;
  description: string;
  type: string;
  enabled: boolean;
}

export interface MembershipTier {
  id: string;
  name: string;
  price: number;
  billingCycle: 'Monthly' | 'Annual';
  color: string;
  memberCount: number;
  benefits: MembershipBenefit[];
}

export interface BenefitCategory {
  type: string;
  options: string[];
}

// Query keys
export const membershipTiersKeys = {
  all: ['membershipTiers'] as const,
  list: () => [...membershipTiersKeys.all, 'list'] as const,
  benefits: () => [...membershipTiersKeys.all, 'benefits'] as const,
  stats: () => [...membershipTiersKeys.all, 'stats'] as const,
};

// Fetch functions
async function fetchMembershipTiers(): Promise<MembershipTier[]> {
  const response = await fetch('/api/memberships/tiers');
  
  if (!response.ok) {
    // Return demo data as fallback
    return DEMO_MEMBERSHIP_TIERS;
  }
  
  const data = await response.json();
  
  if (!data.tiers || data.tiers.length === 0) {
    return DEMO_MEMBERSHIP_TIERS;
  }
  
  // Transform API data to match our interface
  return data.tiers.map((tier: Record<string, unknown>) => ({
    id: tier.id,
    name: tier.name,
    price: tier.price || 0,
    billingCycle: tier.billing_cycle === 'monthly' ? 'Monthly' : 'Annual',
    color: tier.color || '#6366f1',
    memberCount: tier.member_count || 0,
    benefits: (tier.benefits as MembershipBenefit[]) || [],
  }));
}

async function fetchBenefitCategories(): Promise<BenefitCategory[]> {
  const response = await fetch('/api/memberships/benefits');
  
  if (!response.ok) {
    return DEMO_AVAILABLE_BENEFITS;
  }
  
  const data = await response.json();
  return data.categories || DEMO_AVAILABLE_BENEFITS;
}

async function fetchMembershipStats(): Promise<{
  totalMembers: number;
  monthlyRevenue: number;
  activeBenefits: number;
}> {
  const response = await fetch('/api/memberships/stats');
  
  if (!response.ok) {
    return { totalMembers: 0, monthlyRevenue: 0, activeBenefits: 0 };
  }
  
  const data = await response.json();
  return data.stats || { totalMembers: 0, monthlyRevenue: 0, activeBenefits: 0 };
}

// Update tier mutation
async function updateTier(tier: MembershipTier): Promise<MembershipTier> {
  const response = await fetch(`/api/memberships/tiers/${tier.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tier),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update tier');
  }
  
  return response.json();
}

// Hooks
export function useMembershipTiers() {
  return useQuery({
    queryKey: membershipTiersKeys.list(),
    queryFn: fetchMembershipTiers,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBenefitCategories() {
  return useQuery({
    queryKey: membershipTiersKeys.benefits(),
    queryFn: fetchBenefitCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMembershipStats() {
  return useQuery({
    queryKey: membershipTiersKeys.stats(),
    queryFn: fetchMembershipStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateMembershipTier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateTier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membershipTiersKeys.all });
    },
  });
}

// Combined hook for the membership benefits page
export function useMembershipTiersData() {
  const tiersQuery = useMembershipTiers();
  const benefitsQuery = useBenefitCategories();
  const statsQuery = useMembershipStats();
  const updateMutation = useUpdateMembershipTier();
  
  // Calculate stats from tiers if API stats not available
  const tiers = tiersQuery.data || [];
  const calculatedStats = {
    totalMembers: tiers.reduce((sum, t) => sum + t.memberCount, 0),
    monthlyRevenue: tiers.reduce((sum, t) => {
      const monthly = t.billingCycle === 'Monthly' ? t.price : t.price / 12;
      return sum + (monthly * t.memberCount);
    }, 0),
    activeBenefits: tiers.reduce((sum, t) => sum + t.benefits.filter(b => b.enabled).length, 0),
  };
  
  return {
    // Tier data
    tiers,
    
    // Benefit categories
    benefitCategories: benefitsQuery.data || [],
    
    // Stats (prefer API stats, fallback to calculated)
    stats: statsQuery.data?.totalMembers ? statsQuery.data : calculatedStats,
    
    // Loading states
    isLoading: tiersQuery.isLoading,
    isBenefitsLoading: benefitsQuery.isLoading,
    
    // Error states
    error: tiersQuery.error,
    
    // Mutations
    updateTier: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    
    // Refetch
    refetch: tiersQuery.refetch,
  };
}
