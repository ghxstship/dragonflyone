import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

const createAlertSchema = z.object({
  event_id: z.string().uuid(),
  target_price: z.number().positive(),
  ticket_type_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('price_alerts')
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
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const alerts = data?.map(alert => ({
      id: alert.id,
      event_id: alert.event_id,
      event_title: alert.events?.title,
      event_date: alert.events?.date,
      event_venue: alert.events?.venue,
      target_price: alert.target_price,
      current_price: alert.ticket_types?.price || alert.current_price,
      ticket_type: alert.ticket_types?.name,
      is_active: alert.is_active,
      triggered: alert.triggered,
      triggered_at: alert.triggered_at,
      created_at: alert.created_at,
    })) || [];

    return NextResponse.json({ alerts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createAlertSchema.parse(body);

    // Get current price
    let currentPrice = 0;
    if (validated.ticket_type_id) {
      const { data: ticketType } = await supabase
        .from('ticket_types')
        .select('price')
        .eq('id', validated.ticket_type_id)
        .single();
      currentPrice = ticketType?.price || 0;
    } else {
      const { data: ticketTypes } = await supabase
        .from('ticket_types')
        .select('price')
        .eq('event_id', validated.event_id)
        .order('price', { ascending: true })
        .limit(1);
      currentPrice = ticketTypes?.[0]?.price || 0;
    }

    const { data, error } = await supabase
      .from('price_alerts')
      .insert({
        user_id: user.id,
        event_id: validated.event_id,
        ticket_type_id: validated.ticket_type_id || null,
        target_price: validated.target_price,
        current_price: currentPrice,
        is_active: true,
        triggered: currentPrice <= validated.target_price,
        triggered_at: currentPrice <= validated.target_price ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ alert: data }, { status: 201 });
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
