/**
 * ATLVS Travel Booking Confirmation API
 * Confirms a booking after successful payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const confirmBookingSchema = z.object({
  bookingId: z.string().uuid(),
  paymentIntentId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { bookingId, paymentIntentId } = confirmBookingSchema.parse(body);

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get booking
    const { data: booking, error: bookingError } = await supabase
      .from('travel_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify payment intent matches booking
    if (booking.payment_intent_id !== paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent mismatch' },
        { status: 400 }
      );
    }

    // Update booking status
    const { data: confirmedBooking, error: updateError } = await supabase
      .from('travel_bookings')
      .update({
        status: 'confirmed',
        payment_status: 'succeeded',
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Booking confirmation error:', updateError);
      return NextResponse.json(
        { error: 'Failed to confirm booking' },
        { status: 500 }
      );
    }

    // TODO: Send confirmation emails
    // - Email to traveler
    // - Notification to package organizer
    // This can be implemented similar to GVTEWAY's email system

    // Format response
    const confirmation = {
      platform: 'atlvs' as const,
      itemType: 'package' as const,
      itemId: confirmedBooking.package_id,
      bookingId: confirmedBooking.id,
      bookingNumber: confirmedBooking.booking_number,
      status: confirmedBooking.status,

      startDate: new Date(confirmedBooking.travel_start_date),
      endDate: new Date(confirmedBooking.travel_end_date),
      confirmedAt: new Date(confirmedBooking.confirmed_at),

      numGuests: confirmedBooking.num_travelers,
      guestDetails: {
        firstName: confirmedBooking.traveler_first_name,
        lastName: confirmedBooking.traveler_last_name,
        email: confirmedBooking.traveler_email,
        phone: confirmedBooking.traveler_phone,
        country: confirmedBooking.traveler_country,
        specialRequests: confirmedBooking.special_requests,
        agreeToTerms: true,
        marketingOptIn: confirmedBooking.marketing_opt_in,
      },

      pricing: {
        subtotal: confirmedBooking.subtotal,
        addOnsTotal: confirmedBooking.add_ons_total,
        serviceFee: confirmedBooking.service_fee,
        tax: confirmedBooking.tax,
        discount: confirmedBooking.discount,
        total: confirmedBooking.total,
        currency: confirmedBooking.currency,
      },

      selectedAddOns: confirmedBooking.selected_add_ons || [],
      paymentIntentId: confirmedBooking.payment_intent_id,
      paymentStatus: confirmedBooking.payment_status,

      metadata: {
        packageName: confirmedBooking.package_name,
      },
    };

    return NextResponse.json(confirmation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Booking confirmation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
