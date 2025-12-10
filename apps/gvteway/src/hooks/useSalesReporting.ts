'use client';

import { useQuery } from '@tanstack/react-query';

export interface SalesData {
  id: string;
  location: string;
  location_type: 'venue' | 'booth' | 'online' | 'box_office';
  date: string;
  period: string;
  transactions: number;
  gross_sales: number;
  refunds: number;
  net_sales: number;
  avg_transaction: number;
  top_items: { name: string; quantity: number; revenue: number }[];
  [key: string]: unknown;
}

const DEMO_SALES: SalesData[] = [
  { id: 'SD-001', location: 'Main Bar', location_type: 'venue', date: '2024-11-24', period: '14:00-15:00', transactions: 89, gross_sales: 2450.50, refunds: 45.00, net_sales: 2405.50, avg_transaction: 27.03, top_items: [{ name: 'Beer', quantity: 156, revenue: 1248.00 }] },
  { id: 'SD-002', location: 'Merch Booth A', location_type: 'booth', date: '2024-11-24', period: '14:00-15:00', transactions: 45, gross_sales: 3825.00, refunds: 85.00, net_sales: 3740.00, avg_transaction: 83.11, top_items: [{ name: 'Tour T-Shirt', quantity: 32, revenue: 1440.00 }] },
];

export const salesReportingKeys = {
  all: ['sales-reporting'] as const,
  list: (filters?: { location_type?: string; date?: string }) => [...salesReportingKeys.all, 'list', filters] as const,
};

export function useSalesData(filters?: { location_type?: string; date?: string }) {
  return useQuery({
    queryKey: salesReportingKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.location_type) params.append('location_type', filters.location_type);
      if (filters?.date) params.append('date', filters.date);
      const response = await fetch(`/api/admin/sales?${params.toString()}`);
      if (!response.ok) return DEMO_SALES;
      const data = await response.json();
      return data.sales || DEMO_SALES;
    },
    staleTime: 60 * 1000,
  });
}

export function useSalesReportingData(filters?: { location_type?: string; date?: string }) {
  const salesQuery = useSalesData(filters);

  return {
    sales: salesQuery.data || [],
    isLoading: salesQuery.isLoading,
    error: salesQuery.error,
    refetch: salesQuery.refetch,
  };
}
