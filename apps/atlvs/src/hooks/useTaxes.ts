'use client';

import { useQuery } from '@tanstack/react-query';

export interface TaxDocument {
  id: string;
  document_type: string;
  tax_year: number;
  entity_name: string;
  jurisdiction: string;
  filing_deadline: string;
  status: string;
  amount_due?: number;
  amount_paid?: number;
  filed_date?: string;
  confirmation_number?: string;
  [key: string]: unknown;
}

const DEMO_TAX_DOCUMENTS: TaxDocument[] = [
  { id: '1', document_type: 'Form 1120', tax_year: 2024, entity_name: 'GHXSTSHIP Inc', jurisdiction: 'Federal', filing_deadline: '2025-04-15', status: 'pending', amount_due: 125000 },
  { id: '2', document_type: 'Form 941', tax_year: 2024, entity_name: 'GHXSTSHIP Inc', jurisdiction: 'Federal', filing_deadline: '2025-01-31', status: 'filed', amount_due: 45000, amount_paid: 45000, filed_date: '2025-01-28' },
];

export const taxKeys = {
  all: ['taxes'] as const,
  list: (year?: number) => [...taxKeys.all, 'list', year] as const,
};

export function useTaxDocuments(year: number = 2024) {
  return useQuery({
    queryKey: taxKeys.list(year),
    queryFn: async () => {
      const response = await fetch(`/api/taxes?year=${year}`);
      if (response.status === 401) {
        return DEMO_TAX_DOCUMENTS;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch tax documents');
      }
      const data = await response.json();
      return data.documents || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTaxesData(year: number = 2024) {
  const taxQuery = useTaxDocuments(year);

  const documents = taxQuery.data || [];
  const pendingCount = documents.filter((d: TaxDocument) => d.status === 'pending').length;
  const totalLiability = documents.reduce((sum: number, d: TaxDocument) => sum + (d.amount_due || 0), 0);
  const totalPaid = documents.reduce((sum: number, d: TaxDocument) => sum + (d.amount_paid || 0), 0);

  return {
    documents,
    pendingCount,
    totalLiability,
    totalPaid,
    isLoading: taxQuery.isLoading,
    error: taxQuery.error,
    refetch: taxQuery.refetch,
  };
}
