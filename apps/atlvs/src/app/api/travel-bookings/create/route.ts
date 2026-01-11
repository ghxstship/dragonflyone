/**
 * ATLVS Travel Booking Creation API
 * Creates a new travel package booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createTravelBookingSchema = z.object({
  packageId: z.string().uuid(),
  numTravelers: z.number().min(1),
  travelDates: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  selectedAddOns: z.array(z.object({
    id: z.string(),
    name: z.string(),
    quantity: z.number(),
    price: z.number(),
  })).default([]),
  travelerDetails: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    country: z.string(),
    specialRequests: z.string().optional(),
    agreeToTerms: z.boolean(),
    marketingOptIn: z.boolean().optional(),
  }),
  pricing: z.object({
    subtotal: z.number(),
    addOnsTotal: z.number(),
    serviceFee: z.number(),
    tax: z.number(),
    discount: z.number(),
    total: z.number(),
    currency: z.string(),
  }),
});

type CreateTravelBookingRequest = z.infer<typeof createTravelBookingSchema>;

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body: CreateTravelBookingRequest = await request.json();

    // Validate request
    const validatedData = createTravelBookingSchema.parse(body);

    // Check if package exists and is active
    const { data: pkg, error: pkgError } = await supabase
      .from('booking_packages')
      .select('*')
      .eq('id', validatedData.packageId)
      .eq('is_active', true)
      .single();

    if (pkgError || !pkg) {
      return NextResponse.json(
        { error: 'Package not found or not available' },
        { status: 404 }
      );
    }

    // Validate traveler count
    if (pkg.min_guests && validatedData.numTravelers < pkg.min_guests) {
      return NextResponse.json(
        { error: `Minimum ${pkg.min_guests} travelers required` },
        { status: 400 }
      );
    }

    if (pkg.max_guests && validatedData.numTravelers > pkg.max_guests) {
      return NextResponse.json(
        { error: `Maximum ${pkg.max_guests} travelers allowed` },
        { status: 400 }
      );
    }

    // Generate booking number
    const bookingNumber = `ATLVS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Calculate dates
    const startDate = new Date(validatedData.travelDates.start);
    const endDate = new Date(validatedData.travelDates.end);

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('travel_bookings')
      .insert({
        booking_number: bookingNumber,
        package_id: validatedData.packageId,
        package_name: pkg.name,
        status: 'pending',

        // Dates
        travel_start_date: startDate.toISOString(),
        travel_end_date: endDate.toISOString(),

        // Travelers
        num_travelers: validatedData.numTravelers,

        // Traveler details
        traveler_first_name: validatedData.travelerDetails.firstName,
        traveler_last_name: validatedData.travelerDetails.lastName,
        traveler_email: validatedData.travelerDetails.email,
        traveler_phone: validatedData.travelerDetails.phone,
        traveler_country: validatedData.travelerDetails.country,
        special_requests: validatedData.travelerDetails.specialRequests || null,
        marketing_opt_in: validatedData.travelerDetails.marketingOptIn || false,

        // Pricing
        subtotal: validatedData.pricing.subtotal,
        add_ons_total: validatedData.pricing.addOnsTotal,
        service_fee: validatedData.pricing.serviceFee,
        tax: validatedData.pricing.tax,
        discount: validatedData.pricing.discount,
        total: validatedData.pricing.total,
        currency: validatedData.pricing.currency,

        // Add-ons
        selected_add_ons: validatedData.selectedAddOns,

        // Metadata
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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

    // Return booking info
    return NextResponse.json(
      {
        bookingId: booking.id,
        bookingNumber: booking.booking_number,
        status: booking.status,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Travel booking creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
