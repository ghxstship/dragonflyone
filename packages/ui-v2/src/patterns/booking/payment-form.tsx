/**
 * Stripe Payment Form Component
 * Integrates with Stripe Elements for secure payment processing
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import './payment-form.css';

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  currency: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
}

export function PaymentForm({
  bookingId,
  amount,
  currency,
  onSuccess,
  onError,
  isSubmitting,
  setIsSubmitting,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Payment element is ready when stripe and elements are loaded
    if (stripe && elements) {
      setIsReady(true);
    }
  }, [stripe, elements]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please wait.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/bookings/confirmation`,
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
        setIsSubmitting(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        onError('Payment did not complete. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      onError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <div className="payment-form__summary">
        <div className="payment-form__summary-item">
          <span className="payment-form__summary-label">Total Amount</span>
          <span className="payment-form__summary-value">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency,
            }).format(amount)}
          </span>
        </div>
      </div>

      <div className="payment-form__element">
        <PaymentElement
          options={{
            layout: 'tabs',
            business: { name: 'GVTEWAY' },
          }}
        />
      </div>

      {!isReady && (
        <div className="payment-form__loading">
          <div className="payment-form__spinner" />
          <p>Loading payment form...</p>
        </div>
      )}

      <div className="payment-form__security">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span>
          Your payment information is secure and encrypted. We never store your card
          details.
        </span>
      </div>
    </form>
  );
}

PaymentForm.displayName = 'PaymentForm';
