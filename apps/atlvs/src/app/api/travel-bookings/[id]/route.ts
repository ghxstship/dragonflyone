/**
 * ATLVS Travel Booking Retrieval API
 * Get booking by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(
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

    // Format as unified booking data
    const unifiedBooking = {
      platform: 'atlvs' as const,
      itemType: 'package' as const,
      itemId: booking.package_id,
      bookingId: booking.id,
      bookingNumber: booking.booking_number,
      status: booking.status,

      startDate: new Date(booking.travel_start_date),
      endDate: new Date(booking.travel_end_date),
      createdAt: new Date(booking.created_at),
      confirmedAt: booking.confirmed_at ? new Date(booking.confirmed_at) : undefined,

      numGuests: booking.num_travelers,
      guestDetails: {
        firstName: booking.traveler_first_name,
        lastName: booking.traveler_last_name,
        email: booking.traveler_email,
        phone: booking.traveler_phone,
        country: booking.traveler_country,
        specialRequests: booking.special_requests,
        agreeToTerms: true,
        marketingOptIn: booking.marketing_opt_in,
      },

      pricing: {
        subtotal: booking.subtotal,
        addOnsTotal: booking.add_ons_total,
        serviceFee: booking.service_fee,
        tax: booking.tax,
        discount: booking.discount,
        total: booking.total,
        currency: booking.currency,
      },

      selectedAddOns: booking.selected_add_ons || [],
      paymentIntentId: booking.payment_intent_id,
      paymentStatus: booking.payment_status,

      metadata: {
        packageName: booking.package_name,
      },
    };

    return NextResponse.json(unifiedBooking);
  } catch (error) {
    console.error('Booking retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
