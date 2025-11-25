import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const generateTicketsSchema = z.object({
  ticket_type_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(10000),
  prefix: z.string().max(10).optional(),
  start_number: z.number().int().positive().optional(),
});

function generateTicketCode(prefix: string, number: number): string {
  return `${prefix}${number.toString().padStart(8, '0')}`;
}

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const { id: eventId } = context.params;
    const body = await request.json();
    const data = generateTicketsSchema.parse(body);

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
      .select('id, name, price')
      .eq('id', data.ticket_type_id)
      .eq('event_id', eventId)
      .single();

    if (typeError || !ticketType) {
      return NextResponse.json({ error: 'Ticket type not found' }, { status: 404 });
    }

    const prefix = data.prefix || ticketType.name.substring(0, 3).toUpperCase();
    const startNum = data.start_number || 1;

    const tickets = [];
    const batchSize = 100;
    
    for (let i = 0; i < data.quantity; i += batchSize) {
      const batchTickets = [];
      const currentBatchSize = Math.min(batchSize, data.quantity - i);
      
      for (let j = 0; j < currentBatchSize; j++) {
        batchTickets.push({
          event_id: eventId,
          ticket_type_id: data.ticket_type_id,
          ticket_code: generateTicketCode(prefix, startNum + i + j),
          status: 'available',
          price: ticketType.price,
        });
      }

      const { data: insertedTickets, error: insertError } = await supabaseAdmin
        .from('tickets')
        .insert(batchTickets)
        .select('id, ticket_code, status');

      if (insertError) {
        return NextResponse.json(
          { 
            error: 'Failed to generate tickets', 
            message: insertError.message,
            generated: tickets.length 
          },
          { status: 500 }
        );
      }

      tickets.push(...(insertedTickets || []));
    }

    await supabaseAdmin
      .from('ticket_types')
      .update({ 
        available: supabaseAdmin.rpc('increment', { x: data.quantity }) 
      })
      .eq('id', data.ticket_type_id);

    return NextResponse.json({
      success: true,
      generated: tickets.length,
      ticketType: ticketType.name,
      tickets: tickets.slice(0, 10),
      totalGenerated: tickets.length,
    }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR],
    validation: generateTicketsSchema,
    audit: { action: 'tickets:generate', resource: 'tickets' },
  }
);
