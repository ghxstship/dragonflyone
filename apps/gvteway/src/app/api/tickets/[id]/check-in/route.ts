export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const checkInSchema = z.object({
  method: z.enum(['scan', 'manual', 'bulk']).default('scan'),
  location: z.string().optional(),
  device_info: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = checkInSchema.parse(body);

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_type:ticket_types(id, name),
        event:events(id, name, start_date)
      `)
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      const { data: ticketByBarcode } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_type:ticket_types(id, name),
          event:events(id, name, start_date)
        `)
        .eq('barcode', id)
        .single();

      if (!ticketByBarcode) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }
      
      return processCheckIn(ticketByBarcode, payload);
    }

    return processCheckIn(ticket, payload);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processCheckIn(
  ticket: Record<string, unknown>,
  payload: z.infer<typeof checkInSchema>
) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  if (ticket.status === 'used') {
    return NextResponse.json({ 
      error: 'Ticket already used',
      checked_in_at: ticket.checked_in_at,
    }, { status: 400 });
  }

  if (ticket.status === 'cancelled') {
    return NextResponse.json({ error: 'Ticket has been cancelled' }, { status: 400 });
  }

  if (ticket.status === 'expired') {
    return NextResponse.json({ error: 'Ticket has expired' }, { status: 400 });
  }

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('tickets')
    .update({
      status: 'used',
      checked_in_at: now,
      updated_at: now,
    })
    .eq('id', ticket.id as string);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from('ticket_check_ins').insert({
    ticket_id: ticket.id as string,
    event_id: ticket.event_id as string,
    method: payload.method,
    location: payload.location,
    device_info: payload.device_info,
    notes: payload.notes,
  });

  return NextResponse.json({
    success: true,
    ticket: {
      id: ticket.id,
      barcode: ticket.barcode,
      attendee_name: ticket.attendee_name,
      ticket_type: ticket.ticket_type,
      event: ticket.event,
      checked_in_at: now,
    },
  });
}
