/**
 * Unified Booking Modal Tests
 * Component tests for the cross-platform booking modal
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UnifiedBookingModal } from '../unified-booking-modal';
import type { UnifiedBookableItem, UnifiedBookingData } from '../cross-platform-types';

// Mock fetch globally
global.fetch = jest.fn();

// Mock Stripe components
jest.mock('../stripe-payment-wrapper', () => ({
  StripePaymentWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stripe-wrapper">{children}</div>
  ),
}));

jest.mock('../payment-form', () => ({
  PaymentForm: ({
    onSuccess,
    onError,
  }: {
    onSuccess: () => void;
    onError: (msg: string) => void;
  }) => (
    <div data-testid="payment-form">
      <button onClick={onSuccess}>Complete Payment</button>
      <button onClick={() => onError('Payment failed')}>Fail Payment</button>
    </div>
  ),
}));

describe('UnifiedBookingModal', () => {
  const mockGVTEWAYItem: UnifiedBookableItem = {
    id: 'exp-123',
    platform: 'gvteway',
    type: 'experience',
    title: 'Wine Tasting Tour',
    description: 'Explore local vineyards',
    images: ['image1.jpg'],
    organizerId: 'org-456',
    organizerName: 'Wine Tours Inc',
    basePrice: 150,
    currency: 'USD',
    maxGuests: 8,
    durationHours: 4,
    location: {
      name: 'Napa Valley',
      city: 'Napa',
      country: 'USA',
    },
    metadata: {},
  };

  const mockATLVSItem: UnifiedBookableItem = {
    id: 'pkg-789',
    platform: 'atlvs',
    type: 'package',
    title: 'European Adventure',
    description: 'Two weeks in Europe',
    images: [],
    organizerId: 'org-789',
    organizerName: 'ATLVS',
    basePrice: 2500,
    currency: 'USD',
    minGuests: 2,
    maxGuests: 20,
    durationHours: 336,
    metadata: {},
  };

  const mockCOMPVSSItem: UnifiedBookableItem = {
    id: 'comp-456',
    platform: 'compvss',
    type: 'competition',
    title: 'Gaming Tournament',
    description: 'Annual esports competition',
    images: [],
    organizerId: 'org-comp',
    organizerName: 'COMPVSS',
    basePrice: 50,
    currency: 'USD',
    maxGuests: 128,
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-03'),
    location: {
      name: 'Convention Center',
      city: 'Los Angeles',
      country: 'USA',
    },
    metadata: {},
  };

  const mockInitialData: Partial<UnifiedBookingData> = {
    numGuests: 2,
    pricing: {
      subtotal: 150,
      addOnsTotal: 0,
      serviceFee: 15,
      tax: 12,
      discount: 0,
      total: 177,
      currency: 'USD',
    },
    selectedAddOns: [],
  };

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <UnifiedBookingModal
          isOpen={false}
          onClose={jest.fn()}
          platform="gvteway"
          item={mockGVTEWAYItem}
          initialData={mockInitialData}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="gvteway"
          item={mockGVTEWAYItem}
          initialData={mockInitialData}
        />
      );

      expect(screen.getByText('Book Experience')).toBeInTheDocument();
    });

    it('should render with ATLVS platform-specific text', () => {
      render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="atlvs"
          item={mockATLVSItem}
          initialData={mockInitialData}
        />
      );

      expect(screen.getByText('Book Package')).toBeInTheDocument();
    });

    it('should render with COMPVSS platform-specific text', () => {
      render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="compvss"
          item={mockCOMPVSSItem}
          initialData={mockInitialData}
        />
      );

      expect(screen.getByText('Book Entry')).toBeInTheDocument();
    });
  });

  describe('Review Step', () => {
    it('should display item details', () => {
      render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="gvteway"
          item={mockGVTEWAYItem}
          initialData={mockInitialData}
        />
      );

      expect(screen.getByText('Wine Tasting Tour')).toBeInTheDocument();
      expect(screen.getByText('Explore local vineyards')).toBeInTheDocument();
      expect(screen.getByText(/Napa, USA/)).toBeInTheDocument();
      expect(screen.getByText(/4 hours/)).toBeInTheDocument();
    });

    it('should display pricing breakdown', () => {
      render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="gvteway"
          item={mockGVTEWAYItem}
          initialData={mockInitialData}
        />
      );

      expect(screen.getByText('Subtotal')).toBeInTheDocument();
      expect(screen.getByText('USD 150.00')).toBeInTheDocument();
      expect(screen.getByText('Service Fee')).toBeInTheDocument();
      expect(screen.getByText('USD 15.00')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('USD 177.00')).toBeInTheDocument();
    });

    it('should navigate to details step on continue', () => {
      render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="gvteway"
          item={mockGVTEWAYItem}
          initialData={mockInitialData}
        />
      );

      const continueButton = screen.getByText('Continue to Details');
      fireEvent.click(continueButton);

      expect(screen.getByText('Guest Information')).toBeInTheDocument();
    });
  });

  describe('Guest Details Step', () => {
    it('should display appropriate label for GVTEWAY', () => {
      render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="gvteway"
          item={mockGVTEWAYItem}
          initialData={mockInitialData}
        />
      );

      fireEvent.click(screen.getByText('Continue to Details'));
      expect(screen.getByText('Guest Information')).toBeInTheDocument();
    });

    it('should display appropriate label for ATLVS', () => {
      render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="atlvs"
          item={mockATLVSItem}
          initialData={mockInitialData}
        />
      );

      fireEvent.click(screen.getByText('Continue to Details'));
      expect(screen.getByText('Traveler Information')).toBeInTheDocument();
    });

    it('should display appropriate label for COMPVSS', () => {
      render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="compvss"
          item={mockCOMPVSSItem}
          initialData={mockInitialData}
        />
      );

      fireEvent.click(screen.getByText('Continue to Details'));
      expect(screen.getByText('Participant Information')).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="gvteway"
          item={mockGVTEWAYItem}
          initialData={mockInitialData}
        />
      );

      fireEvent.click(screen.getByText('Continue to Details'));

      const submitButton = screen.getByText('Continue to Payment');
      fireEvent.click(submitButton);

      // Form should not submit without required fields
      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });

    it('should create booking on valid submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          bookingId: 'booking-123',
          bookingNumber: 'GVTEWAY-123',
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          clientSecret: 'secret_123',
          paymentIntentId: 'pi_123',
        }),
      });

      render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="gvteway"
          item={mockGVTEWAYItem}
          initialData={mockInitialData}
        />
      );

      fireEvent.click(screen.getByText('Continue to Details'));

      // Fill in form
      fireEvent.change(screen.getByLabelText(/First Name/), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/Last Name/), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/Email/), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/Phone/), {
        target: { value: '555-1234' },
      });
      fireEvent.change(screen.getByLabelText(/Country/), {
        target: { value: 'USA' },
      });
      fireEvent.click(screen.getByLabelText(/agree to the Terms/));

      fireEvent.click(screen.getByText('Continue to Payment'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/bookings/create',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('should navigate back to review step', () => {
      render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="gvteway"
          item={mockGVTEWAYItem}
          initialData={mockInitialData}
        />
      );

      fireEvent.click(screen.getByText('Continue to Details'));
      fireEvent.click(screen.getByText('Back'));

      expect(screen.getByText('Continue to Details')).toBeInTheDocument();
    });
  });

  describe('Progress Indicator', () => {
    it('should show correct active step', () => {
      const { container } = render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="gvteway"
          item={mockGVTEWAYItem}
          initialData={mockInitialData}
        />
      );

      const activeSteps = container.querySelectorAll('.booking-modal__progress-step--active');
      expect(activeSteps).toHaveLength(1);
    });

    it('should update when navigating steps', () => {
      const { container } = render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="gvteway"
          item={mockGVTEWAYItem}
          initialData={mockInitialData}
        />
      );

      fireEvent.click(screen.getByText('Continue to Details'));

      const activeSteps = container.querySelectorAll('.booking-modal__progress-step--active');
      expect(activeSteps).toHaveLength(1);
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={onClose}
          platform="gvteway"
          item={mockGVTEWAYItem}
          initialData={mockInitialData}
        />
      );

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when overlay is clicked', () => {
      const onClose = jest.fn();
      const { container } = render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={onClose}
          platform="gvteway"
          item={mockGVTEWAYItem}
          initialData={mockInitialData}
        />
      );

      const overlay = container.querySelector('.booking-modal__overlay');
      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on booking creation failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Booking failed' }),
      });

      render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="gvteway"
          item={mockGVTEWAYItem}
          initialData={mockInitialData}
        />
      );

      fireEvent.click(screen.getByText('Continue to Details'));

      // Fill in form
      fireEvent.change(screen.getByLabelText(/First Name/), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/Last Name/), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/Email/), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/Phone/), {
        target: { value: '555-1234' },
      });
      fireEvent.change(screen.getByLabelText(/Country/), {
        target: { value: 'USA' },
      });
      fireEvent.click(screen.getByLabelText(/agree to the Terms/));

      fireEvent.click(screen.getByText('Continue to Payment'));

      await waitFor(() => {
        expect(screen.getByText('Failed to create booking')).toBeInTheDocument();
      });
    });
  });

  describe('onBookingComplete Callback', () => {
    it('should call onBookingComplete after successful payment', async () => {
      const onBookingComplete = jest.fn();

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            bookingId: 'booking-123',
            bookingNumber: 'GVTEWAY-123',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            clientSecret: 'secret_123',
            paymentIntentId: 'pi_123',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            bookingId: 'booking-123',
            status: 'confirmed',
          }),
        });

      render(
        <UnifiedBookingModal
          isOpen={true}
          onClose={jest.fn()}
          platform="gvteway"
          item={mockGVTEWAYItem}
          initialData={mockInitialData}
          onBookingComplete={onBookingComplete}
        />
      );

      // Navigate through steps and complete payment
      fireEvent.click(screen.getByText('Continue to Details'));

      // Fill form
      fireEvent.change(screen.getByLabelText(/First Name/), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/Last Name/), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/Email/), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/Phone/), {
        target: { value: '555-1234' },
      });
      fireEvent.change(screen.getByLabelText(/Country/), {
        target: { value: 'USA' },
      });
      fireEvent.click(screen.getByLabelText(/agree to the Terms/));

      fireEvent.click(screen.getByText('Continue to Payment'));

      await waitFor(() => {
        expect(screen.getByTestId('payment-form')).toBeInTheDocument();
      });

      // Complete payment
      fireEvent.click(screen.getByText('Complete Payment'));

      await waitFor(() => {
        expect(onBookingComplete).toHaveBeenCalled();
      });
    });
  });
});
