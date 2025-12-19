export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createOrderSchema = z.object({
  event_id: z.string().uuid(),
  tickets: z.array(z.object({
    ticket_type_id: z.string().uuid(),
    quantity: z.number().min(1),
    attendees: z.array(z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
    })).optional(),
  })),
  purchaser: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  discount_code: z.string().optional(),
  billing_address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
  }).optional(),
});

function generateBarcode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let barcode = 'TKT';
  for (let i = 0; i < 12; i++) {
    barcode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return barcode;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);

    const eventId = searchParams.get('event_id');
    const email = searchParams.get('email');
    const status = searchParams.get('status');

    let query = supabase
      .from('ticket_orders')
      .select(`
        *,
        event:events(id, name, start_date, venue_id)
      `)
      .order('created_at', { ascending: false });

    if (eventId) query = query.eq('event_id', eventId);
    if (email) query = query.eq('purchaser_email', email);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = createOrderSchema.parse(body);

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, organization_id, name')
      .eq('id', payload.event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const ticketTypeIds = payload.tickets.map(t => t.ticket_type_id);
    const { data: ticketTypes, error: typesError } = await supabase
      .from('ticket_types')
      .select('*')
      .in('id', ticketTypeIds);

    if (typesError || !ticketTypes?.length) {
      return NextResponse.json({ error: 'Ticket types not found' }, { status: 404 });
    }

    const ticketTypeMap = new Map(ticketTypes.map(t => [t.id, t]));
    let subtotal = 0;
    const orderTickets: Array<{
      ticket_type_id: string;
      ticket_type_name: string;
      quantity: number;
      unit_price: number;
      total: number;
    }> = [];

    for (const item of payload.tickets) {
      const type = ticketTypeMap.get(item.ticket_type_id);
      if (!type) {
        return NextResponse.json({ error: `Invalid ticket type: ${item.ticket_type_id}` }, { status: 400 });
      }

      if (type.quantity_available) {
        const available = type.quantity_available - type.quantity_sold - type.quantity_reserved;
        if (item.quantity > available) {
          return NextResponse.json({ 
            error: `Not enough tickets available for ${type.name}. Only ${available} left.` 
          }, { status: 400 });
        }
      }

      if (item.quantity < type.min_per_order || item.quantity > type.max_per_order) {
        return NextResponse.json({ 
          error: `Quantity must be between ${type.min_per_order} and ${type.max_per_order} for ${type.name}` 
        }, { status: 400 });
      }

      const total = type.price * item.quantity;
      subtotal += total;
      orderTickets.push({
        ticket_type_id: type.id,
        ticket_type_name: type.name,
        quantity: item.quantity,
        unit_price: type.price,
        total,
      });
    }

    const fees = Math.round(subtotal * 0.029 + 30) / 100;
    const taxAmount = Math.round(subtotal * 0.08) / 100;
    const total = subtotal + fees + taxAmount;

    const { data: order, error: orderError } = await supabase
      .from('ticket_orders')
      .insert({
        organization_id: event.organization_id,
        event_id: payload.event_id,
        tickets: orderTickets,
        subtotal,
        fees,
        tax_amount: taxAmount,
        total,
        discount_code: payload.discount_code,
        purchaser_name: payload.purchaser.name,
        purchaser_email: payload.purchaser.email,
        purchaser_phone: payload.purchaser.phone,
        billing_address: payload.billing_address,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const ticketsToCreate = [];
    for (const item of payload.tickets) {
      const type = ticketTypeMap.get(item.ticket_type_id);
      const attendees = item.attendees || [{ 
        name: payload.purchaser.name, 
        email: payload.purchaser.email,
        phone: payload.purchaser.phone,
      }];

      for (let i = 0; i < item.quantity; i++) {
        const attendee = attendees[i] || attendees[0];
        ticketsToCreate.push({
          organization_id: event.organization_id,
          order_id: order.id,
          ticket_type_id: item.ticket_type_id,
          event_id: payload.event_id,
          barcode: generateBarcode(),
          attendee_name: attendee.name,
          attendee_email: attendee.email,
          attendee_phone: attendee.phone,
          status: 'valid',
        });
      }

      await supabase
        .from('ticket_types')
        .update({ quantity_reserved: (type?.quantity_reserved || 0) + item.quantity })
        .eq('id', item.ticket_type_id);
    }

    const { error: ticketsError } = await supabase
      .from('tickets')
      .insert(ticketsToCreate);

    if (ticketsError) {
      return NextResponse.json({ error: ticketsError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      order,
      tickets_created: ticketsToCreate.length,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
