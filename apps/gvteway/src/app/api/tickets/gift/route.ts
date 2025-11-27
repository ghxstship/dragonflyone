import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const giftTicketSchema = z.object({
  event_id: z.string().uuid(),
  ticket_type_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
  recipient_email: z.string().email(),
  recipient_name: z.string().min(1),
  sender_name: z.string().optional(),
  message: z.string().optional(),
  delivery_date: z.string().optional(),
  wrap_style: z.enum(['classic', 'celebration', 'elegant']).default('classic'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = giftTicketSchema.parse(body);

    // Check ticket availability
    const { data: ticketType, error: ticketError } = await supabase
      .from('ticket_types')
      .select('*, events(*)')
      .eq('id', validated.ticket_type_id)
      .single();

    if (ticketError || !ticketType) {
      return NextResponse.json(
        { error: 'Ticket type not found' },
        { status: 404 }
      );
    }

    if (ticketType.available < validated.quantity) {
      return NextResponse.json(
        { error: 'Not enough tickets available' },
        { status: 400 }
      );
    }

    // Create gift order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        event_id: validated.event_id,
        status: 'completed',
        total_amount: ticketType.price * validated.quantity,
        payment_status: 'pending',
        order_type: 'gift',
        metadata: {
          recipient_email: validated.recipient_email,
          recipient_name: validated.recipient_name,
          sender_name: validated.sender_name,
          message: validated.message,
          delivery_date: validated.delivery_date,
          wrap_style: validated.wrap_style,
        },
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create gift tickets
    const tickets = [];
    for (let i = 0; i < validated.quantity; i++) {
      tickets.push({
        order_id: order.id,
        event_id: validated.event_id,
        ticket_type_id: validated.ticket_type_id,
        status: 'gift_pending',
        qr_code: `GIFT-${order.id}-${i + 1}-${Date.now()}`,
        metadata: {
          is_gift: true,
          recipient_email: validated.recipient_email,
          recipient_name: validated.recipient_name,
          sender_name: validated.sender_name,
          message: validated.message,
          delivery_date: validated.delivery_date,
        },
      });
    }

    const { error: ticketsError } = await supabase
      .from('tickets')
      .insert(tickets);

    if (ticketsError) {
      return NextResponse.json(
        { error: 'Failed to create tickets' },
        { status: 500 }
      );
    }

    // Update ticket availability
    await supabase
      .from('ticket_types')
      .update({ available: ticketType.available - validated.quantity })
      .eq('id', validated.ticket_type_id);

    // TODO: Send gift notification email to recipient
    // This would integrate with email service (SendGrid, etc.)

    return NextResponse.json({
      success: true,
      order_id: order.id,
      message: 'Gift tickets created successfully',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get gift tickets for recipient
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        *,
        events (
          id,
          title,
          date,
          venue
        ),
        ticket_types (
          id,
          name,
          price
        )
      `)
      .eq('metadata->>recipient_email', email)
      .eq('metadata->>is_gift', 'true')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ gift_tickets: tickets || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
