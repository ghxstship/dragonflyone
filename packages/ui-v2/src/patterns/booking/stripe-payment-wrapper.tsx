/**
 * Stripe Payment Wrapper
 * Provides Stripe Elements context for payment form
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { PaymentForm } from './payment-form';

// Load Stripe (replace with your publishable key)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface StripePaymentWrapperProps {
  bookingId: string;
  amount: number;
  currency: string;
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
}

export function StripePaymentWrapper({
  bookingId,
  amount,
  currency,
  clientSecret,
  onSuccess,
  onError,
  isSubmitting,
  setIsSubmitting,
}: StripePaymentWrapperProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    stripePromise.then((stripeInstance) => {
      setStripe(stripeInstance);
    });
  }, []);

  if (!clientSecret) {
    return (
      <div className="payment-loading">
        <div className="payment-loading__spinner" />
        <p>Initializing payment...</p>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#7B68EE',
        colorBackground: '#ffffff',
        colorText: '#111827',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        bookingId={bookingId}
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onError={onError}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    </Elements>
  );
}

StripePaymentWrapper.displayName = 'StripePaymentWrapper';
