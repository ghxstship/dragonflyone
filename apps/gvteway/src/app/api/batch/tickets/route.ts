import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from '@ghxstship/config';
import { z } from 'zod';

const BatchTicketSchema = z.object({
  eventId: z.string(),
  tickets: z.array(
    z.object({
      ticketTypeId: z.string(),
      quantity: z.number().min(1),
      price: z.number(),
      seatNumber: z.string().optional(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey) as any;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = BatchTicketSchema.parse(body);

    const ticketRecords = [];
    for (const ticket of validated.tickets) {
      for (let i = 0; i < ticket.quantity; i++) {
        ticketRecords.push({
          event_id: validated.eventId,
          ticket_type_id: ticket.ticketTypeId,
          price: ticket.price,
          seat_number: ticket.seatNumber || null,
          status: 'available',
          qr_code: `TIX-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        });
      }
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert(ticketRecords)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      tickets: data,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
