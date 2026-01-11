/**
 * Create Payment Intent API Endpoint
 * POST /api/bookings/[id]/payment-intent
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import type { CreatePaymentIntentResponse } from '@/ui-v2/patterns/booking/types';

// Initialize Stripe (use test key for now)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const bookingId = params.id;

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, experiences(title, organization_id)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking is in valid state for payment
    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: 'Booking is not in pending state' },
        { status: 400 }
      );
    }

    // Check if payment intent already exists
    if (booking.payment_intent_id) {
      // Retrieve existing payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(
        booking.payment_intent_id
      );

      const response: CreatePaymentIntentResponse = {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
      };

      return NextResponse.json(response);
    }

    // Create new Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.total * 100), // Convert to cents
      currency: booking.currency.toLowerCase(),
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.booking_number,
        experienceId: booking.experience_id,
        organizationId: booking.experiences.organization_id,
        guestEmail: booking.contact_email,
        guestName: `${booking.contact_first_name} ${booking.contact_last_name}`,
      },
      description: `Booking ${booking.booking_number} - ${booking.experiences.title}`,
      receipt_email: booking.contact_email,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update booking with payment intent ID
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_intent_id: paymentIntent.id,
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Failed to update booking with payment intent:', updateError);
      // Note: Payment intent is created, so we'll return it anyway
    }

    const response: CreatePaymentIntentResponse = {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Create payment intent error:', error);

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
