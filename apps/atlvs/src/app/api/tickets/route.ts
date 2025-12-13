export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TicketSchema = z.object({
  organization_id: z.string().uuid(),
  event_id: z.string().uuid(),
  ticket_type: z.enum(['general', 'vip', 'early_bird', 'group', 'student', 'senior', 'member']).default('general'),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  currency: z.string().default('USD'),
  quantity_available: z.number().int().min(0).optional(),
  max_per_order: z.number().int().min(1).default(10),
  sale_start: z.string().optional(),
  sale_end: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'sold_out', 'ended']).default('active'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');
    const ticketType = searchParams.get('ticket_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('tickets')
      .select(`
        *,
        events(id, name, start_date)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (ticketType && ticketType !== 'all') {
      query = query.eq('ticket_type', ticketType);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const tickets = data || [];
    const summary = {
      total: count || 0,
      total_available: tickets.reduce((sum, t) => sum + (t.quantity_available || 0), 0),
      total_sold: tickets.reduce((sum, t) => sum + (t.quantity_sold || 0), 0),
      total_revenue: tickets.reduce((sum, t) => sum + ((t.quantity_sold || 0) * (t.price || 0)), 0),
      by_status: {
        active: tickets.filter(t => t.status === 'active').length,
        sold_out: tickets.filter(t => t.status === 'sold_out').length,
        paused: tickets.filter(t => t.status === 'paused').length,
      },
    };

    return NextResponse.json({
      tickets,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = TicketSchema.parse(body);

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        ...validatedData,
        quantity_sold: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ticket: data }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
