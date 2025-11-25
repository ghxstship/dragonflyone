import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const deliverySchema = z.object({
  ticket_id: z.string().uuid(),
  delivery_method: z.enum(['email', 'sms', 'push']),
  recipient: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticket_id');

    if (!ticketId) return NextResponse.json({ error: 'ticket_id required' }, { status: 400 });

    const { data: deliveries, error } = await supabase
      .from('mobile_ticket_deliveries')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ deliveries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'send') {
      const validated = deliverySchema.parse(body.data);

      // Create delivery record
      const { data: delivery, error } = await supabase
        .from('mobile_ticket_deliveries')
        .insert({
          ...validated,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate sending (in production, integrate with email/SMS service)
      await supabase
        .from('mobile_ticket_deliveries')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', delivery.id);

      return NextResponse.json({ delivery, message: 'Ticket sent successfully' }, { status: 201 });
    }

    if (action === 'bulk_send') {
      const { ticket_ids, delivery_method } = body.data;

      // Get tickets with owner info
      const { data: tickets } = await supabase
        .from('tickets')
        .select('id, owner:platform_users(email, phone)')
        .in('id', ticket_ids);

      const deliveries = tickets?.map((t: any) => ({
        ticket_id: t.id,
        delivery_method,
        recipient: delivery_method === 'email' ? t.owner?.email : t.owner?.phone,
        status: 'sent',
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })).filter((d: any) => d.recipient);

      if (deliveries?.length) {
        const { data, error } = await supabase
          .from('mobile_ticket_deliveries')
          .insert(deliveries)
          .select();

        if (error) throw error;
        return NextResponse.json({ deliveries: data, sent_count: data?.length }, { status: 201 });
      }

      return NextResponse.json({ message: 'No valid recipients found' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    const { data: delivery, error } = await supabase
      .from('mobile_ticket_deliveries')
      .update({
        status,
        delivered_at: status === 'delivered' ? new Date().toISOString() : undefined,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ delivery });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
