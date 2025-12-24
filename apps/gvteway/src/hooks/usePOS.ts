'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DEMO_POS_TERMINALS,
  DEMO_POS_MENU_ITEMS,
  DEMO_POS_TRANSACTIONS,
  DEMO_PAYMENT_METHODS,
  type DemoPOSTerminal,
  type DemoPOSMenuItem,
  type DemoTransaction,
  type DemoPaymentMethod,
} from '@/lib/demo-data';

export type POSTerminal = DemoPOSTerminal;
export type POSMenuItem = DemoPOSMenuItem;
export type POSTransaction = DemoTransaction;
export type POSPaymentMethod = DemoPaymentMethod;

export const posKeys = {
  all: ['pos'] as const,
  terminals: () => [...posKeys.all, 'terminals'] as const,
  menuItems: () => [...posKeys.all, 'menu-items'] as const,
  transactions: () => [...posKeys.all, 'transactions'] as const,
  paymentMethods: () => [...posKeys.all, 'payment-methods'] as const,
};

// Fetch POS terminals
export function usePOSTerminals() {
  return useQuery({
    queryKey: posKeys.terminals(),
    queryFn: async () => {
      const response = await fetch('/api/admin/pos/terminals');
      if (response.status === 401 || !response.ok) {
        return DEMO_POS_TERMINALS;
      }
      const payload = await response.json();
      const terminals = payload.data ?? payload.terminals;
      return Array.isArray(terminals) && terminals.length > 0 ? terminals : DEMO_POS_TERMINALS;
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
      if (response.status === 401 || !response.ok) {
        return DEMO_POS_MENU_ITEMS;
      }
      const payload = await response.json();
      const menuItems = payload.data ?? payload.menuItems;
      return Array.isArray(menuItems) && menuItems.length > 0 ? menuItems : DEMO_POS_MENU_ITEMS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Process a sale
export function useProcessSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sale: { items: Array<{ id: string; price: number; quantity: number }>; paymentMethod: 'card' | 'cash' | 'mobile'; terminalId: string }) => {
      const response = await fetch('/api/admin/pos/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          terminal_id: sale.terminalId,
          payment_method: sale.paymentMethod,
          items: sale.items.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          total: sale.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to process sale');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: posKeys.terminals() });
      queryClient.invalidateQueries({ queryKey: posKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: posKeys.menuItems() });
    },
  });
}

// Fetch POS transactions
export function usePOSTransactions(params?: { terminalId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: posKeys.transactions(),
    queryFn: async () => {
      const search = new URLSearchParams();
      if (params?.terminalId) search.append('terminal_id', params.terminalId);
      if (params?.startDate) search.append('start_date', params.startDate);
      if (params?.endDate) search.append('end_date', params.endDate);
      const response = await fetch(`/api/admin/pos/transactions${search.toString() ? `?${search.toString()}` : ''}`);
      if (response.status === 401 || !response.ok) {
        return DEMO_POS_TRANSACTIONS;
      }
      const payload = await response.json();
      const transactions = payload.data ?? payload.transactions;
      return Array.isArray(transactions) && transactions.length > 0 ? transactions : DEMO_POS_TRANSACTIONS;
    },
    staleTime: 60 * 1000,
  });
}

// Fetch payment methods (for POS tender selection)
export function usePOSPaymentMethods() {
  return useQuery({
    queryKey: posKeys.paymentMethods(),
    queryFn: async () => {
      const response = await fetch('/api/wallet/payment-methods');
      if (response.status === 401 || !response.ok) {
        return DEMO_PAYMENT_METHODS;
      }
      const payload = await response.json();
      const methods = payload.data ?? payload.payment_methods ?? payload.paymentMethods;
      return Array.isArray(methods) && methods.length > 0 ? methods : DEMO_PAYMENT_METHODS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Combined hook for POS page
export function usePOSData() {
  const terminalsQuery = usePOSTerminals();
  const menuItemsQuery = usePOSMenuItems();
  const transactionsQuery = usePOSTransactions();
  const paymentMethodsQuery = usePOSPaymentMethods();
  const processSaleMutation = useProcessSale();

  const terminals = terminalsQuery.data || DEMO_POS_TERMINALS;
  const menuItems = menuItemsQuery.data || DEMO_POS_MENU_ITEMS;
  const transactions = transactionsQuery.data || DEMO_POS_TRANSACTIONS;
  const paymentMethods = paymentMethodsQuery.data || DEMO_PAYMENT_METHODS;

  return {
    terminals,
    menuItems,
    transactions,
    paymentMethods,
    isLoading: terminalsQuery.isLoading || menuItemsQuery.isLoading || transactionsQuery.isLoading || paymentMethodsQuery.isLoading,
    error: terminalsQuery.error || menuItemsQuery.error || transactionsQuery.error || paymentMethodsQuery.error,
    refetchTerminals: terminalsQuery.refetch,
    refetchMenuItems: menuItemsQuery.refetch,
    refetchTransactions: transactionsQuery.refetch,
    refetchPaymentMethods: paymentMethodsQuery.refetch,
    processSale: processSaleMutation.mutateAsync,
    isProcessing: processSaleMutation.isPending,
  };
}
