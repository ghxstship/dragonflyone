import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const checkinSchema = z.object({
  ticket_code: z.string().min(1),
  check_in_type: z.enum(['entry', 'exit', 'verify']).default('entry'),
  notes: z.string().max(500).optional(),
});

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id: eventId } = context.params;
    const body = await request.json();
    const data = checkinSchema.parse(body);

    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select(`
        *,
        ticket_type:ticket_types(id, name, event_id),
        order:orders(id, user_id, status)
      `)
      .eq('ticket_code', data.ticket_code)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found', code: 'TICKET_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (ticket.ticket_type?.event_id !== eventId) {
      return NextResponse.json(
        { error: 'Ticket not valid for this event', code: 'INVALID_EVENT' },
        { status: 400 }
      );
    }

    if (ticket.status === 'used') {
      const { data: lastCheckin } = await supabaseAdmin
        .from('ticket_checkins')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('checked_in_at', { ascending: false })
        .limit(1)
        .single();

      return NextResponse.json(
        {
          error: 'Ticket already used',
          code: 'ALREADY_CHECKED_IN',
          last_checkin: lastCheckin,
        },
        { status: 400 }
      );
    }

    if (ticket.status === 'cancelled' || ticket.status === 'refunded') {
      return NextResponse.json(
        { error: `Ticket has been ${ticket.status}`, code: 'TICKET_INVALID' },
        { status: 400 }
      );
    }

    const { data: checkin, error: checkinError } = await supabaseAdmin
      .from('ticket_checkins')
      .insert({
        ticket_id: ticket.id,
        event_id: eventId,
        checked_in_by: context.user.id,
        check_in_type: data.check_in_type,
        notes: data.notes,
      })
      .select()
      .single();

    if (checkinError) {
      return NextResponse.json(
        { error: 'Failed to check in ticket', message: checkinError.message },
        { status: 500 }
      );
    }

    if (data.check_in_type === 'entry') {
      await supabaseAdmin
        .from('tickets')
        .update({ status: 'used', used_at: new Date().toISOString() })
        .eq('id', ticket.id);
    }

    return NextResponse.json({
      success: true,
      checkin,
      ticket: {
        code: ticket.ticket_code,
        type: ticket.ticket_type?.name,
        order_id: ticket.order?.id,
      },
      message: `Successfully checked in for ${data.check_in_type}`,
    });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR],
    validation: checkinSchema,
    audit: { action: 'ticket:checkin', resource: 'tickets' },
  }
);

export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id: eventId } = context.params;
    const { searchParams } = new URL(request.url);
    const ticketCode = searchParams.get('ticket_code');

    if (!ticketCode) {
      return NextResponse.json(
        { error: 'ticket_code parameter required' },
        { status: 400 }
      );
    }

    const { data: ticket, error } = await supabaseAdmin
      .from('tickets')
      .select(`
        *,
        ticket_type:ticket_types(id, name, event_id),
        checkins:ticket_checkins(*)
      `)
      .eq('ticket_code', ticketCode)
      .single();

    if (error || !ticket) {
      return NextResponse.json(
        { valid: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const isValid =
      ticket.ticket_type?.event_id === eventId &&
      ticket.status !== 'cancelled' &&
      ticket.status !== 'refunded';

    return NextResponse.json({
      valid: isValid,
      ticket: {
        code: ticket.ticket_code,
        type: ticket.ticket_type?.name,
        status: ticket.status,
        checkins: ticket.checkins || [],
      },
    });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR],
    audit: { action: 'ticket:verify', resource: 'tickets' },
  }
);
