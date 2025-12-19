export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const createTicketTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  currency: z.string().default('USD'),
  quantity_available: z.number().min(1).optional(),
  sales_start: z.string().optional(),
  sales_end: z.string().optional(),
  min_per_order: z.number().min(1).default(1),
  max_per_order: z.number().min(1).default(10),
  visibility: z.enum(['public', 'hidden', 'password', 'invite_only']).default('public'),
  access_code: z.string().optional(),
  sort_order: z.number().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const includeHidden = searchParams.get('include_hidden') === 'true';

    let query = supabase
      .from('ticket_types')
      .select('*')
      .eq('event_id', id)
      .eq('is_active', true)
      .order('sort_order')
      .order('price');

    if (!includeHidden) {
      query = query.eq('visibility', 'public');
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const ticketTypes = (data || []).map(type => ({
      ...type,
      available: type.quantity_available 
        ? type.quantity_available - type.quantity_sold - type.quantity_reserved 
        : null,
      on_sale: type.sales_start && type.sales_end 
        ? new Date() >= new Date(type.sales_start) && new Date() <= new Date(type.sales_end)
        : true,
    }));

    return NextResponse.json({ ticket_types: ticketTypes });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const payload = createTicketTypeSchema.parse(body);

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, organization_id')
      .eq('id', id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('ticket_types')
      .insert({
        ...payload,
        event_id: id,
        organization_id: event.organization_id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ticket_type: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
