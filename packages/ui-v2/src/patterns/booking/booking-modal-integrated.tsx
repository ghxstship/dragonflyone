/**
 * Booking Modal with API Integration
 * Complete booking flow with real API calls and Stripe payment
 */

'use client';

import React, { useState, useCallback } from 'react';
import { StripePaymentWrapper } from './stripe-payment-wrapper';
import type {
  BookingStep,
  BookingFormData,
  GuestDetails,
  BookingConfirmation,
  BookingFormErrors,
  CreateBookingRequest,
} from './types';

interface PaymentStepIntegratedProps {
  bookingId: string;
  formData: BookingFormData;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  error?: string;
  setError: (error: string) => void;
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
}

export function PaymentStepIntegrated({
  bookingId,
  formData,
  isSubmitting,
  setIsSubmitting,
  error,
  setError,
  onSuccess,
  onBack,
}: PaymentStepIntegratedProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoadingPaymentIntent, setIsLoadingPaymentIntent] = useState(false);

  // Create payment intent when component mounts
  React.useEffect(() => {
    if (!clientSecret && bookingId) {
      createPaymentIntent();
    }
  }, [bookingId]);

  const createPaymentIntent = async () => {
    setIsLoadingPaymentIntent(true);
    setError('');

    try {
      const response = await fetch(`/api/bookings/${bookingId}/payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize payment');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
    } finally {
      setIsLoadingPaymentIntent(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    // Confirm the booking
    try {
      const response = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentIntentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm booking');
      }

      onSuccess(paymentIntentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm booking');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-step">
      <div className="booking-step__body">
        <h3 className="booking-step__heading">Payment Information</h3>
        <p className="booking-step__description">
          Your payment is secure and encrypted. We never store your card details.
        </p>

        {error && <div className="booking-step__error">{error}</div>}

        {isLoadingPaymentIntent ? (
          <div className="payment-loading">
            <div className="payment-loading__spinner" />
            <p>Setting up secure payment...</p>
          </div>
        ) : clientSecret ? (
          <StripePaymentWrapper
            bookingId={bookingId}
            amount={formData.pricing.total}
            currency={formData.pricing.currency}
            clientSecret={clientSecret}
            onSuccess={handlePaymentSuccess}
            onError={setError}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        ) : null}
      </div>

      <div className="booking-step__footer">
        <button
          type="button"
          className="booking-step__btn booking-step__btn--secondary"
          onClick={onBack}
          disabled={isSubmitting || isLoadingPaymentIntent}
        >
          Back
        </button>
        <button
          type="submit"
          form="payment-form"
          className="booking-step__btn booking-step__btn--primary"
          disabled={isSubmitting || isLoadingPaymentIntent || !clientSecret}
        >
          {isSubmitting ? 'Processing...' : 'Complete Booking'}
        </button>
      </div>
    </div>
  );
}

// Helper function for creating booking via API
export async function createBookingAPI(
  formData: BookingFormData
): Promise<{ bookingId: string; bookingNumber: string }> {
  const request: CreateBookingRequest = {
    experienceId: formData.experienceId,
    availabilityId: formData.availabilityId,
    numGuests: formData.guests,
    selectedAddOns: formData.selectedAddOns,
    guestDetails: formData.guestDetails!,
    pricing: formData.pricing,
  };

  const response = await fetch('/api/bookings/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create booking');
  }

  const data = await response.json();
  return {
    bookingId: data.bookingId,
    bookingNumber: data.bookingNumber,
  };
}
