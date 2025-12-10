'use client';

import { useQuery } from '@tanstack/react-query';

export interface IntellectualProperty {
  id: string;
  title: string;
  ip_type: string;
  registration_number?: string;
  filing_date?: string;
  registration_date?: string;
  expiration_date?: string;
  jurisdiction: string;
  status: string;
  owner_entity: string;
  description?: string;
  classes?: string[];
  renewal_date?: string;
  estimated_value?: number;
  [key: string]: unknown;
}

const DEMO_IP_ASSETS: IntellectualProperty[] = [
  {
    id: '1',
    title: 'GHXSTSHIP Brand',
    ip_type: 'trademark',
    registration_number: 'TM-2024-001',
    filing_date: '2024-01-15',
    registration_date: '2024-06-01',
    expiration_date: '2034-06-01',
    jurisdiction: 'United States',
    status: 'registered',
    owner_entity: 'GHXSTSHIP Inc.',
    estimated_value: 500000,
  },
  {
    id: '2',
    title: 'Event Management System',
    ip_type: 'patent',
    registration_number: 'PAT-2024-002',
    filing_date: '2024-03-01',
    jurisdiction: 'United States',
    status: 'pending',
    owner_entity: 'GHXSTSHIP Inc.',
    estimated_value: 250000,
  },
];

export const ipTrackingKeys = {
  all: ['ip-tracking'] as const,
  assets: () => [...ipTrackingKeys.all, 'assets'] as const,
};

export function useIPAssets() {
  return useQuery({
    queryKey: ipTrackingKeys.assets(),
    queryFn: async () => {
      const response = await fetch('/api/intellectual-property');
      if (response.status === 401) {
        return DEMO_IP_ASSETS;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch IP assets');
      }
      const data = await response.json();
      return data.assets || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useIPTrackingData() {
  const assetsQuery = useIPAssets();

  const assets = assetsQuery.data || [];
  const pendingCount = assets.filter(a => a.status === 'pending' || a.status === 'filed').length;
  const totalValue = assets.reduce((sum, a) => sum + (a.estimated_value || 0), 0);

  return {
    assets,
    pendingCount,
    totalValue,
    isLoading: assetsQuery.isLoading,
    error: assetsQuery.error,
    refetch: assetsQuery.refetch,
  };
}
