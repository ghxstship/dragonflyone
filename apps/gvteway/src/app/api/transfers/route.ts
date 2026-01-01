export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

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

    // Get transfers where user is sender or recipient
    const { data, error } = await supabase
      .from('ticket_transfers')
      .select(`
        *,
        ticket:tickets(
          id,
          seat_number,
          event:events(id, name, start_date, venue_name)
        )
      `)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to include direction
    const transfers = (data || []).map(transfer => ({
      ...transfer,
      direction: transfer.sender_id === user.id ? 'sent' : 'received',
    }));

    return NextResponse.json({ transfers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
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
    const { ticket_id, recipient_email } = body;

    // Verify ticket ownership
    const { data: ticket, error: ticketError } = await supabase
      .from('legend_products')
      .select('*')
      .eq('id', ticket_id)
      .eq('buyer_id', user.id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found or not owned by you' }, { status: 404 });
    }

    // Look up recipient by email
    const { data: recipient } = await supabase
      .from('platform_users')
      .select('id')
      .eq('email', recipient_email)
      .single();

    // Create transfer
    const { data, error } = await supabase
      .from('ticket_transfers')
      .insert({
        ticket_id,
        sender_id: user.id,
        recipient_id: recipient?.id || null,
        recipient_email,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ transfer: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transfer' }, { status: 500 });
  }
}
