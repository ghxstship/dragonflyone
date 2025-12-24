import { useQuery, useQueryClient } from '@tanstack/react-query';

// Anti-Scalping
export interface AntiScalpingRule {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Inactive';
  blocked: number;
  flagged: number;
  created_at?: string;
  updated_at?: string;
}

// Print at Home
export interface PrintAtHomeTicket {
  id: string;
  orderId: string;
  eventName: string;
  ticketType: string;
  status: 'Generated' | 'Downloaded' | 'Printed' | 'Scanned';
  generatedAt: string;
  downloadedAt?: string;
  created_at?: string;
  updated_at?: string;
}

// Urgency Messaging
export interface UrgencyMessage {
  id: string;
  type: string;
  message: string;
  trigger: string;
  status: 'Active' | 'Inactive';
  impressions: number;
  conversions: number;
  conversionRate: number;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/tickets';

// Anti-Scalping hooks
async function fetchAntiScalpingRules(): Promise<AntiScalpingRule[]> {
  const response = await fetch(`${API_BASE}/anti-scalping`);
  if (!response.ok) return [];
  const { data } = await response.json();
  return data || [];
}

export function useAntiScalpingRulesQuery() {
  return useQuery({
    queryKey: ['anti-scalping-rules'],
    queryFn: fetchAntiScalpingRules,
    staleTime: 60000,
  });
}

export function useAntiScalping() {
  const query = useAntiScalpingRulesQuery();
  const rules = query.data || [];
  const activeRules = rules.filter(r => r.status === 'Active').length;
  const totalBlocked = rules.reduce((s, r) => s + r.blocked, 0);

  return {
    rules,
    summary: { activeRules, totalBlocked, totalRules: rules.length },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Print at Home hooks
async function fetchPrintAtHomeTickets(): Promise<PrintAtHomeTicket[]> {
  const response = await fetch(`${API_BASE}/print-at-home`);
  if (!response.ok) return [];
  const { data } = await response.json();
  return data || [];
}

export function usePrintAtHomeTicketsQuery() {
  return useQuery({
    queryKey: ['print-at-home-tickets'],
    queryFn: fetchPrintAtHomeTickets,
    staleTime: 60000,
  });
}

export function usePrintAtHomeTickets() {
  const query = usePrintAtHomeTicketsQuery();
  const tickets = query.data || [];
  const generated = tickets.filter(t => t.status === 'Generated').length;
  const downloaded = tickets.filter(t => t.status === 'Downloaded' || t.status === 'Printed').length;

  return {
    tickets,
    summary: { generated, downloaded, totalTickets: tickets.length },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Urgency Messaging hooks
async function fetchUrgencyMessages(): Promise<UrgencyMessage[]> {
  const response = await fetch(`${API_BASE}/urgency`);
  if (!response.ok) return [];
  const { data } = await response.json();
  return data || [];
}

export function useUrgencyMessagesQuery() {
  return useQuery({
    queryKey: ['urgency-messages'],
    queryFn: fetchUrgencyMessages,
    staleTime: 60000,
  });
}

export function useUrgencyMessages() {
  const query = useUrgencyMessagesQuery();
  const messages = query.data || [];
  const activeMessages = messages.filter(m => m.status === 'Active').length;
  const totalConversions = messages.reduce((s, m) => s + m.conversions, 0);

  return {
    messages,
    summary: { activeMessages, totalConversions, totalMessages: messages.length },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
