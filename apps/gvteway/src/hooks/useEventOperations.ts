'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SettlementData {
  grossRevenue: number;
  ticketFees: number;
  refunds: number;
  netTicketRevenue: number;
  venueCost: number;
  productionCost: number;
  talentCost: number;
  marketingCost: number;
  staffingCost: number;
  miscCost: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  capacity: number;
  sold: number;
  available: number;
  revenue: number;
}

export interface CheckInStats {
  totalCapacity: number;
  checkedIn: number;
  pending: number;
  denied: number;
}

export interface RecentScan {
  id: string;
  ticketId: string;
  name: string;
  ticketType: string;
  status: 'success' | 'duplicate' | 'invalid' | 'expired';
  timestamp: Date;
}

const DEMO_SETTLEMENT: SettlementData = {
  grossRevenue: 125000,
  ticketFees: 6250,
  refunds: 2500,
  netTicketRevenue: 116250,
  venueCost: 25000,
  productionCost: 15000,
  talentCost: 35000,
  marketingCost: 8000,
  staffingCost: 5000,
  miscCost: 3000,
  totalCosts: 91000,
  netProfit: 25250,
  profitMargin: 21.7,
};

const DEMO_TIERS: TicketTier[] = [
  { id: '1', name: 'General Admission', price: 75, capacity: 500, sold: 423, available: 77, revenue: 31725 },
  { id: '2', name: 'VIP', price: 150, capacity: 100, sold: 87, available: 13, revenue: 13050 },
  { id: '3', name: 'Premium', price: 250, capacity: 50, sold: 42, available: 8, revenue: 10500 },
];

const DEMO_CHECK_IN_STATS: CheckInStats = {
  totalCapacity: 670,
  checkedIn: 423,
  pending: 247,
  denied: 12,
};

export const eventOpsKeys = {
  all: ['event-ops'] as const,
  settlement: (eventId: string) => [...eventOpsKeys.all, 'settlement', eventId] as const,
  boxOffice: (eventId: string) => [...eventOpsKeys.all, 'box-office', eventId] as const,
  checkIn: (eventId: string) => [...eventOpsKeys.all, 'check-in', eventId] as const,
  willCall: (eventId: string) => [...eventOpsKeys.all, 'will-call', eventId] as const,
  scan: (eventId: string) => [...eventOpsKeys.all, 'scan', eventId] as const,
  refunds: (eventId: string) => [...eventOpsKeys.all, 'refunds', eventId] as const,
  credentials: (eventId: string) => [...eventOpsKeys.all, 'credentials', eventId] as const,
};

export function useEventSettlement(eventId: string) {
  return useQuery({
    queryKey: eventOpsKeys.settlement(eventId),
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/settlement`);
      if (!response.ok) return DEMO_SETTLEMENT;
      const data = await response.json();
      return data.settlement || DEMO_SETTLEMENT;
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEventBoxOffice(eventId: string) {
  return useQuery({
    queryKey: eventOpsKeys.boxOffice(eventId),
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/box-office`);
      if (!response.ok) return DEMO_TIERS;
      const data = await response.json();
      return data.tiers || DEMO_TIERS;
    },
    enabled: !!eventId,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useEventCheckInStats(eventId: string) {
  return useQuery({
    queryKey: eventOpsKeys.checkIn(eventId),
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/check-in/stats`);
      if (!response.ok) return DEMO_CHECK_IN_STATS;
      const data = await response.json();
      return data.stats || DEMO_CHECK_IN_STATS;
    },
    enabled: !!eventId,
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
  });
}

export function useCheckInSearch(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await fetch(`/api/events/${eventId}/check-in/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventOpsKeys.checkIn(eventId) });
    },
  });
}

export function useEventSettlementData(eventId: string) {
  const settlementQuery = useEventSettlement(eventId);

  return {
    settlement: settlementQuery.data || null,
    isLoading: settlementQuery.isLoading,
    error: settlementQuery.error,
    refetch: settlementQuery.refetch,
  };
}

export function useEventBoxOfficeData(eventId: string) {
  const tiersQuery = useEventBoxOffice(eventId);

  return {
    tiers: tiersQuery.data || [],
    isLoading: tiersQuery.isLoading,
    error: tiersQuery.error,
    refetch: tiersQuery.refetch,
  };
}

export function useEventCheckInData(eventId: string) {
  const statsQuery = useEventCheckInStats(eventId);
  const searchMutation = useCheckInSearch(eventId);

  return {
    stats: statsQuery.data || DEMO_CHECK_IN_STATS,
    isLoading: statsQuery.isLoading,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
    searchTicket: searchMutation.mutateAsync,
    isSearching: searchMutation.isPending,
  };
}

export interface WillCallTicket {
  id: string;
  orderId: string;
  name: string;
  email: string;
  ticketCount: number;
  ticketType: string;
  status: 'pending' | 'picked-up';
  pickupTime?: string;
}

const DEMO_WILL_CALL: WillCallTicket[] = [
  { id: 'WC-001', orderId: 'ORD-12345', name: 'John Smith', email: 'john@email.com', ticketCount: 2, ticketType: 'VIP', status: 'pending' },
  { id: 'WC-002', orderId: 'ORD-12346', name: 'Jane Doe', email: 'jane@email.com', ticketCount: 4, ticketType: 'GA', status: 'picked-up', pickupTime: '18:30' },
];

export function useEventWillCall(eventId: string) {
  return useQuery({
    queryKey: eventOpsKeys.willCall(eventId),
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/will-call`);
      if (!response.ok) return DEMO_WILL_CALL;
      const data = await response.json();
      return data.tickets || DEMO_WILL_CALL;
    },
    enabled: !!eventId,
    staleTime: 30 * 1000,
  });
}

export function useMarkPickedUp(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await fetch(`/api/events/${eventId}/will-call/${ticketId}/pickup`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark as picked up');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventOpsKeys.willCall(eventId) });
    },
  });
}

export function useEventWillCallData(eventId: string) {
  const ticketsQuery = useEventWillCall(eventId);
  const pickupMutation = useMarkPickedUp(eventId);

  return {
    tickets: ticketsQuery.data || [],
    isLoading: ticketsQuery.isLoading,
    error: ticketsQuery.error,
    refetch: ticketsQuery.refetch,
    markPickedUp: pickupMutation.mutateAsync,
    isMarking: pickupMutation.isPending,
  };
}
