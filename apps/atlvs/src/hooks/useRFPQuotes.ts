import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface RFPQuote {
  id: string;
  rfp_id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_email: string;
  status: 'pending' | 'submitted' | 'awarded' | 'declined' | 'expired';
  submitted_at?: string;
  total_amount?: number;
  currency: string;
  valid_until?: string;
  delivery_date?: string;
  payment_terms?: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    notes?: string;
  }>;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  notes?: string;
  created_at: string;
}

export interface QuoteComparison {
  rfp_id: string;
  rfp_title: string;
  quotes: Array<{
    vendor_id: string;
    vendor_name: string;
    total_amount: number;
    delivery_date?: string;
    payment_terms?: string;
    score: number;
    line_item_comparison: Array<{
      item_description: string;
      vendor_prices: Record<string, number>;
      lowest_price: number;
      highest_price: number;
    }>;
  }>;
  savings_analysis: {
    lowest_total: number;
    highest_total: number;
    potential_savings: number;
    recommended_vendor_id?: string;
  };
}

async function fetchRFPQuotes(rfpId: string): Promise<{
  quotes: RFPQuote[];
  total: number;
}> {
  const response = await fetch(`/api/rfps/${rfpId}/quotes`);
  if (!response.ok) {
    throw new Error('Failed to fetch RFP quotes');
  }
  return response.json();
}

async function fetchQuoteComparison(rfpId: string): Promise<QuoteComparison> {
  const response = await fetch(`/api/rfps/${rfpId}/compare`);
  if (!response.ok) {
    throw new Error('Failed to fetch quote comparison');
  }
  return response.json();
}

async function submitQuote(input: {
  rfpId: string;
  vendorId: string;
  totalAmount: number;
  validUntil: string;
  deliveryDate?: string;
  paymentTerms?: string;
  lineItems: RFPQuote['line_items'];
  notes?: string;
}): Promise<RFPQuote> {
  const response = await fetch(`/api/rfps/${input.rfpId}/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit quote');
  }
  return response.json();
}

async function awardQuote(input: { rfpId: string; quoteId: string; notes?: string }): Promise<RFPQuote> {
  const response = await fetch(`/api/rfps/${input.rfpId}/award`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quote_id: input.quoteId, notes: input.notes }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to award quote');
  }
  return response.json();
}

async function declineQuote(input: { rfpId: string; quoteId: string; reason?: string }): Promise<RFPQuote> {
  const response = await fetch(`/api/rfps/${input.rfpId}/quotes/${input.quoteId}/decline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: input.reason }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to decline quote');
  }
  return response.json();
}

export function useRFPQuotes(rfpId: string) {
  return useQuery({
    queryKey: ['rfp-quotes', rfpId],
    queryFn: () => fetchRFPQuotes(rfpId),
    enabled: !!rfpId,
  });
}

export function useQuoteComparison(rfpId: string) {
  return useQuery({
    queryKey: ['rfp-quote-comparison', rfpId],
    queryFn: () => fetchQuoteComparison(rfpId),
    enabled: !!rfpId,
  });
}

export function useSubmitQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitQuote,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfp-quotes', variables.rfpId] });
      queryClient.invalidateQueries({ queryKey: ['rfp', variables.rfpId] });
    },
  });
}

export function useAwardQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: awardQuote,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfp-quotes', variables.rfpId] });
      queryClient.invalidateQueries({ queryKey: ['rfp-quote-comparison', variables.rfpId] });
      queryClient.invalidateQueries({ queryKey: ['rfp', variables.rfpId] });
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
  });
}

export function useDeclineQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: declineQuote,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfp-quotes', variables.rfpId] });
    },
  });
}
