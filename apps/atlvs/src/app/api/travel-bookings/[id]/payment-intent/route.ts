/**
 * ATLVS Travel Booking Payment Intent API
 * Creates Stripe payment intent for a travel booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const { id: bookingId } = params;

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

    // Check if booking is in valid state
    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: 'Booking is not in pending state' },
        { status: 400 }
      );
    }

    // If payment intent already exists, retrieve it
    if (booking.payment_intent_id) {
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(
          booking.payment_intent_id
        );

        if (existingIntent.status === 'succeeded') {
          return NextResponse.json(
            { error: 'Payment already completed' },
            { status: 400 }
          );
        }

        // Return existing intent if still valid
        if (
          existingIntent.status === 'requires_payment_method' ||
          existingIntent.status === 'requires_confirmation'
        ) {
          return NextResponse.json({
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id,
          });
        }
      } catch (err) {
        console.error('Error retrieving existing payment intent:', err);
        // Continue to create new intent
      }
    }

    // Create new payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.total * 100), // Convert to cents
      currency: booking.currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: booking.id,
        bookingNumber: booking.booking_number,
        platform: 'atlvs',
        packageId: booking.package_id,
        numTravelers: booking.num_travelers.toString(),
      },
      description: `ATLVS Travel Package: ${booking.package_name}`,
      receipt_email: booking.traveler_email,
    });

    // Update booking with payment intent ID
    await supabase
      .from('travel_bookings')
      .update({
        payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
