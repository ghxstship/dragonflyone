/**
 * Cross-Platform Booking Types
 * Unified booking system for GVTEWAY, ATLVS, and COMPVSS
 */

// Platform identifier
export type Platform = 'gvteway' | 'atlvs' | 'compvss';

// Bookable item types across platforms
export type BookableType = 'experience' | 'package' | 'competition' | 'event';

/**
 * Unified Bookable Item
 * Represents any bookable item across all platforms
 */
export interface UnifiedBookableItem {
  id: string;
  platform: Platform;
  type: BookableType;

  // Basic info
  title: string;
  description: string;
  images: string[];
  organizerId: string;
  organizerName: string;

  // Pricing
  basePrice: number;
  currency: string;

  // Capacity
  minGuests?: number;
  maxGuests?: number;

  // Duration
  durationHours?: number;
  durationDays?: number;

  // Availability
  startDate?: Date;
  endDate?: Date;
  location?: {
    name: string;
    address?: string;
    city?: string;
    country?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  // Platform-specific data
  metadata: Record<string, unknown>;
}

/**
 * Unified Booking Data
 * Common structure for bookings across all platforms
 */
export interface UnifiedBookingData {
  // Platform info
  platform: Platform;
  itemType: BookableType;
  itemId: string;

  // Booking details
  bookingId?: string;
  bookingNumber?: string;
  status: 'draft' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

  // Dates
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  confirmedAt?: Date;

  // Participants
  numGuests: number;
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    specialRequests?: string;
    agreeToTerms: boolean;
    marketingOptIn?: boolean;
  };

  // Pricing
  pricing: {
    subtotal: number;
    addOnsTotal: number;
    serviceFee: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
  };

  // Add-ons
  selectedAddOns: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;

  // Payment
  paymentIntentId?: string;
  paymentStatus?: 'pending' | 'processing' | 'succeeded' | 'failed';

  // Platform-specific data
  metadata: Record<string, unknown>;
}

/**
 * Platform-Specific Adapters
 */

// GVTEWAY Experience → Unified
export interface GVTEWAYExperience {
  id: string;
  title: string;
  description: string;
  tagline?: string;
  images: string[];
  organizerId: string;
  organizerName?: string;
  basePrice: number;
  currency: string;
  maxGuests: number;
  durationHours: number;
  location: {
    name: string;
    city: string;
    country: string;
    address?: string;
  };
  category?: string;
  difficulty?: string;
  included?: string[];
}

export function adaptGVTEWAYExperience(exp: GVTEWAYExperience): UnifiedBookableItem {
  return {
    id: exp.id,
    platform: 'gvteway',
    type: 'experience',
    title: exp.title,
    description: exp.description,
    images: exp.images,
    organizerId: exp.organizerId,
    organizerName: exp.organizerName || 'Unknown Organizer',
    basePrice: exp.basePrice,
    currency: exp.currency,
    maxGuests: exp.maxGuests,
    durationHours: exp.durationHours,
    location: {
      name: exp.location.name,
      address: exp.location.address,
      city: exp.location.city,
      country: exp.location.country,
    },
    metadata: {
      category: exp.category,
      difficulty: exp.difficulty,
      included: exp.included,
    },
  };
}

// ATLVS Package → Unified
export interface ATLVSPackage {
  id: string;
  name: string;
  description?: string;
  event_types: string[];
  base_price: number;
  min_guests?: number;
  max_guests?: number;
  duration_hours?: number;
  included_items: Array<{
    name: string;
    category: string;
    quantity: number;
  }>;
  optional_add_ons: string[];
  is_featured: boolean;
  is_active: boolean;
}

export function adaptATLVSPackage(pkg: ATLVSPackage): UnifiedBookableItem {
  return {
    id: pkg.id,
    platform: 'atlvs',
    type: 'package',
    title: pkg.name,
    description: pkg.description || '',
    images: [], // TODO: Add images support to ATLVS packages
    organizerId: '', // TODO: Add organizer support to ATLVS packages
    organizerName: 'ATLVS',
    basePrice: pkg.base_price,
    currency: 'USD',
    minGuests: pkg.min_guests,
    maxGuests: pkg.max_guests,
    durationHours: pkg.duration_hours,
    metadata: {
      eventTypes: pkg.event_types,
      includedItems: pkg.included_items,
      optionalAddOns: pkg.optional_add_ons,
      isFeatured: pkg.is_featured,
    },
  };
}

// COMPVSS Competition → Unified
export interface COMPVSSCompetition {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: {
    name: string;
    address?: string;
    city?: string;
    country?: string;
  };
  entryFee: number;
  maxParticipants?: number;
  category: string;
  status: 'draft' | 'open' | 'closed' | 'completed';
}

export function adaptCOMPVSSCompetition(comp: COMPVSSCompetition): UnifiedBookableItem {
  return {
    id: comp.id,
    platform: 'compvss',
    type: 'competition',
    title: comp.name,
    description: comp.description || '',
    images: [], // TODO: Add images support to COMPVSS competitions
    organizerId: '', // TODO: Add organizer support to COMPVSS competitions
    organizerName: 'COMPVSS',
    basePrice: comp.entryFee,
    currency: 'USD',
    maxGuests: comp.maxParticipants,
    startDate: new Date(comp.startDate),
    endDate: new Date(comp.endDate),
    location: comp.location,
    metadata: {
      category: comp.category,
      status: comp.status,
    },
  };
}

/**
 * Booking Adapter Interface
 * Each platform implements this to handle bookings
 */
export interface BookingAdapter {
  platform: Platform;

  // Create a booking
  createBooking(data: UnifiedBookingData): Promise<{ bookingId: string; bookingNumber: string }>;

  // Get booking by ID
  getBooking(bookingId: string): Promise<UnifiedBookingData>;

  // Create payment intent
  createPaymentIntent(bookingId: string): Promise<{ clientSecret: string; paymentIntentId: string }>;

  // Confirm booking after payment
  confirmBooking(bookingId: string, paymentIntentId: string): Promise<UnifiedBookingData>;

  // Cancel booking
  cancelBooking(bookingId: string): Promise<void>;
}

/**
 * Platform-specific adapter factories
 */
export function createGVTEWAYAdapter(): BookingAdapter {
  return {
    platform: 'gvteway',

    async createBooking(data: UnifiedBookingData) {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId: data.itemId,
          availabilityId: data.metadata.availabilityId,
          numGuests: data.numGuests,
          selectedAddOns: data.selectedAddOns.map((a) => ({
            addOnId: a.id,
            quantity: a.quantity,
          })),
          guestDetails: data.guestDetails,
          pricing: data.pricing,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await response.json();
      return {
        bookingId: result.bookingId,
        bookingNumber: result.bookingNumber,
      };
    },

    async getBooking(bookingId: string) {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking');
      }
      return response.json();
    },

    async createPaymentIntent(bookingId: string) {
      const response = await fetch(`/api/bookings/${bookingId}/payment-intent`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return response.json();
    },

    async confirmBooking(bookingId: string, paymentIntentId: string) {
      const response = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, paymentIntentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm booking');
      }

      return response.json();
    },

    async cancelBooking(bookingId: string) {
      await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'POST' });
    },
  };
}

export function createATLVSAdapter(): BookingAdapter {
  return {
    platform: 'atlvs',

    async createBooking(data: UnifiedBookingData) {
      const response = await fetch('/api/travel-bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: data.itemId,
          numTravelers: data.numGuests,
          travelDates: {
            start: data.startDate,
            end: data.endDate,
          },
          selectedAddOns: data.selectedAddOns,
          travelerDetails: data.guestDetails,
          pricing: data.pricing,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create travel booking');
      }

      const result = await response.json();
      return {
        bookingId: result.bookingId,
        bookingNumber: result.bookingNumber,
      };
    },

    async getBooking(bookingId: string) {
      const response = await fetch(`/api/travel-bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking');
      }
      return response.json();
    },

    async createPaymentIntent(bookingId: string) {
      const response = await fetch(`/api/travel-bookings/${bookingId}/payment-intent`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return response.json();
    },

    async confirmBooking(bookingId: string, paymentIntentId: string) {
      const response = await fetch('/api/travel-bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, paymentIntentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm booking');
      }

      return response.json();
    },

    async cancelBooking(bookingId: string) {
      await fetch(`/api/travel-bookings/${bookingId}/cancel`, { method: 'POST' });
    },
  };
}

export function createCOMPVSSAdapter(): BookingAdapter {
  return {
    platform: 'compvss',

    async createBooking(data: UnifiedBookingData) {
      const response = await fetch('/api/competition-entries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: data.itemId,
          numParticipants: data.numGuests,
          participantDetails: data.guestDetails,
          pricing: data.pricing,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create competition entry');
      }

      const result = await response.json();
      return {
        bookingId: result.entryId,
        bookingNumber: result.entryNumber,
      };
    },

    async getBooking(bookingId: string) {
      const response = await fetch(`/api/competition-entries/${bookingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch entry');
      }
      return response.json();
    },

    async createPaymentIntent(bookingId: string) {
      const response = await fetch(`/api/competition-entries/${bookingId}/payment-intent`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return response.json();
    },

    async confirmBooking(bookingId: string, paymentIntentId: string) {
      const response = await fetch('/api/competition-entries/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: bookingId, paymentIntentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm entry');
      }

      return response.json();
    },

    async cancelBooking(bookingId: string) {
      await fetch(`/api/competition-entries/${bookingId}/cancel`, { method: 'POST' });
    },
  };
}

/**
 * Factory function to get the appropriate adapter
 */
export function getBookingAdapter(platform: Platform): BookingAdapter {
  switch (platform) {
    case 'gvteway':
      return createGVTEWAYAdapter();
    case 'atlvs':
      return createATLVSAdapter();
    case 'compvss':
      return createCOMPVSSAdapter();
    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}
