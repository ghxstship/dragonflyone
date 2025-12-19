import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const cloneSchema = z.object({
  new_event_date: z.string().optional(),
  new_event_name: z.string().optional(),
  include_line_items: z.boolean().default(true),
  include_notes: z.boolean().default(false),
  include_attachments: z.boolean().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const bookingId = params.id;

    const body = await request.json().catch(() => ({}));
    const validatedData = cloneSchema.parse(body);

    // Get original booking
    const { data: original, error: originalError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (originalError || !original) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Generate new booking number
    const { count } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true });

    const newBookingNumber = `BK-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(5, '0')}`;

    // Create cloned booking
    const clonedBooking = {
      ...original,
      id: undefined,
      booking_number: newBookingNumber,
      event_name: validatedData.new_event_name || `${original.event_name} (Copy)`,
      event_date: validatedData.new_event_date || original.event_date,
      status: 'draft',
      contract_status: null,
      contract_signed_at: null,
      notes: validatedData.include_notes ? original.notes : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newBooking, error: createError } = await supabase
      .from('bookings')
      .insert(clonedBooking)
      .select()
      .single();

    if (createError) {
      return NextResponse.json(
        { error: 'Failed to clone booking' },
        { status: 500 }
      );
    }

    // Clone line items if requested
    if (validatedData.include_line_items) {
      const { data: lineItems } = await supabase
        .from('booking_line_items')
        .select('*')
        .eq('booking_id', bookingId);

      if (lineItems && lineItems.length > 0) {
        const clonedLineItems = lineItems.map(item => ({
          ...item,
          id: undefined,
          booking_id: newBooking.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        await supabase.from('booking_line_items').insert(clonedLineItems);
      }
    }

    return NextResponse.json({
      success: true,
      booking: newBooking,
      original_id: bookingId,
      message: `Booking cloned as ${newBookingNumber}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
