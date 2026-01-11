/**
 * Confirm Booking API Endpoint
 * POST /api/bookings/confirm
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import type {
  ConfirmBookingRequest,
  BookingConfirmation,
} from '@/ui-v2/patterns/booking/types';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Parse request body
    const body: ConfirmBookingRequest = await request.json();
    const { bookingId, paymentIntentId } = body;

    // Validate required fields
    if (!bookingId || !paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get booking details with related data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        experiences(
          id,
          title,
          slug,
          category,
          cancellation_policy_type,
          cancellation_policy_json,
          organization_id,
          organizations(name)
        ),
        experience_availability(
          start_date,
          end_date
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify payment intent matches
    if (booking.payment_intent_id !== paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent mismatch' },
        { status: 400 }
      );
    }

    // Retrieve payment intent from Stripe to verify payment
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check payment status
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${paymentIntent.status}` },
        { status: 400 }
      );
    }

    // Get payment method details
    let paymentMethodDisplay = 'Card';
    if (paymentIntent.payment_method) {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentIntent.payment_method as string
      );

      if (paymentMethod.card) {
        paymentMethodDisplay = `${paymentMethod.card.brand} ending in ${paymentMethod.card.last4}`;
      }
    }

    // Update booking to confirmed
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Failed to update booking status:', updateError);
      return NextResponse.json(
        { error: 'Failed to confirm booking' },
        { status: 500 }
      );
    }

    // Parse cancellation policy
    const cancellationPolicy = {
      type: booking.experiences.cancellation_policy_type || 'moderate',
      description: getCancellationDescription(
        booking.experiences.cancellation_policy_type || 'moderate'
      ),
    };

    // Build confirmation response
    const confirmation: BookingConfirmation = {
      bookingId: booking.id,
      bookingNumber: booking.booking_number,
      status: 'confirmed',
      experience: {
        id: booking.experiences.id,
        title: booking.experiences.title,
        organizerName: booking.experiences.organizations.name,
        startDate: new Date(booking.experience_availability.start_date),
        endDate: new Date(booking.experience_availability.end_date),
        location: `${booking.experiences.city || ''}, ${booking.experiences.country || ''}`.trim(),
      },
      guestDetails: {
        firstName: booking.contact_first_name,
        lastName: booking.contact_last_name,
        email: booking.contact_email,
        phone: booking.contact_phone,
        country: booking.contact_country,
        specialRequests: booking.special_requests,
        agreeToTerms: true,
        marketingOptIn: booking.marketing_opt_in,
      },
      pricing: {
        subtotal: booking.subtotal,
        addOnsTotal: booking.addons_total,
        serviceFee: booking.service_fee,
        tax: booking.tax,
        discount: booking.discount,
        total: booking.total,
        currency: booking.currency,
      },
      paymentDetails: {
        paymentIntentId: paymentIntent.id,
        paidAt: new Date(paymentIntent.created * 1000),
        paymentMethod: paymentMethodDisplay,
      },
      cancellationPolicy,
    };

    // Send confirmation email to guest
    try {
      const { sendBookingConfirmationEmail, sendOrganizerBookingNotification } =
        await import('@/lib/email/send-email');

      await sendBookingConfirmationEmail(confirmation);

      // Send notification to organizer
      // Note: You'll need to fetch the organizer's email from the database
      // await sendOrganizerBookingNotification(confirmation, organizerEmail);
    } catch (emailError) {
      console.error('Failed to send emails:', emailError);
      // Don't fail the request if emails fail - booking is already confirmed
    }

    return NextResponse.json(confirmation);
  } catch (error) {
    console.error('Confirm booking error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get cancellation policy description
function getCancellationDescription(type: string): string {
  switch (type) {
    case 'flexible':
      return 'Free cancellation up to 24 hours before the experience starts';
    case 'moderate':
      return 'Free cancellation up to 7 days before the experience starts';
    case 'strict':
      return 'Free cancellation up to 30 days before the experience starts';
    default:
      return 'See cancellation policy for details';
  }
}
