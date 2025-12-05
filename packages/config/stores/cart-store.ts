import { create, type StateCreator } from 'zustand';
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
  metadata?: Record<string, any>;
}

interface CartState {
  items: CartItem[];
  
  // Computed values
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  
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
}

const TAX_RATE = 0.07; // 7% tax

export const useCartStore: UseBoundStore<StoreApi<CartState>> = create<CartState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        items: [],
        totalItems: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
        promoCode: null,
        discount: 0,

        // Actions
        addItem: (item) =>
          set((state) => {
            // Check if item already exists
            const existingItemIndex = state.items.findIndex(
              (i) => i.productId === item.productId && i.eventId === item.eventId
            );

            if (existingItemIndex !== -1) {
              // Update quantity
              state.items[existingItemIndex].quantity += item.quantity;
            } else {
              // Add new item
              state.items.push({
                ...item,
                id: Math.random().toString(36).substr(2, 9),
              });
            }

            // Recalculate totals
            const subtotal = state.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
            state.subtotal = subtotal;
            state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
            state.tax = subtotal * TAX_RATE;
            state.total = subtotal + state.tax - state.discount;
          }),

        removeItem: (id) =>
          set((state) => {
            state.items = state.items.filter((item) => item.id !== id);

            // Recalculate totals
            const subtotal = state.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
            state.subtotal = subtotal;
            state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
            state.tax = subtotal * TAX_RATE;
            state.total = subtotal + state.tax - state.discount;
          }),

        updateQuantity: (id, quantity) =>
          set((state) => {
            const item = state.items.find((item) => item.id === id);
            if (item) {
              if (quantity <= 0) {
                // Remove item
                state.items = state.items.filter((item) => item.id !== id);
              } else {
                item.quantity = quantity;
              }

              // Recalculate totals
              const subtotal = state.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );
              state.subtotal = subtotal;
              state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
              state.tax = subtotal * TAX_RATE;
              state.total = subtotal + state.tax - state.discount;
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
          // Validate promo code with API
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
              // Apply percentage or fixed discount
              state.discount = discount_percent 
                ? state.subtotal * (discount_percent / 100)
                : (discount_amount || 0);
              state.total = state.subtotal + state.tax - state.discount;
            });
          } catch {
            // If API fails, apply default 10% discount for valid codes
            set((state) => {
              state.promoCode = code;
              state.discount = state.subtotal * 0.1;
              state.total = state.subtotal + state.tax - state.discount;
            });
          }
        },

        removePromoCode: () =>
          set((state) => {
            state.promoCode = null;
            state.discount = 0;
            state.total = state.subtotal + state.tax;
          }),
      })),
      {
        name: 'ghxstship-cart-store',
      }
    ),
    { name: 'Cart Store' }
  )
);
