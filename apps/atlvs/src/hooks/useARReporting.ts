import { useQuery } from '@tanstack/react-query';

export interface ARAgingBucket {
  bucket: 'current' | '1-30' | '31-60' | '61-90' | '90+';
  count: number;
  amount: number;
  invoices: Array<{
    id: string;
    invoice_number: string;
    contact_name: string;
    amount_due: number;
    days_overdue: number;
  }>;
}

export interface ARSummary {
  total_outstanding: number;
  total_overdue: number;
  average_days_to_pay: number;
  collection_rate: number;
  aging_buckets: ARAgingBucket[];
  trends: {
    outstanding_30_days_ago: number;
    outstanding_60_days_ago: number;
    outstanding_90_days_ago: number;
  };
}

export interface ARByContact {
  contact_id: string;
  contact_name: string;
  total_outstanding: number;
  oldest_invoice_days: number;
  invoice_count: number;
  payment_history_score: number;
}

async function fetchARSummary(): Promise<ARSummary> {
  const response = await fetch('/api/reports/ar-summary');
  if (!response.ok) {
    throw new Error('Failed to fetch AR summary');
  }
  return response.json();
}

async function fetchARByContact(): Promise<{ contacts: ARByContact[]; total: number }> {
  const response = await fetch('/api/reports/ar-by-contact');
  if (!response.ok) {
    throw new Error('Failed to fetch AR by contact');
  }
  return response.json();
}

async function fetchARAgingReport(asOfDate?: string): Promise<{ aging: ARAgingBucket[]; as_of_date: string }> {
  const params = new URLSearchParams();
  if (asOfDate) {
    params.set('as_of_date', asOfDate);
  }

  const response = await fetch(`/api/reports/ar-aging?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch AR aging report');
  }
  return response.json();
}

export function useARSummary() {
  return useQuery({
    queryKey: ['ar-summary'],
    queryFn: fetchARSummary,
  });
}

export function useARByContact() {
  return useQuery({
    queryKey: ['ar-by-contact'],
    queryFn: fetchARByContact,
  });
}

export function useARAgingReport(asOfDate?: string) {
  return useQuery({
    queryKey: ['ar-aging', asOfDate],
    queryFn: () => fetchARAgingReport(asOfDate),
  });
}
