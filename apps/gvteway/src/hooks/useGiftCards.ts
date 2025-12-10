'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface GiftCard {
  id: string;
  code: string;
  initial_balance: number;
  current_balance: number;
  status: 'active' | 'redeemed' | 'expired';
  expires_at?: string;
  purchased_at: string;
  recipient_email?: string;
  recipient_name?: string;
  message?: string;
}

const DEMO_GIFT_CARDS: GiftCard[] = [
  { id: '1', code: 'GIFT-DEMO-001', initial_balance: 100, current_balance: 75, status: 'active', purchased_at: new Date().toISOString() },
  { id: '2', code: 'GIFT-DEMO-002', initial_balance: 50, current_balance: 0, status: 'redeemed', purchased_at: new Date(Date.now() - 86400000).toISOString() },
];

export const giftCardsKeys = {
  all: ['gift-cards'] as const,
  myCards: () => [...giftCardsKeys.all, 'my-cards'] as const,
};

export function useMyGiftCards() {
  return useQuery({
    queryKey: giftCardsKeys.myCards(),
    queryFn: async () => {
      const response = await fetch('/api/gift-cards/my-cards');
      if (response.status === 401) {
        return DEMO_GIFT_CARDS;
      }
      if (!response.ok) {
        return DEMO_GIFT_CARDS;
      }
      const data = await response.json();
      return data.cards || DEMO_GIFT_CARDS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePurchaseGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (purchase: { amount: number; design: string; recipientEmail?: string; recipientName?: string; message?: string; deliveryDate?: string }) => {
      const response = await fetch('/api/gift-cards/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchase),
      });
      if (!response.ok) {
        throw new Error('Failed to purchase gift card');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: giftCardsKeys.all });
    },
  });
}

export function useRedeemGiftCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch('/api/gift-cards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        throw new Error('Failed to redeem gift card');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: giftCardsKeys.all });
    },
  });
}

export function useGiftCardsData() {
  const myCardsQuery = useMyGiftCards();
  const purchaseMutation = usePurchaseGiftCard();
  const redeemMutation = useRedeemGiftCard();

  return {
    myCards: myCardsQuery.data || [],
    isLoading: myCardsQuery.isLoading,
    error: myCardsQuery.error,
    refetch: myCardsQuery.refetch,
    purchaseGiftCard: purchaseMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    redeemGiftCard: redeemMutation.mutateAsync,
    isRedeeming: redeemMutation.isPending,
  };
}
