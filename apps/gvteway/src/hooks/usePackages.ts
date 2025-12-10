'use client';

import { useQuery } from '@tanstack/react-query';

export interface EventPackage {
  id: string;
  name: string;
  event_id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  description: string;
  includes: string[];
  ticket_type: string;
  hotel_name?: string;
  hotel_nights?: number;
  transportation_included: boolean;
  meet_greet: boolean;
  vip_access: boolean;
  original_price: number;
  package_price: number;
  savings: number;
  availability: number;
  status: string;
}

export interface PackageSummary {
  total_packages: number;
  vip_packages: number;
  travel_packages: number;
  average_savings: number;
}

const DEMO_PACKAGES: EventPackage[] = [
  { id: 'demo-1', name: 'VIP Festival Experience', event_id: 'event-001', event_name: 'Summer Music Festival 2024', event_date: new Date(Date.now() + 30 * 86400000).toISOString(), venue_name: 'Central Park, New York', description: 'The ultimate festival experience', includes: ['VIP Seating', 'Backstage Tour', 'Meet & Greet'], ticket_type: 'VIP', hotel_name: 'Grand Plaza Hotel', hotel_nights: 2, transportation_included: true, meet_greet: true, vip_access: true, original_price: 1500, package_price: 1199, savings: 20, availability: 15, status: 'available' },
  { id: 'demo-2', name: 'Weekend Getaway Package', event_id: 'event-002', event_name: 'Jazz Night', event_date: new Date(Date.now() + 45 * 86400000).toISOString(), venue_name: 'Hollywood Bowl', description: 'A relaxing weekend getaway', includes: ['Premium Seating', 'Hotel Stay'], ticket_type: 'Premium', hotel_name: 'Sunset Inn', hotel_nights: 1, transportation_included: false, meet_greet: false, vip_access: false, original_price: 600, package_price: 499, savings: 15, availability: 25, status: 'available' },
];

const DEMO_SUMMARY: PackageSummary = {
  total_packages: 45,
  vip_packages: 12,
  travel_packages: 18,
  average_savings: 18,
};

export const packagesKeys = {
  all: ['packages'] as const,
  list: (filters?: { search?: string }) => [...packagesKeys.all, 'list', filters] as const,
  summary: () => [...packagesKeys.all, 'summary'] as const,
};

export function usePackagesList(filters?: { search?: string }) {
  return useQuery({
    queryKey: packagesKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) {
        params.append('search', filters.search);
      }
      const response = await fetch(`/api/packages?${params.toString()}`);
      if (response.status === 401) {
        return DEMO_PACKAGES;
      }
      if (!response.ok) {
        return DEMO_PACKAGES;
      }
      const data = await response.json();
      return data.packages || DEMO_PACKAGES;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePackagesSummary() {
  return useQuery({
    queryKey: packagesKeys.summary(),
    queryFn: async () => {
      const response = await fetch('/api/packages/summary');
      if (response.status === 401) {
        return DEMO_SUMMARY;
      }
      if (!response.ok) {
        return DEMO_SUMMARY;
      }
      const data = await response.json();
      return data.summary || DEMO_SUMMARY;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePackagesData(filters?: { search?: string }) {
  const packagesQuery = usePackagesList(filters);
  const summaryQuery = usePackagesSummary();

  return {
    packages: packagesQuery.data || [],
    summary: summaryQuery.data || DEMO_SUMMARY,
    isLoading: packagesQuery.isLoading || summaryQuery.isLoading,
    error: packagesQuery.error || summaryQuery.error,
    refetch: () => {
      packagesQuery.refetch();
      summaryQuery.refetch();
    },
  };
}
