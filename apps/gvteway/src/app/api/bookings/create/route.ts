/**
 * Create Booking API Endpoint
 * POST /api/bookings/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CreateBookingRequest, CreateBookingResponse } from '@/ui-v2/patterns/booking/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Parse request body
    const body: CreateBookingRequest = await request.json();
    const {
      experienceId,
      availabilityId,
      numGuests,
      selectedAddOns,
      guestDetails,
      pricing,
    } = body;

    // Validate required fields
    if (!experienceId || !availabilityId || !numGuests || !guestDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the current user (optional - bookings can be made without auth)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Verify availability has enough spots
    const { data: availability, error: availabilityError } = await supabase
      .from('experience_availability')
      .select('id, available_spots, price_override, experience_id, start_date, end_date')
      .eq('id', availabilityId)
      .single();

    if (availabilityError || !availability) {
      return NextResponse.json(
        { error: 'Availability not found' },
        { status: 404 }
      );
    }

    if (availability.available_spots < numGuests) {
      return NextResponse.json(
        { error: 'Not enough spots available' },
        { status: 400 }
      );
    }

    // Generate unique booking number
    const bookingNumber = `BK-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_number: bookingNumber,
        experience_id: experienceId,
        availability_id: availabilityId,
        user_id: user?.id || null,
        num_guests: numGuests,
        contact_first_name: guestDetails.firstName,
        contact_last_name: guestDetails.lastName,
        contact_email: guestDetails.email,
        contact_phone: guestDetails.phone,
        contact_country: guestDetails.country,
        special_requests: guestDetails.specialRequests || null,
        marketing_opt_in: guestDetails.marketingOptIn || false,
        selected_addons: selectedAddOns,
        subtotal: pricing.subtotal,
        addons_total: pricing.addOnsTotal,
        service_fee: pricing.serviceFee,
        tax: pricing.tax,
        discount: pricing.discount,
        total: pricing.total,
        currency: pricing.currency,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Update availability spots (decrement)
    const { error: updateError } = await supabase
      .from('experience_availability')
      .update({
        available_spots: availability.available_spots - numGuests,
      })
      .eq('id', availabilityId);

    if (updateError) {
      console.error('Failed to update availability:', updateError);
      // Note: In production, you'd want to handle this with a transaction
      // or compensating action to rollback the booking
    }

    // Return booking response
    const response: CreateBookingResponse = {
      bookingId: booking.id,
      bookingNumber: booking.booking_number,
      status: 'pending',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
