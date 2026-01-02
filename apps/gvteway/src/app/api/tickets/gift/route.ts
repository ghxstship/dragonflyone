export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, withAuth } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const giftSchema = z.object({
  ticket_id: z.string().uuid(),
  recipient_email: z.string().email(),
  recipient_name: z.string().min(1),
  message: z.string().max(500).optional(),
  send_immediately: z.boolean().default(true),
  scheduled_send_at: z.string().datetime().optional(),
});

// GET /api/tickets/gift - List gifted tickets
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const ticketId = searchParams.get('ticket_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('ticket_transfers')
      .select(`
        *,
        ticket:tickets(id, ticket_number, holder_name, event:legend_events(name, start_date)),
        from_holder:legend_people!ticket_transfers_from_holder_id_fkey(first_name, last_name),
        to_holder:legend_people!ticket_transfers_to_holder_id_fkey(first_name, last_name)
      `, { count: 'exact' })
      .eq('transfer_type', 'gift')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (ticketId) {
      query = query.eq('ticket_id', ticketId);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ gifts: [], total: 0, limit, offset });
      }
      logger.error('Error fetching gifted tickets:', error);
      return NextResponse.json({ error: 'Failed to fetch gifts' }, { status: 500 });
    }

    return NextResponse.json({ gifts: data || [], total: count, limit, offset });
  } catch (error) {
    logger.error('Error in GET /api/tickets/gift:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tickets/gift - Gift a ticket
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = giftSchema.parse(body);

    // Get current ticket holder
    const { data: ticket } = await supabase
      .from('tickets')
      .select('holder_id, holder_email, holder_name')
      .eq('id', validated.ticket_id)
      .single();

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Create gift transfer
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 day expiry for gifts

    const { data: gift, error } = await supabase
      .from('ticket_transfers')
      .insert({
        ticket_id: validated.ticket_id,
        from_holder_id: ticket.holder_id,
        from_email: ticket.holder_email,
        to_email: validated.recipient_email,
        transfer_type: 'gift',
        status: 'pending',
        message: validated.message || `${ticket.holder_name} has gifted you a ticket!`,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating ticket gift:', error);
      return NextResponse.json({ error: 'Failed to create gift' }, { status: 500 });
    }

    return NextResponse.json({ 
      gift, 
      message: `Ticket gift sent to ${validated.recipient_email}` 
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/tickets/gift:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
