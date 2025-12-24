"use client";

import { useState, useCallback, useEffect } from "react";

export interface StripeConfig {
  publishableKey: string;
  accountId?: string;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentMethodResult {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface UseStripeOptions {
  config?: StripeConfig;
  onError?: (error: Error) => void;
}

export interface UseStripeReturn {
  isLoaded: boolean;
  isProcessing: boolean;
  error: string | null;
  createPaymentIntent: (params: {
    amount: number;
    currency?: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }) => Promise<PaymentIntentResult | null>;
  confirmPayment: (params: {
    clientSecret: string;
    paymentMethodId?: string;
    returnUrl?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  createPaymentMethod: (params: {
    type: "card";
    card: {
      number: string;
      expMonth: number;
      expYear: number;
      cvc: string;
    };
    billingDetails?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
      };
    };
  }) => Promise<PaymentMethodResult | null>;
  listPaymentMethods: (customerId: string) => Promise<PaymentMethodResult[]>;
  detachPaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  createRefund: (params: {
    paymentIntentId: string;
    amount?: number;
    reason?: string;
  }) => Promise<{ success: boolean; refundId?: string; error?: string }>;
}

export function useStripe(options: UseStripeOptions = {}): UseStripeReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In production, this would load the Stripe.js SDK
    // For now, we simulate the loaded state
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const createPaymentIntent = useCallback(
    async (params: {
      amount: number;
      currency?: string;
      customerId?: string;
      metadata?: Record<string, string>;
    }): Promise<PaymentIntentResult | null> => {
      setIsProcessing(true);
      setError(null);

      try {
        const response = await fetch("/api/payments/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: params.amount,
            currency: params.currency || "usd",
            customer_id: params.customerId,
            metadata: params.metadata,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create payment intent");
        }

        const data = await response.json();
        return {
          clientSecret: data.client_secret,
          paymentIntentId: data.payment_intent_id,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Payment failed";
        setError(errorMessage);
        options.onError?.(err instanceof Error ? err : new Error(errorMessage));
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [options]
  );

  const confirmPayment = useCallback(
    async (params: {
      clientSecret: string;
      paymentMethodId?: string;
      returnUrl?: string;
    }): Promise<{ success: boolean; error?: string }> => {
      setIsProcessing(true);
      setError(null);

      try {
        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_secret: params.clientSecret,
            payment_method_id: params.paymentMethodId,
            return_url: params.returnUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Payment confirmation failed");
        }

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Payment failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const createPaymentMethod = useCallback(
    async (params: {
      type: "card";
      card: {
        number: string;
        expMonth: number;
        expYear: number;
        cvc: string;
      };
      billingDetails?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: {
          line1?: string;
          line2?: string;
          city?: string;
          state?: string;
          postalCode?: string;
          country?: string;
        };
      };
    }): Promise<PaymentMethodResult | null> => {
      setIsProcessing(true);
      setError(null);

      try {
        const response = await fetch("/api/payments/methods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: params.type,
            card: params.card,
            billing_details: params.billingDetails,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create payment method");
        }

        const data = await response.json();
        return {
          id: data.id,
          type: data.type,
          card: data.card
            ? {
                brand: data.card.brand,
                last4: data.card.last4,
                expMonth: data.card.exp_month,
                expYear: data.card.exp_year,
              }
            : undefined,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to add payment method";
        setError(errorMessage);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const listPaymentMethods = useCallback(
    async (customerId: string): Promise<PaymentMethodResult[]> => {
      try {
        const response = await fetch(`/api/payments/methods?customer_id=${customerId}`);

        if (!response.ok) {
          return [];
        }

        const data = await response.json();
        return (data.methods || []).map((m: Record<string, unknown>) => ({
          id: m.id,
          type: m.type,
          card: m.card
            ? {
                brand: (m.card as Record<string, unknown>).brand,
                last4: (m.card as Record<string, unknown>).last4,
                expMonth: (m.card as Record<string, unknown>).exp_month,
                expYear: (m.card as Record<string, unknown>).exp_year,
              }
            : undefined,
        }));
      } catch {
        return [];
      }
    },
    []
  );

  const detachPaymentMethod = useCallback(
    async (paymentMethodId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/payments/methods/${paymentMethodId}`, {
          method: "DELETE",
        });
        return response.ok;
      } catch {
        return false;
      }
    },
    []
  );

  const createRefund = useCallback(
    async (params: {
      paymentIntentId: string;
      amount?: number;
      reason?: string;
    }): Promise<{ success: boolean; refundId?: string; error?: string }> => {
      setIsProcessing(true);
      setError(null);

      try {
        const response = await fetch("/api/payments/refunds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_intent_id: params.paymentIntentId,
            amount: params.amount,
            reason: params.reason,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Refund failed");
        }

        const data = await response.json();
        return { success: true, refundId: data.refund_id };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Refund failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    isLoaded,
    isProcessing,
    error,
    createPaymentIntent,
    confirmPayment,
    createPaymentMethod,
    listPaymentMethods,
    detachPaymentMethod,
    createRefund,
  };
}

export default useStripe;
