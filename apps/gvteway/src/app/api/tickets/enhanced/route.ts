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

// GET /api/tickets/enhanced - Get enhanced ticket details with all related data
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const ticketId = searchParams.get('ticket_id');
    const eventId = searchParams.get('event_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('tickets')
      .select(`
        *,
        ticket_type:ticket_types(id, code, name, description),
        status:ticket_statuses(id, code, name, is_terminal),
        event:legend_events(
          id, name, description, start_date, end_date, status,
          venue:venues(id, name, address, city, state, capacity)
        ),
        holder:legend_people(id, first_name, last_name, email, phone),
        addons:ticket_addons(
          id, quantity, unit_price, total_price, redeemed_at,
          addon_type:ticket_addon_types(id, code, name, description)
        ),
        deliveries:ticket_deliveries(
          id, status, tracking_number, shipped_at, delivered_at,
          delivery_method:delivery_methods(id, code, name)
        ),
        transfers:ticket_transfers(
          id, transfer_type, status, created_at, accepted_at,
          from_holder:legend_people!ticket_transfers_from_holder_id_fkey(id, first_name, last_name),
          to_holder:legend_people!ticket_transfers_to_holder_id_fkey(id, first_name, last_name)
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (ticketId) {
      query = query.eq('id', ticketId);
    }
    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (!ticketId) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ 
          tickets: [], 
          total: 0,
          limit,
          offset,
          summary: {
            total: 0,
            by_status: {},
            by_type: {},
            revenue: { total: 0, face_value: 0, service_fees: 0 }
          }
        });
      }
      logger.error('Error fetching enhanced tickets:', error);
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }

    const tickets = data || [];

    // Calculate summary statistics
    const summary = {
      total: count || 0,
      by_status: tickets.reduce((acc, t) => {
        const statusCode = t.status?.code || 'unknown';
        acc[statusCode] = (acc[statusCode] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_type: tickets.reduce((acc, t) => {
        const typeCode = t.ticket_type?.code || 'unknown';
        acc[typeCode] = (acc[typeCode] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      revenue: {
        total: tickets.reduce((sum, t) => sum + (t.total_price || 0), 0),
        face_value: tickets.reduce((sum, t) => sum + (t.face_value || 0), 0),
        service_fees: tickets.reduce((sum, t) => sum + (t.service_fee || 0), 0),
      },
      checked_in_count: tickets.filter(t => t.checked_in_at).length,
      transferred_count: tickets.filter(t => t.transfer_count > 0).length,
    };

    if (ticketId && tickets.length === 1) {
      return NextResponse.json({ ticket: tickets[0], summary });
    }

    return NextResponse.json({ tickets, total: count, limit, offset, summary });
  } catch (error) {
    logger.error('Error in GET /api/tickets/enhanced:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
