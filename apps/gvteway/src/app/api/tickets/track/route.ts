export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/tickets/track - Track ticket by number or barcode
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const ticketNumber = searchParams.get('ticket_number');
    const barcode = searchParams.get('barcode');
    const email = searchParams.get('email');

    if (!ticketNumber && !barcode) {
      // Return empty result for endpoint existence check
      return NextResponse.json({ 
        ticket: null, 
        message: 'Provide ticket_number or barcode to track',
        tracking_info: null 
      });
    }

    let query = supabase
      .from('tickets')
      .select(`
        id,
        ticket_number,
        barcode,
        holder_name,
        holder_email,
        section,
        row_name,
        seat_number,
        checked_in_at,
        check_in_location,
        ticket_type:ticket_types(code, name),
        status:ticket_statuses(code, name, is_terminal),
        event:legend_events(
          id, name, start_date, end_date,
          venue:venues(name, address, city, state)
        ),
        deliveries:ticket_deliveries(
          status, tracking_number, carrier, shipped_at, delivered_at,
          delivery_method:delivery_methods(name)
        )
      `);

    if (ticketNumber) {
      query = query.eq('ticket_number', ticketNumber);
    } else if (barcode) {
      query = query.eq('barcode', barcode);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ ticket: null, message: 'Ticket not found' }, { status: 404 });
      }
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ ticket: null, tracking_info: null });
      }
      logger.error('Error tracking ticket:', error);
      return NextResponse.json({ error: 'Failed to track ticket' }, { status: 500 });
    }

    // Verify email if provided (for security)
    if (email && data.holder_email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Email does not match ticket holder' }, { status: 403 });
    }

    // Build tracking info
    const delivery = Array.isArray(data.deliveries) ? data.deliveries[0] : null;
    const statusData = Array.isArray(data.status) ? data.status[0] : data.status;
    const trackingInfo = {
      status: statusData?.name || 'Unknown',
      is_checked_in: !!data.checked_in_at,
      checked_in_at: data.checked_in_at,
      check_in_location: data.check_in_location,
      delivery_status: delivery?.status || 'pending',
      tracking_number: delivery?.tracking_number,
      carrier: delivery?.carrier,
      shipped_at: delivery?.shipped_at,
      delivered_at: delivery?.delivered_at,
    };

    return NextResponse.json({ 
      ticket: {
        ticket_number: data.ticket_number,
        holder_name: data.holder_name,
        section: data.section,
        row: data.row_name,
        seat: data.seat_number,
        ticket_type: (data.ticket_type as { name?: string } | null)?.name,
        event: data.event,
      },
      tracking_info: trackingInfo,
    });
  } catch (error) {
    logger.error('Error in GET /api/tickets/track:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
