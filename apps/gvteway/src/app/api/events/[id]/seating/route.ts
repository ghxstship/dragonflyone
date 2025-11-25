import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const seatSchema = z.object({
  section: z.string().max(50),
  row: z.string().max(10),
  number: z.string().max(10),
  ticket_type_id: z.string().uuid(),
  x: z.number().optional(),
  y: z.number().optional(),
});

const createSeatingSchema = z.object({
  venue_id: z.string().uuid(),
  layout_name: z.string().min(1).max(100),
  total_capacity: z.number().int().positive(),
  seats: z.array(seatSchema),
});

export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id: eventId } = context.params;

    const { data: seating, error } = await supabaseAdmin
      .from('event_seating')
      .select(`
        *,
        seats:seating_seats(
          *,
          ticket_type:ticket_types(id, name, price, available)
        )
      `)
      .eq('event_id', eventId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch seating', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ seating: seating || null });
  },
  {
    auth: false,
    audit: { action: 'seating:view', resource: 'event_seating' },
  }
);

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id: eventId } = context.params;
    const body = await request.json();
    const data = createSeatingSchema.parse(body);

    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, name')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const { data: seating, error: seatingError } = await supabaseAdmin
      .from('event_seating')
      .insert({
        event_id: eventId,
        venue_id: data.venue_id,
        layout_name: data.layout_name,
        total_capacity: data.total_capacity,
        created_by: context.user.id,
      })
      .select()
      .single();

    if (seatingError || !seating) {
      return NextResponse.json(
        { error: 'Failed to create seating', message: seatingError?.message },
        { status: 500 }
      );
    }

    if (data.seats && data.seats.length > 0) {
      const seatsToInsert = data.seats.map((seat) => ({
        seating_id: seating.id,
        section: seat.section,
        row: seat.row,
        number: seat.number,
        ticket_type_id: seat.ticket_type_id,
        status: 'available',
        x_position: seat.x,
        y_position: seat.y,
      }));

      const batchSize = 500;
      for (let i = 0; i < seatsToInsert.length; i += batchSize) {
        const batch = seatsToInsert.slice(i, i + batchSize);
        const { error: seatsError } = await supabaseAdmin
          .from('seating_seats')
          .insert(batch);

        if (seatsError) {
          console.error('Failed to insert seat batch:', seatsError);
        }
      }
    }

    const { data: completeSeating } = await supabaseAdmin
      .from('event_seating')
      .select(`
        *,
        seats:seating_seats(count)
      `)
      .eq('id', seating.id)
      .single();

    return NextResponse.json({ seating: completeSeating }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR],
    validation: createSeatingSchema,
    audit: { action: 'seating:create', resource: 'event_seating' },
  }
);

export const DELETE = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id: eventId } = context.params;

    const { data: seating } = await supabaseAdmin
      .from('event_seating')
      .select('id')
      .eq('event_id', eventId)
      .single();

    if (seating) {
      await supabaseAdmin
        .from('seating_seats')
        .delete()
        .eq('seating_id', seating.id);

      await supabaseAdmin
        .from('event_seating')
        .delete()
        .eq('id', seating.id);
    }

    return NextResponse.json({ success: true });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN],
    audit: { action: 'seating:delete', resource: 'event_seating' },
  }
);
