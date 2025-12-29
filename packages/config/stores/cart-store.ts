import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { StoreApi, UseBoundStore } from 'zustand';

/**
 * Cart State Store (GVTEWAY)
 * Manages shopping cart for event tickets and merchandise
 */
interface CartItem {
  id: string;
  type: 'ticket' | 'merch';
  eventId?: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  metadata?: Record<string, string | number | boolean>;
}

interface CartState {
  items: CartItem[];
  
  // Computed values
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  
  // Async state
  isApplyingPromo: boolean;
  promoError: string | null;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  // Discount/promo
  promoCode: string | null;
  discount: number;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => void;
  clearPromoError: () => void;
}

const TAX_RATE = 0.07; // 7% tax

/**
 * Recalculate cart totals from items
 * Centralized calculation to avoid duplication across actions
 */
function recalculateTotals(state: CartState): void {
  state.subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  state.tax = state.subtotal * TAX_RATE;
  state.total = state.subtotal + state.tax - state.discount;
}

export const useCartStore: UseBoundStore<StoreApi<CartState>> = create<CartState>()(
  devtools(
    persist(
      immer<CartState>((set) => ({
        // Initial state
        items: [],
        totalItems: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
        isApplyingPromo: false,
        promoError: null,
        promoCode: null,
        discount: 0,

        // Actions
        addItem: (item) =>
          set((state) => {
            const existingItemIndex = state.items.findIndex(
              (i) => i.productId === item.productId && i.eventId === item.eventId
            );

            if (existingItemIndex !== -1) {
              state.items[existingItemIndex].quantity += item.quantity;
            } else {
              state.items.push({
                ...item,
                id: Math.random().toString(36).substr(2, 9),
              });
            }

            recalculateTotals(state);
          }),

        removeItem: (id) =>
          set((state) => {
            state.items = state.items.filter((item) => item.id !== id);
            recalculateTotals(state);
          }),

        updateQuantity: (id, quantity) =>
          set((state) => {
            const item = state.items.find((item) => item.id === id);
            if (item) {
              if (quantity <= 0) {
                state.items = state.items.filter((item) => item.id !== id);
              } else {
                item.quantity = quantity;
              }
              recalculateTotals(state);
            }
          }),

        clearCart: () =>
          set((state) => {
            state.items = [];
            state.totalItems = 0;
            state.subtotal = 0;
            state.tax = 0;
            state.total = 0;
            state.promoCode = null;
            state.discount = 0;
          }),

        applyPromoCode: async (code) => {
          set((state) => {
            state.isApplyingPromo = true;
            state.promoError = null;
          });
          
          try {
            const response = await fetch('/api/promo-codes/validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code }),
            });
            
            if (!response.ok) {
              throw new Error('Invalid promo code');
            }
            
            const { discount_percent, discount_amount } = await response.json();
            
            set((state) => {
              state.promoCode = code;
              state.discount = discount_percent 
                ? state.subtotal * (discount_percent / 100)
                : (discount_amount || 0);
              state.total = state.subtotal + state.tax - state.discount;
              state.isApplyingPromo = false;
            });
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to apply promo code';
            set((state) => {
              state.promoError = errorMessage;
              state.isApplyingPromo = false;
            });
          }
        },

        removePromoCode: () =>
          set((state) => {
            state.promoCode = null;
            state.discount = 0;
            state.promoError = null;
            state.total = state.subtotal + state.tax;
          }),

        clearPromoError: () =>
          set((state) => {
            state.promoError = null;
          }),
      })),
      {
        name: 'ghxstship-cart-store',
      }
    ),
    { name: 'Cart Store' }
  )
);
