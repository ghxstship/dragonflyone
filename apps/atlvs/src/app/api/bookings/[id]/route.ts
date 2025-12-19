export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UpdateBookingSchema = z.object({
  event_type: z.string().optional(),
  event_name: z.string().optional(),
  status: z.enum(['draft', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  guest_count_expected: z.number().int().positive().optional(),
  guest_count_guaranteed: z.number().int().positive().optional(),
  guest_count_actual: z.number().int().positive().optional(),
  line_items: z.array(z.any()).optional(),
  subtotal: z.number().min(0).optional(),
  tax_rate: z.number().min(0).max(1).optional(),
  tax_amount: z.number().min(0).optional(),
  service_charge_rate: z.number().min(0).max(1).optional(),
  service_charge_amount: z.number().min(0).optional(),
  discount_amount: z.number().min(0).optional(),
  total_amount: z.number().min(0).optional(),
  deposit_required: z.number().min(0).optional(),
  deposit_paid: z.number().min(0).optional(),
  payment_status: z.string().optional(),
  special_requests: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable(),
  dietary_notes: z.string().optional().nullable(),
  cancellation_reason: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        contact:contacts(*),
        venue:venues(*),
        lead:leads(id, title, source),
        booking_spaces(*, space:venue_spaces(*)),
        proposals(*),
        venue_invoices(*),
        payment_schedules(*, payment_milestones(*))
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ booking: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validatedData = UpdateBookingSchema.parse(body);

    // Handle status changes
    const updateData: Record<string, unknown> = { ...validatedData };
    
    if (validatedData.status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    } else if (validatedData.status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update calendar event if dates changed
    if (validatedData.event_date || validatedData.start_time || validatedData.end_time || validatedData.status) {
      await supabase
        .from('venue_events')
        .update({
          start_datetime: `${data.event_date}T${data.start_time || '00:00:00'}`,
          end_datetime: `${data.event_date}T${data.end_time || '23:59:59'}`,
          status: data.status === 'confirmed' ? 'confirmed' : 
                  data.status === 'cancelled' ? 'cancelled' : 'tentative',
        })
        .eq('booking_id', id);
    }

    return NextResponse.json({ booking: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Soft delete by setting status to cancelled
    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update calendar event
    await supabase
      .from('venue_events')
      .update({ status: 'cancelled' })
      .eq('booking_id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
