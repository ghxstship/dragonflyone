import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';

const joinWaitlistSchema = z.object({
  ticket_type_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notify_preference: z.enum(['email', 'sms', 'both']).default('email'),
});

export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id: eventId } = context.params;

    const { data: waitlist, error } = await supabaseAdmin
      .from('event_waitlist')
      .select(`
        *,
        user:platform_users(id, full_name, email),
        ticket_type:ticket_types(id, name, price)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch waitlist', message: error.message },
        { status: 500 }
      );
    }

    const stats = {
      total: waitlist?.length || 0,
      pending: waitlist?.filter((w: any) => w.status === 'pending').length || 0,
      notified: waitlist?.filter((w: any) => w.status === 'notified').length || 0,
      converted: waitlist?.filter((w: any) => w.status === 'converted').length || 0,
      expired: waitlist?.filter((w: any) => w.status === 'expired').length || 0,
    };

    return NextResponse.json({ waitlist: waitlist || [], stats });
  },
  {
    auth: true,
    audit: { action: 'waitlist:view', resource: 'event_waitlist' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id: eventId } = context.params;
    const body = await request.json();
    const data = joinWaitlistSchema.parse(body);

    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, name')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const { data: ticketType, error: typeError } = await supabaseAdmin
      .from('ticket_types')
      .select('id, name, available')
      .eq('id', data.ticket_type_id)
      .eq('event_id', eventId)
      .single();

    if (typeError || !ticketType) {
      return NextResponse.json({ error: 'Ticket type not found' }, { status: 404 });
    }

    const { data: existing } = await supabaseAdmin
      .from('event_waitlist')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', context.user.id)
      .eq('ticket_type_id', data.ticket_type_id)
      .eq('status', 'pending')
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already on waitlist for this ticket type' },
        { status: 400 }
      );
    }

    const { data: waitlistEntry, error } = await supabaseAdmin
      .from('event_waitlist')
      .insert({
        event_id: eventId,
        user_id: context.user.id,
        ticket_type_id: data.ticket_type_id,
        quantity: data.quantity,
        email: data.email,
        phone: data.phone,
        notify_preference: data.notify_preference,
        status: 'pending',
      })
      .select()
      .single();

    if (error || !waitlistEntry) {
      return NextResponse.json(
        { error: 'Failed to join waitlist', message: error?.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        waitlist_entry: waitlistEntry,
        message: 'Successfully added to waitlist. You will be notified when tickets become available.',
      },
      { status: 201 }
    );
  },
  {
    auth: true,
    validation: joinWaitlistSchema,
    audit: { action: 'waitlist:join', resource: 'event_waitlist' },
  }
);
