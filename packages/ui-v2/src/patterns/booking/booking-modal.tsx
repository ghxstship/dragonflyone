/**
 * Booking Modal Component
 * Multi-step booking flow modal
 */

'use client';

import React, { useState, useCallback } from 'react';
import type {
  BookingStep,
  BookingFormData,
  GuestDetails,
  BookingConfirmation,
  BookingFormErrors,
} from './types';
import './booking-modal.css';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Pick<
    BookingFormData,
    | 'experienceId'
    | 'availabilityId'
    | 'startDate'
    | 'endDate'
    | 'guests'
    | 'selectedAddOns'
    | 'pricing'
  >;
  experienceTitle: string;
  organizerName: string;
  onBookingComplete?: (confirmation: BookingConfirmation) => void;
}

export function BookingModal({
  isOpen,
  onClose,
  initialData,
  experienceTitle,
  organizerName,
  onBookingComplete,
}: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('review');
  const [formData, setFormData] = useState<BookingFormData>(initialData);
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step navigation
  const goToStep = useCallback((step: BookingStep) => {
    setCurrentStep(step);
    setErrors({});
  }, []);

  const goToNextStep = useCallback(() => {
    const steps: BookingStep[] = ['review', 'details', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      goToStep(steps[currentIndex + 1]);
    }
  }, [currentStep, goToStep]);

  const goToPreviousStep = useCallback(() => {
    const steps: BookingStep[] = ['review', 'details', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      goToStep(steps[currentIndex - 1]);
    }
  }, [currentStep, goToStep]);

  // Form validation
  const validateGuestDetails = useCallback(
    (details: GuestDetails): BookingFormErrors => {
      const newErrors: BookingFormErrors = {};

      if (!details.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }

      if (!details.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!details.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(details.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!details.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!phoneRegex.test(details.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }

      if (!details.country) {
        newErrors.country = 'Country is required';
      }

      if (!details.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }

      return newErrors;
    },
    []
  );

  // Handle guest details submission
  const handleGuestDetailsSubmit = useCallback(
    (details: GuestDetails) => {
      const validationErrors = validateGuestDetails(details);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setFormData((prev) => ({ ...prev, guestDetails: details }));
      goToNextStep();
    },
    [validateGuestDetails, goToNextStep]
  );

  // Handle payment submission
  const handlePaymentSubmit = useCallback(
    async (paymentIntentId: string, paymentMethodId: string) => {
      setIsSubmitting(true);
      setErrors({});

      try {
        // Create booking with payment details
        const response = await fetch('/api/bookings/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            paymentIntentId,
            paymentMethodId,
          }),
        });

        if (!response.ok) {
          throw new Error('Booking confirmation failed');
        }

        const confirmation: BookingConfirmation = await response.json();

        // Update form data and go to confirmation
        setFormData((prev) => ({
          ...prev,
          paymentIntentId,
          paymentMethodId,
        }));

        goToNextStep();

        // Notify parent component
        if (onBookingComplete) {
          onBookingComplete(confirmation);
        }
      } catch (error) {
        setErrors({ payment: 'Payment failed. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, goToNextStep, onBookingComplete]
  );

  // Close modal and reset
  const handleClose = useCallback(() => {
    if (currentStep === 'confirmation') {
      // Allow closing on confirmation screen
      onClose();
      // Reset after a delay to avoid flicker
      setTimeout(() => {
        setCurrentStep('review');
        setFormData(initialData);
        setErrors({});
      }, 300);
    } else {
      // Confirm before closing mid-flow
      if (
        confirm('Are you sure you want to cancel your booking? Your progress will be lost.')
      ) {
        onClose();
        setTimeout(() => {
          setCurrentStep('review');
          setFormData(initialData);
          setErrors({});
        }, 300);
      }
    }
  }, [currentStep, onClose, initialData]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="booking-modal-backdrop" onClick={handleClose} />

      {/* Modal */}
      <div className="booking-modal" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="booking-modal__header">
          <div className="booking-modal__header-content">
            <h2 className="booking-modal__title">
              {currentStep === 'confirmation' ? 'Booking Confirmed!' : 'Complete Your Booking'}
            </h2>
            <p className="booking-modal__subtitle">
              {experienceTitle} · {organizerName}
            </p>
          </div>
          <button
            className="booking-modal__close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
            </svg>
          </button>
        </div>

        {/* Progress Indicator */}
        {currentStep !== 'confirmation' && (
          <div className="booking-modal__progress">
            <div className="booking-progress">
              <div
                className={`booking-progress__step ${
                  currentStep === 'review' ? 'booking-progress__step--active' : ''
                } ${
                  ['details', 'payment', 'confirmation'].includes(currentStep)
                    ? 'booking-progress__step--completed'
                    : ''
                }`}
              >
                <div className="booking-progress__step-number">1</div>
                <div className="booking-progress__step-label">Review</div>
              </div>
              <div className="booking-progress__line" />
              <div
                className={`booking-progress__step ${
                  currentStep === 'details' ? 'booking-progress__step--active' : ''
                } ${
                  ['payment', 'confirmation'].includes(currentStep)
                    ? 'booking-progress__step--completed'
                    : ''
                }`}
              >
                <div className="booking-progress__step-number">2</div>
                <div className="booking-progress__step-label">Details</div>
              </div>
              <div className="booking-progress__line" />
              <div
                className={`booking-progress__step ${
                  currentStep === 'payment' ? 'booking-progress__step--active' : ''
                } ${
                  currentStep === 'confirmation' ? 'booking-progress__step--completed' : ''
                }`}
              >
                <div className="booking-progress__step-number">3</div>
                <div className="booking-progress__step-label">Payment</div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="booking-modal__content">
          {currentStep === 'review' && (
            <BookingReviewStep
              formData={formData}
              experienceTitle={experienceTitle}
              onNext={goToNextStep}
              onCancel={handleClose}
            />
          )}

          {currentStep === 'details' && (
            <GuestDetailsStep
              initialData={formData.guestDetails}
              errors={errors}
              onSubmit={handleGuestDetailsSubmit}
              onBack={goToPreviousStep}
            />
          )}

          {currentStep === 'payment' && (
            <PaymentStep
              formData={formData}
              isSubmitting={isSubmitting}
              error={errors.payment}
              onSubmit={handlePaymentSubmit}
              onBack={goToPreviousStep}
            />
          )}

          {currentStep === 'confirmation' && (
            <ConfirmationStep formData={formData} onClose={onClose} />
          )}
        </div>
      </div>
    </>
  );
}

// Step Components (placeholders - will be implemented next)

interface BookingReviewStepProps {
  formData: BookingFormData;
  experienceTitle: string;
  onNext: () => void;
  onCancel: () => void;
}

function BookingReviewStep({
  formData,
  experienceTitle,
  onNext,
  onCancel,
}: BookingReviewStepProps) {
  return (
    <div className="booking-step">
      <div className="booking-step__body">
        <h3 className="booking-step__heading">Review Your Booking</h3>
        <div className="booking-review">
          <div className="booking-review__item">
            <div className="booking-review__label">Experience</div>
            <div className="booking-review__value">{experienceTitle}</div>
          </div>
          <div className="booking-review__item">
            <div className="booking-review__label">Dates</div>
            <div className="booking-review__value">
              {formData.startDate.toLocaleDateString()} -{' '}
              {formData.endDate.toLocaleDateString()}
            </div>
          </div>
          <div className="booking-review__item">
            <div className="booking-review__label">Guests</div>
            <div className="booking-review__value">{formData.guests} guests</div>
          </div>
          {formData.selectedAddOns.length > 0 && (
            <div className="booking-review__item">
              <div className="booking-review__label">Add-ons</div>
              <div className="booking-review__value">
                {formData.selectedAddOns.length} add-on(s) selected
              </div>
            </div>
          )}
        </div>

        <div className="booking-pricing-summary">
          <h4 className="booking-pricing-summary__title">Pricing Summary</h4>
          <div className="booking-pricing-summary__item">
            <span>Subtotal</span>
            <span>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: formData.pricing.currency,
              }).format(formData.pricing.subtotal)}
            </span>
          </div>
          {formData.pricing.addOnsTotal > 0 && (
            <div className="booking-pricing-summary__item">
              <span>Add-ons</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: formData.pricing.currency,
                }).format(formData.pricing.addOnsTotal)}
              </span>
            </div>
          )}
          <div className="booking-pricing-summary__item">
            <span>Service Fee</span>
            <span>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: formData.pricing.currency,
              }).format(formData.pricing.serviceFee)}
            </span>
          </div>
          <div className="booking-pricing-summary__item">
            <span>Tax</span>
            <span>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: formData.pricing.currency,
              }).format(formData.pricing.tax)}
            </span>
          </div>
          {formData.pricing.discount > 0 && (
            <div className="booking-pricing-summary__item booking-pricing-summary__item--discount">
              <span>Discount</span>
              <span>
                -
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: formData.pricing.currency,
                }).format(formData.pricing.discount)}
              </span>
            </div>
          )}
          <div className="booking-pricing-summary__item booking-pricing-summary__item--total">
            <span>Total</span>
            <span>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: formData.pricing.currency,
              }).format(formData.pricing.total)}
            </span>
          </div>
        </div>
      </div>

      <div className="booking-step__footer">
        <button className="booking-step__btn booking-step__btn--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="booking-step__btn booking-step__btn--primary" onClick={onNext}>
          Continue to Details
        </button>
      </div>
    </div>
  );
}

interface GuestDetailsStepProps {
  initialData?: GuestDetails;
  errors: BookingFormErrors;
  onSubmit: (details: GuestDetails) => void;
  onBack: () => void;
}

function GuestDetailsStep({ initialData, errors, onSubmit, onBack }: GuestDetailsStepProps) {
  const [details, setDetails] = useState<GuestDetails>(
    initialData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      specialRequests: '',
      agreeToTerms: false,
      marketingOptIn: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(details);
  };

  return (
    <form className="booking-step" onSubmit={handleSubmit}>
      <div className="booking-step__body">
        <h3 className="booking-step__heading">Guest Information</h3>
        <p className="booking-step__description">
          Please provide your contact details for booking confirmation.
        </p>

        <div className="booking-form">
          <div className="booking-form__row">
            <div className="booking-form__field">
              <label className="booking-form__label" htmlFor="firstName">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                className={`booking-form__input ${errors.firstName ? 'booking-form__input--error' : ''}`}
                value={details.firstName}
                onChange={(e) => setDetails({ ...details, firstName: e.target.value })}
                required
              />
              {errors.firstName && (
                <span className="booking-form__error">{errors.firstName}</span>
              )}
            </div>

            <div className="booking-form__field">
              <label className="booking-form__label" htmlFor="lastName">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                className={`booking-form__input ${errors.lastName ? 'booking-form__input--error' : ''}`}
                value={details.lastName}
                onChange={(e) => setDetails({ ...details, lastName: e.target.value })}
                required
              />
              {errors.lastName && <span className="booking-form__error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="booking-form__field">
            <label className="booking-form__label" htmlFor="email">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              className={`booking-form__input ${errors.email ? 'booking-form__input--error' : ''}`}
              value={details.email}
              onChange={(e) => setDetails({ ...details, email: e.target.value })}
              required
            />
            {errors.email && <span className="booking-form__error">{errors.email}</span>}
          </div>

          <div className="booking-form__row">
            <div className="booking-form__field">
              <label className="booking-form__label" htmlFor="phone">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                className={`booking-form__input ${errors.phone ? 'booking-form__input--error' : ''}`}
                value={details.phone}
                onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                required
              />
              {errors.phone && <span className="booking-form__error">{errors.phone}</span>}
            </div>

            <div className="booking-form__field">
              <label className="booking-form__label" htmlFor="country">
                Country *
              </label>
              <select
                id="country"
                className={`booking-form__input ${errors.country ? 'booking-form__input--error' : ''}`}
                value={details.country}
                onChange={(e) => setDetails({ ...details, country: e.target.value })}
                required
              >
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
                {/* Add more countries as needed */}
              </select>
              {errors.country && <span className="booking-form__error">{errors.country}</span>}
            </div>
          </div>

          <div className="booking-form__field">
            <label className="booking-form__label" htmlFor="specialRequests">
              Special Requests (Optional)
            </label>
            <textarea
              id="specialRequests"
              className="booking-form__textarea"
              rows={4}
              value={details.specialRequests || ''}
              onChange={(e) => setDetails({ ...details, specialRequests: e.target.value })}
              placeholder="Any dietary restrictions, accessibility needs, or special occasions?"
            />
          </div>

          <div className="booking-form__checkbox-group">
            <label className="booking-form__checkbox">
              <input
                type="checkbox"
                checked={details.agreeToTerms}
                onChange={(e) => setDetails({ ...details, agreeToTerms: e.target.checked })}
                required
              />
              <span>
                I agree to the <a href="/terms">Terms and Conditions</a> and{' '}
                <a href="/privacy">Privacy Policy</a> *
              </span>
            </label>
            {errors.agreeToTerms && (
              <span className="booking-form__error">{errors.agreeToTerms}</span>
            )}

            <label className="booking-form__checkbox">
              <input
                type="checkbox"
                checked={details.marketingOptIn || false}
                onChange={(e) => setDetails({ ...details, marketingOptIn: e.target.checked })}
              />
              <span>Send me travel tips and exclusive offers</span>
            </label>
          </div>
        </div>
      </div>

      <div className="booking-step__footer">
        <button
          type="button"
          className="booking-step__btn booking-step__btn--secondary"
          onClick={onBack}
        >
          Back
        </button>
        <button type="submit" className="booking-step__btn booking-step__btn--primary">
          Continue to Payment
        </button>
      </div>
    </form>
  );
}

interface PaymentStepProps {
  formData: BookingFormData;
  isSubmitting: boolean;
  error?: string;
  onSubmit: (paymentIntentId: string, paymentMethodId: string) => void;
  onBack: () => void;
}

function PaymentStep({ formData, isSubmitting, error, onSubmit, onBack }: PaymentStepProps) {
  // Placeholder - will integrate Stripe Elements in next file
  return (
    <div className="booking-step">
      <div className="booking-step__body">
        <h3 className="booking-step__heading">Payment Information</h3>
        <p className="booking-step__description">
          Your payment is secure and encrypted. We never store your card details.
        </p>

        {error && <div className="booking-step__error">{error}</div>}

        <div className="booking-payment-placeholder">
          <p>Stripe payment form will be integrated here</p>
          <p>
            Total to pay:{' '}
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: formData.pricing.currency,
            }).format(formData.pricing.total)}
          </p>
        </div>
      </div>

      <div className="booking-step__footer">
        <button
          type="button"
          className="booking-step__btn booking-step__btn--secondary"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          type="button"
          className="booking-step__btn booking-step__btn--primary"
          onClick={() => onSubmit('test_payment_intent', 'test_payment_method')}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Complete Booking'}
        </button>
      </div>
    </div>
  );
}

interface ConfirmationStepProps {
  formData: BookingFormData;
  onClose: () => void;
}

function ConfirmationStep({ formData, onClose }: ConfirmationStepProps) {
  return (
    <div className="booking-step">
      <div className="booking-step__body">
        <div className="booking-confirmation">
          <div className="booking-confirmation__icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path
                d="M8 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h3 className="booking-confirmation__title">Booking Confirmed!</h3>
          <p className="booking-confirmation__message">
            Your booking has been confirmed. We've sent a confirmation email to{' '}
            {formData.guestDetails?.email}.
          </p>

          <div className="booking-confirmation__details">
            <div className="booking-confirmation__detail-item">
              <span className="booking-confirmation__detail-label">Booking Number</span>
              <span className="booking-confirmation__detail-value">
                {formData.paymentIntentId || 'BK-XXXXXX'}
              </span>
            </div>
            <div className="booking-confirmation__detail-item">
              <span className="booking-confirmation__detail-label">Dates</span>
              <span className="booking-confirmation__detail-value">
                {formData.startDate.toLocaleDateString()} -{' '}
                {formData.endDate.toLocaleDateString()}
              </span>
            </div>
            <div className="booking-confirmation__detail-item">
              <span className="booking-confirmation__detail-label">Guests</span>
              <span className="booking-confirmation__detail-value">{formData.guests}</span>
            </div>
          </div>

          <div className="booking-confirmation__next-steps">
            <h4>What's Next?</h4>
            <ul>
              <li>Check your email for booking confirmation and details</li>
              <li>Add the experience dates to your calendar</li>
              <li>Review the preparation guide sent to your email</li>
              <li>Contact the host if you have any questions</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="booking-step__footer">
        <button className="booking-step__btn booking-step__btn--primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

BookingModal.displayName = 'BookingModal';
