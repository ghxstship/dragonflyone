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

const transferSchema = z.object({
  ticket_id: z.string().uuid(),
  to_email: z.string().email(),
  to_name: z.string().optional(),
  message: z.string().max(500).optional(),
});

// GET /api/tickets/transfer - List ticket transfers
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const ticketId = searchParams.get('ticket_id');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('ticket_transfers')
      .select(`
        *,
        ticket:tickets(id, ticket_number, holder_name),
        from_holder:legend_people!ticket_transfers_from_holder_id_fkey(id, first_name, last_name, email),
        to_holder:legend_people!ticket_transfers_to_holder_id_fkey(id, first_name, last_name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (ticketId) {
      query = query.eq('ticket_id', ticketId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ transfers: [], total: 0, limit, offset });
      }
      logger.error('Error fetching ticket transfers:', error);
      return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
    }

    return NextResponse.json({ transfers: data || [], total: count, limit, offset });
  } catch (error) {
    logger.error('Error in GET /api/tickets/transfer:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tickets/transfer - Initiate ticket transfer
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = transferSchema.parse(body);

    // Get current ticket holder
    const { data: ticket } = await supabase
      .from('tickets')
      .select('holder_id, holder_email')
      .eq('id', validated.ticket_id)
      .single();

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Create transfer request
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    const { data: transfer, error } = await supabase
      .from('ticket_transfers')
      .insert({
        ticket_id: validated.ticket_id,
        from_holder_id: ticket.holder_id,
        from_email: ticket.holder_email,
        to_email: validated.to_email,
        transfer_type: 'transfer',
        status: 'pending',
        message: validated.message,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating ticket transfer:', error);
      return NextResponse.json({ error: 'Failed to create transfer' }, { status: 500 });
    }

    return NextResponse.json({ 
      transfer, 
      message: 'Transfer initiated. Recipient will receive an email to accept.' 
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/tickets/transfer:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/tickets/transfer - Accept/decline transfer
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { transfer_id, action } = body;

    if (!transfer_id) {
      return NextResponse.json({ error: 'transfer_id is required' }, { status: 400 });
    }

    if (!['accept', 'decline', 'cancel'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use: accept, decline, cancel' }, { status: 400 });
    }

    // Get transfer details
    const { data: transfer } = await supabase
      .from('ticket_transfers')
      .select('*, ticket:tickets(id, holder_id)')
      .eq('id', transfer_id)
      .single();

    if (!transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    if (transfer.status !== 'pending') {
      return NextResponse.json({ error: 'Transfer is no longer pending' }, { status: 400 });
    }

    if (action === 'accept') {
      // Update transfer status
      await supabase
        .from('ticket_transfers')
        .update({ 
          status: 'accepted', 
          accepted_at: new Date().toISOString() 
        })
        .eq('id', transfer_id);

      // Update ticket holder
      await supabase
        .from('tickets')
        .update({
          holder_email: transfer.to_email,
          original_holder_id: transfer.from_holder_id,
          transferred_at: new Date().toISOString(),
          transfer_count: (transfer.ticket?.transfer_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transfer.ticket_id);

      return NextResponse.json({ success: true, message: 'Transfer accepted' });
    }

    if (action === 'decline') {
      await supabase
        .from('ticket_transfers')
        .update({ status: 'declined' })
        .eq('id', transfer_id);

      return NextResponse.json({ success: true, message: 'Transfer declined' });
    }

    if (action === 'cancel') {
      await supabase
        .from('ticket_transfers')
        .update({ status: 'cancelled' })
        .eq('id', transfer_id);

      return NextResponse.json({ success: true, message: 'Transfer cancelled' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error('Error in PATCH /api/tickets/transfer:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
