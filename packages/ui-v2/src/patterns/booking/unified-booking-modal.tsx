/**
 * Unified Booking Modal
 * Cross-platform booking component for GVTEWAY, ATLVS, and COMPVSS
 */

'use client';

import React, { useState, useCallback } from 'react';
import { StripePaymentWrapper } from './stripe-payment-wrapper';
import { PaymentForm } from './payment-form';
import type {
  Platform,
  UnifiedBookableItem,
  UnifiedBookingData,
  BookingAdapter,
  getBookingAdapter,
} from './cross-platform-types';
import './booking-modal.css';

interface UnifiedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: Platform;
  item: UnifiedBookableItem;
  initialData: Partial<UnifiedBookingData>;
  onBookingComplete?: (booking: UnifiedBookingData) => void;
}

type BookingStep = 'review' | 'details' | 'payment' | 'confirmation';

export function UnifiedBookingModal({
  isOpen,
  onClose,
  platform,
  item,
  initialData,
  onBookingComplete,
}: UnifiedBookingModalProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('review');
  const [formData, setFormData] = useState<Partial<UnifiedBookingData>>({
    platform,
    itemType: item.type,
    itemId: item.id,
    status: 'draft',
    ...initialData,
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get platform-specific adapter
  const adapter: BookingAdapter = (getBookingAdapter as (p: Platform) => BookingAdapter)(platform);

  // Handle guest details submission
  const handleGuestDetailsSubmit = useCallback(
    async (details: UnifiedBookingData['guestDetails']) => {
      setFormData((prev) => ({ ...prev, guestDetails: details }));
      setIsLoading(true);
      setError(null);

      try {
        // Create booking
        const bookingData: UnifiedBookingData = {
          ...(formData as UnifiedBookingData),
          guestDetails: details,
        };

        const { bookingId, bookingNumber } = await adapter.createBooking(bookingData);

        setFormData((prev) => ({
          ...prev,
          bookingId,
          bookingNumber,
          status: 'pending' as const,
        }));

        // Create payment intent
        const { clientSecret: secret, paymentIntentId } =
          await adapter.createPaymentIntent(bookingId);

        setFormData((prev) => ({
          ...prev,
          paymentIntentId,
        }));

        setClientSecret(secret);
        setCurrentStep('payment');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create booking');
      } finally {
        setIsLoading(false);
      }
    },
    [formData, adapter]
  );

  // Handle payment success
  const handlePaymentSuccess = useCallback(async () => {
    if (!formData.bookingId || !formData.paymentIntentId) {
      setError('Missing booking or payment information');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const confirmedBooking = await adapter.confirmBooking(
        formData.bookingId,
        formData.paymentIntentId
      );

      setFormData(confirmedBooking);
      setCurrentStep('confirmation');

      if (onBookingComplete) {
        onBookingComplete(confirmedBooking);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm booking');
    } finally {
      setIsLoading(false);
    }
  }, [formData.bookingId, formData.paymentIntentId, adapter, onBookingComplete]);

  // Handle payment error
  const handlePaymentError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="booking-modal">
      <div className="booking-modal__overlay" onClick={onClose} />

      <div className="booking-modal__container">
        {/* Header */}
        <div className="booking-modal__header">
          <h2 className="booking-modal__title">
            {currentStep === 'confirmation'
              ? 'Booking Confirmed!'
              : `Book ${item.type === 'experience' ? 'Experience' : item.type === 'package' ? 'Package' : 'Entry'}`}
          </h2>
          <button
            type="button"
            className="booking-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Progress Indicator */}
        {currentStep !== 'confirmation' && (
          <div className="booking-modal__progress">
            <div className="booking-modal__progress-steps">
              <div
                className={`booking-modal__progress-step ${
                  currentStep === 'review' ? 'booking-modal__progress-step--active' : ''
                } ${['details', 'payment'].includes(currentStep) ? 'booking-modal__progress-step--completed' : ''}`}
              >
                <div className="booking-modal__progress-step-number">1</div>
                <div className="booking-modal__progress-step-label">Review</div>
              </div>

              <div className="booking-modal__progress-line" />

              <div
                className={`booking-modal__progress-step ${
                  currentStep === 'details' ? 'booking-modal__progress-step--active' : ''
                } ${currentStep === 'payment' ? 'booking-modal__progress-step--completed' : ''}`}
              >
                <div className="booking-modal__progress-step-number">2</div>
                <div className="booking-modal__progress-step-label">Details</div>
              </div>

              <div className="booking-modal__progress-line" />

              <div
                className={`booking-modal__progress-step ${
                  currentStep === 'payment' ? 'booking-modal__progress-step--active' : ''
                }`}
              >
                <div className="booking-modal__progress-step-number">3</div>
                <div className="booking-modal__progress-step-label">Payment</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="booking-modal__error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Content */}
        <div className="booking-modal__content">
          {/* Step 1: Review */}
          {currentStep === 'review' && (
            <ReviewStep
              item={item}
              formData={formData}
              onContinue={() => setCurrentStep('details')}
            />
          )}

          {/* Step 2: Guest Details */}
          {currentStep === 'details' && (
            <GuestDetailsStep
              platform={platform}
              onSubmit={handleGuestDetailsSubmit}
              onBack={() => setCurrentStep('review')}
              isLoading={isLoading}
            />
          )}

          {/* Step 3: Payment */}
          {currentStep === 'payment' && clientSecret && formData.pricing && (
            <div className="booking-modal__payment-step">
              <StripePaymentWrapper clientSecret={clientSecret}>
                <PaymentForm
                  bookingId={formData.bookingId!}
                  amount={formData.pricing.total}
                  currency={formData.pricing.currency}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </StripePaymentWrapper>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 'confirmation' && (
            <ConfirmationStep item={item} booking={formData as UnifiedBookingData} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

// Review Step Component
function ReviewStep({
  item,
  formData,
  onContinue,
}: {
  item: UnifiedBookableItem;
  formData: Partial<UnifiedBookingData>;
  onContinue: () => void;
}) {
  return (
    <div className="booking-modal__review">
      <div className="booking-modal__item-summary">
        {item.images[0] && (
          <img
            src={item.images[0]}
            alt={item.title}
            className="booking-modal__item-image"
          />
        )}
        <div className="booking-modal__item-details">
          <h3 className="booking-modal__item-title">{item.title}</h3>
          <p className="booking-modal__item-description">{item.description}</p>
          <div className="booking-modal__item-meta">
            {item.location && (
              <div className="booking-modal__item-location">
                📍 {item.location.city}, {item.location.country}
              </div>
            )}
            {item.durationHours && (
              <div className="booking-modal__item-duration">
                ⏱️ {item.durationHours} hours
              </div>
            )}
            {formData.numGuests && (
              <div className="booking-modal__item-guests">
                👥 {formData.numGuests} {formData.numGuests === 1 ? 'guest' : 'guests'}
              </div>
            )}
          </div>
        </div>
      </div>

      {formData.pricing && (
        <div className="booking-modal__pricing-summary">
          <div className="booking-modal__pricing-row">
            <span>Subtotal</span>
            <span>
              {formData.pricing.currency} {formData.pricing.subtotal.toFixed(2)}
            </span>
          </div>
          {formData.pricing.addOnsTotal > 0 && (
            <div className="booking-modal__pricing-row">
              <span>Add-ons</span>
              <span>
                {formData.pricing.currency} {formData.pricing.addOnsTotal.toFixed(2)}
              </span>
            </div>
          )}
          <div className="booking-modal__pricing-row">
            <span>Service Fee</span>
            <span>
              {formData.pricing.currency} {formData.pricing.serviceFee.toFixed(2)}
            </span>
          </div>
          <div className="booking-modal__pricing-row">
            <span>Tax</span>
            <span>
              {formData.pricing.currency} {formData.pricing.tax.toFixed(2)}
            </span>
          </div>
          <div className="booking-modal__pricing-row booking-modal__pricing-total">
            <span>Total</span>
            <span>
              {formData.pricing.currency} {formData.pricing.total.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        className="booking-modal__btn booking-modal__btn--primary"
        onClick={onContinue}
      >
        Continue to Details
      </button>
    </div>
  );
}

// Guest Details Step Component
function GuestDetailsStep({
  platform,
  onSubmit,
  onBack,
  isLoading,
}: {
  platform: Platform;
  onSubmit: (details: UnifiedBookingData['guestDetails']) => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const [details, setDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    specialRequests: '',
    agreeToTerms: false,
    marketingOptIn: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(details);
  };

  const labelSuffix = platform === 'atlvs' ? 'Traveler' : platform === 'compvss' ? 'Participant' : 'Guest';

  return (
    <form className="booking-modal__form" onSubmit={handleSubmit}>
      <h3 className="booking-modal__form-title">{labelSuffix} Information</h3>

      <div className="booking-modal__form-row">
        <div className="booking-modal__form-field">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            required
            value={details.firstName}
            onChange={(e) => setDetails({ ...details, firstName: e.target.value })}
          />
        </div>

        <div className="booking-modal__form-field">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            required
            value={details.lastName}
            onChange={(e) => setDetails({ ...details, lastName: e.target.value })}
          />
        </div>
      </div>

      <div className="booking-modal__form-field">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          required
          value={details.email}
          onChange={(e) => setDetails({ ...details, email: e.target.value })}
        />
      </div>

      <div className="booking-modal__form-field">
        <label htmlFor="phone">Phone *</label>
        <input
          type="tel"
          id="phone"
          required
          value={details.phone}
          onChange={(e) => setDetails({ ...details, phone: e.target.value })}
        />
      </div>

      <div className="booking-modal__form-field">
        <label htmlFor="country">Country *</label>
        <input
          type="text"
          id="country"
          required
          value={details.country}
          onChange={(e) => setDetails({ ...details, country: e.target.value })}
        />
      </div>

      <div className="booking-modal__form-field">
        <label htmlFor="specialRequests">Special Requests</label>
        <textarea
          id="specialRequests"
          rows={4}
          value={details.specialRequests}
          onChange={(e) => setDetails({ ...details, specialRequests: e.target.value })}
        />
      </div>

      <div className="booking-modal__form-checkbox">
        <input
          type="checkbox"
          id="agreeToTerms"
          required
          checked={details.agreeToTerms}
          onChange={(e) => setDetails({ ...details, agreeToTerms: e.target.checked })}
        />
        <label htmlFor="agreeToTerms">
          I agree to the Terms of Service and Privacy Policy *
        </label>
      </div>

      <div className="booking-modal__form-checkbox">
        <input
          type="checkbox"
          id="marketingOptIn"
          checked={details.marketingOptIn}
          onChange={(e) => setDetails({ ...details, marketingOptIn: e.target.checked })}
        />
        <label htmlFor="marketingOptIn">
          Send me updates and promotional offers
        </label>
      </div>

      <div className="booking-modal__form-actions">
        <button
          type="button"
          className="booking-modal__btn booking-modal__btn--secondary"
          onClick={onBack}
          disabled={isLoading}
        >
          Back
        </button>
        <button
          type="submit"
          className="booking-modal__btn booking-modal__btn--primary"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Continue to Payment'}
        </button>
      </div>
    </form>
  );
}

// Confirmation Step Component
function ConfirmationStep({
  item,
  booking,
  onClose,
}: {
  item: UnifiedBookableItem;
  booking: UnifiedBookingData;
  onClose: () => void;
}) {
  return (
    <div className="booking-modal__confirmation">
      <div className="booking-modal__confirmation-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path d="M8 12l2 2 4-4" strokeWidth="2" />
        </svg>
      </div>

      <h3 className="booking-modal__confirmation-title">
        {item.type === 'experience'
          ? 'Experience Booked!'
          : item.type === 'package'
            ? 'Package Booked!'
            : 'Entry Confirmed!'}
      </h3>

      <p className="booking-modal__confirmation-message">
        Your booking number is <strong>{booking.bookingNumber}</strong>
      </p>

      <div className="booking-modal__confirmation-details">
        <p>
          A confirmation email has been sent to <strong>{booking.guestDetails.email}</strong>
        </p>
      </div>

      <button
        type="button"
        className="booking-modal__btn booking-modal__btn--primary"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}

UnifiedBookingModal.displayName = 'UnifiedBookingModal';
