export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const GVTEWAY_ADMIN_ROLES = [
  PlatformRole.GVTEWAY_ADMIN,
  PlatformRole.GVTEWAY_EXPERIENCE_CREATOR,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
];

const ticketSchema = z.object({
  event_id: z.string().uuid(),
  ticket_type_id: z.string().uuid().optional(),
  holder_email: z.string().email(),
  holder_name: z.string().min(1),
  holder_phone: z.string().optional(),
  section: z.string().optional(),
  row_name: z.string().optional(),
  seat_number: z.string().optional(),
  face_value: z.number().min(0),
  service_fee: z.number().min(0).default(0),
  is_accessible: z.boolean().default(false),
});

// GET /api/tickets - List tickets
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const eventId = searchParams.get('event_id');
    const holderId = searchParams.get('holder_id');
    const status = searchParams.get('status');
    const ticketType = searchParams.get('ticket_type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('tickets')
      .select(`
        *,
        ticket_type:ticket_types(id, code, name),
        status:ticket_statuses(id, code, name),
        event:legend_events(id, name, start_date, end_date, venue_id),
        holder:legend_people(id, first_name, last_name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (holderId) {
      query = query.eq('holder_id', holderId);
    }
    if (status) {
      query = query.eq('status_id', status);
    }
    if (ticketType) {
      query = query.eq('ticket_type_id', ticketType);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ 
          tickets: [], 
          total: 0, 
          limit, 
          offset,
          summary: { total: 0, checked_in: 0, pending: 0 }
        });
      }
      logger.error('Error fetching tickets:', error);
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }

    const tickets = data || [];
    const summary = {
      total: count || 0,
      checked_in: tickets.filter(t => t.checked_in_at).length,
      pending: tickets.filter(t => !t.checked_in_at).length,
    };

    return NextResponse.json({ tickets, total: count, limit, offset, summary });
  } catch (error) {
    logger.error('Error in GET /api/tickets:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tickets - Create ticket
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = ticketSchema.parse(body);

    // Get default status (pending)
    const { data: pendingStatus } = await supabase
      .from('ticket_statuses')
      .select('id')
      .eq('code', 'pending')
      .single();

    // Get default ticket type if not provided
    let ticketTypeId = validated.ticket_type_id;
    if (!ticketTypeId) {
      const { data: defaultType } = await supabase
        .from('ticket_types')
        .select('id')
        .eq('code', 'general_admission')
        .single();
      ticketTypeId = defaultType?.id;
    }

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const barcode = `${ticketNumber}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    const totalPrice = validated.face_value + validated.service_fee;

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        organization_id: body.organization_id || '00000000-0000-0000-0000-000000000001',
        event_id: validated.event_id,
        ticket_type_id: ticketTypeId,
        status_id: pendingStatus?.id,
        ticket_number: ticketNumber,
        barcode,
        holder_email: validated.holder_email,
        holder_name: validated.holder_name,
        holder_phone: validated.holder_phone,
        section: validated.section,
        row_name: validated.row_name,
        seat_number: validated.seat_number,
        face_value: validated.face_value,
        service_fee: validated.service_fee,
        total_price: totalPrice,
        is_accessible: validated.is_accessible,
      })
      .select(`
        *,
        ticket_type:ticket_types(id, code, name),
        status:ticket_statuses(id, code, name)
      `)
      .single();

    if (error) {
      logger.error('Error creating ticket:', error);
      return NextResponse.json({ error: 'Failed to create ticket', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/tickets:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/tickets - Update ticket or check-in
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { ticket_id, action, updates } = body;

    if (!ticket_id) {
      return NextResponse.json({ error: 'ticket_id is required' }, { status: 400 });
    }

    if (action === 'check_in') {
      const { data: checkedInStatus } = await supabase
        .from('ticket_statuses')
        .select('id')
        .eq('code', 'checked_in')
        .single();

      const { data: ticket, error } = await supabase
        .from('tickets')
        .update({
          status_id: checkedInStatus?.id,
          checked_in_at: new Date().toISOString(),
          checked_in_by: authResult.user?.id,
          check_in_location: body.location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticket_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to check in ticket' }, { status: 500 });
      }

      return NextResponse.json({ success: true, ticket, message: 'Ticket checked in successfully' });
    }

    if (updates) {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', ticket_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
      }

      return NextResponse.json({ success: true, ticket });
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (error) {
    logger.error('Error in PATCH /api/tickets:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tickets - Cancel ticket
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('id');

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 });
    }

    const { data: cancelledStatus } = await supabase
      .from('ticket_statuses')
      .select('id')
      .eq('code', 'cancelled')
      .single();

    const { error } = await supabase
      .from('tickets')
      .update({
        status_id: cancelledStatus?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId);

    if (error) {
      return NextResponse.json({ error: 'Failed to cancel ticket' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Ticket cancelled' });
  } catch (error) {
    logger.error('Error in DELETE /api/tickets:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
