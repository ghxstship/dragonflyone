'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DEMO_POS_TERMINALS,
  DEMO_POS_MENU_ITEMS,
  type DemoPOSTerminal,
  type DemoPOSMenuItem,
} from '@/lib/demo-data';

export type POSTerminal = DemoPOSTerminal;
export type POSMenuItem = DemoPOSMenuItem;

export const posKeys = {
  all: ['pos'] as const,
  terminals: () => [...posKeys.all, 'terminals'] as const,
  menuItems: () => [...posKeys.all, 'menu-items'] as const,
  transactions: () => [...posKeys.all, 'transactions'] as const,
};

// Fetch POS terminals
export function usePOSTerminals() {
  return useQuery({
    queryKey: posKeys.terminals(),
    queryFn: async () => {
      const response = await fetch('/api/admin/pos/terminals');
      if (response.status === 401) {
        return DEMO_POS_TERMINALS;
      }
      if (!response.ok) {
        return DEMO_POS_TERMINALS;
      }
      const data = await response.json();
      return data.terminals?.length ? data.terminals : DEMO_POS_TERMINALS;
    },
    staleTime: 30 * 1000,
  });
}

// Fetch POS menu items
export function usePOSMenuItems() {
  return useQuery({
    queryKey: posKeys.menuItems(),
    queryFn: async () => {
      const response = await fetch('/api/admin/pos/menu-items');
      if (response.status === 401) {
        return DEMO_POS_MENU_ITEMS;
      }
      if (!response.ok) {
        return DEMO_POS_MENU_ITEMS;
      }
      const data = await response.json();
      return data.menuItems?.length ? data.menuItems : DEMO_POS_MENU_ITEMS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Process a sale
export function useProcessSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sale: { items: Array<{ id: string; quantity: number }>; paymentMethod: string; terminalId: string }) => {
      const response = await fetch('/api/admin/pos/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale),
      });
      if (!response.ok) {
        throw new Error('Failed to process sale');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: posKeys.terminals() });
      queryClient.invalidateQueries({ queryKey: posKeys.transactions() });
    },
  });
}

// Combined hook for POS page
export function usePOSData() {
  const terminalsQuery = usePOSTerminals();
  const menuItemsQuery = usePOSMenuItems();
  const processSaleMutation = useProcessSale();

  const terminals = terminalsQuery.data || DEMO_POS_TERMINALS;
  const menuItems = menuItemsQuery.data || DEMO_POS_MENU_ITEMS;

  return {
    terminals,
    menuItems,
    isLoading: terminalsQuery.isLoading || menuItemsQuery.isLoading,
    error: terminalsQuery.error || menuItemsQuery.error,
    refetchTerminals: terminalsQuery.refetch,
    refetchMenuItems: menuItemsQuery.refetch,
    processSale: processSaleMutation.mutateAsync,
    isProcessing: processSaleMutation.isPending,
  };
}
