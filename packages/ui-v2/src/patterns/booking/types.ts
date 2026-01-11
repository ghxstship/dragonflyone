/**
 * Booking Pattern Types
 * Types for the booking flow and payment processing
 */

// Booking flow step types
export type BookingStep = 'review' | 'details' | 'payment' | 'confirmation';

// Guest details form data
export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  specialRequests?: string;
  agreeToTerms: boolean;
  marketingOptIn?: boolean;
}

// Booking form data (combines all steps)
export interface BookingFormData {
  // From booking widget
  experienceId: string;
  availabilityId: string;
  startDate: Date;
  endDate: Date;
  guests: number;
  selectedAddOns: Array<{
    addOnId: string;
    quantity: number;
  }>;

  // Pricing breakdown
  pricing: {
    subtotal: number;
    addOnsTotal: number;
    serviceFee: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
  };

  // Guest details (step 2)
  guestDetails?: GuestDetails;

  // Payment info (step 3)
  paymentIntentId?: string;
  paymentMethodId?: string;
}

// Booking creation request
export interface CreateBookingRequest {
  experienceId: string;
  availabilityId: string;
  numGuests: number;
  selectedAddOns: Array<{
    addOnId: string;
    quantity: number;
  }>;
  guestDetails: GuestDetails;
  pricing: {
    subtotal: number;
    addOnsTotal: number;
    serviceFee: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
  };
}

// Booking creation response
export interface CreateBookingResponse {
  bookingId: string;
  bookingNumber: string;
  status: 'pending';
  clientSecret?: string; // For Stripe payment intent
}

// Payment intent request
export interface CreatePaymentIntentRequest {
  bookingId: string;
}

// Payment intent response
export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

// Booking confirmation request
export interface ConfirmBookingRequest {
  bookingId: string;
  paymentIntentId: string;
}

// Booking confirmation response
export interface BookingConfirmation {
  bookingId: string;
  bookingNumber: string;
  status: 'confirmed';
  experience: {
    id: string;
    title: string;
    organizerName: string;
    startDate: Date;
    endDate: Date;
    location: string;
  };
  guestDetails: GuestDetails;
  pricing: {
    subtotal: number;
    addOnsTotal: number;
    serviceFee: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
  };
  paymentDetails: {
    paymentIntentId: string;
    paidAt: Date;
    paymentMethod: string; // e.g., "Visa ending in 4242"
  };
  cancellationPolicy: {
    type: 'flexible' | 'moderate' | 'strict';
    description: string;
  };
}

// Booking status
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'refunded';

// Booking summary (for user dashboard)
export interface BookingSummary {
  id: string;
  bookingNumber: string;
  experienceTitle: string;
  experienceSlug: string;
  organizerName: string;
  startDate: Date;
  endDate: Date;
  numGuests: number;
  total: number;
  currency: string;
  status: BookingStatus;
  createdAt: Date;
  thumbnail?: string;
}

// Full booking details (for single booking view)
export interface BookingDetails extends BookingSummary {
  guestDetails: GuestDetails;
  selectedAddOns: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  pricing: {
    subtotal: number;
    addOnsTotal: number;
    serviceFee: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
  };
  paymentDetails?: {
    paymentIntentId: string;
    paidAt: Date;
    paymentMethod: string;
  };
  cancellationPolicy: {
    type: 'flexible' | 'moderate' | 'strict';
    description: string;
    timeline: Array<{
      period: string;
      refundPercentage: number;
    }>;
  };
  cancelledAt?: Date;
  cancellationReason?: string;
  refundAmount?: number;
  refundedAt?: Date;
}

// Cancellation request
export interface CancelBookingRequest {
  bookingId: string;
  reason: string;
}

// Cancellation response
export interface CancelBookingResponse {
  bookingId: string;
  status: 'cancelled';
  refundAmount: number;
  refundPercentage: number;
  refundedAt?: Date;
  refundStatus: 'pending' | 'processing' | 'completed';
}

// Form validation errors
export interface BookingFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  country?: string;
  agreeToTerms?: string;
  payment?: string;
}
