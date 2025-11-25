import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transferSchema = z.object({
  ticket_id: z.string().uuid(),
  recipient_email: z.string().email(),
  recipient_name: z.string().optional(),
  message: z.string().optional(),
  transfer_type: z.enum(['gift', 'sell']).default('gift'),
  price: z.number().optional()
});

const acceptTransferSchema = z.object({
  transfer_id: z.string().uuid(),
  accept: z.boolean()
});

// GET - List transfers (sent/received)
export const GET = apiRoute(
  async (request: NextRequest, context: any) => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'sent' or 'received'
    const status = searchParams.get('status');

    const user_email = context.user.email;

    let query = supabase
      .from('ticket_transfers')
      .select(`
        *,
        tickets (
          id,
          ticket_type_id,
          seat_number,
          section,
          row,
          ticket_types (
            name,
            price
          ),
          events (
            id,
            name,
            date,
            venue_id,
            venues (name, city)
          )
        ),
        sender:sender_id (
          id,
          email,
          full_name
        ),
        recipient:recipient_email (
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (type === 'sent') {
      query = query.eq('sender_id', context.user.id);
    } else if (type === 'received') {
      query = query.eq('recipient_email', user_email);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ transfers: data });
  },
  {
    auth: true,
    audit: { action: 'transfers:list', resource: 'ticket_transfers' }
  }
);

// POST - Initiate ticket transfer
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const validated = transferSchema.parse(body);

    // Verify ticket ownership
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*, events(*)')
      .eq('id', validated.ticket_id)
      .eq('user_id', context.user.id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ 
        error: 'Ticket not found or not owned by you' 
      }, { status: 404 });
    }

    // Check if ticket is already transferred or used
    if (ticket.status !== 'active') {
      return NextResponse.json({
        error: `Cannot transfer ticket with status: ${ticket.status}`
      }, { status: 400 });
    }

    // Check if event allows transfers
    const eventDate = new Date(ticket.events.date);
    const now = new Date();
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilEvent < 24) {
      return NextResponse.json({
        error: 'Cannot transfer tickets within 24 hours of event'
      }, { status: 400 });
    }

    // Check for existing pending transfers
    const { data: existingTransfer } = await supabase
      .from('ticket_transfers')
      .select('id')
      .eq('ticket_id', validated.ticket_id)
      .eq('status', 'pending')
      .single();

    if (existingTransfer) {
      return NextResponse.json({
        error: 'A pending transfer already exists for this ticket'
      }, { status: 400 });
    }

    // Create transfer
    const { data: transfer, error: transferError } = await supabase
      .from('ticket_transfers')
      .insert({
        ticket_id: validated.ticket_id,
        sender_id: context.user.id,
        recipient_email: validated.recipient_email,
        recipient_name: validated.recipient_name,
        message: validated.message,
        transfer_type: validated.transfer_type,
        price: validated.price,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select()
      .single();

    if (transferError) {
      return NextResponse.json({ error: transferError.message }, { status: 500 });
    }

    // Lock ticket from further transfers
    await supabase
      .from('tickets')
      .update({ status: 'transfer_pending' })
      .eq('id', validated.ticket_id);

    // Send notification email to recipient (placeholder)
    // await sendTransferNotification(transfer);

    return NextResponse.json({
      transfer,
      message: 'Transfer initiated successfully'
    }, { status: 201 });
  },
  {
    auth: true,
    validation: transferSchema,
    audit: { action: 'transfers:create', resource: 'ticket_transfers' }
  }
);

// PUT - Accept or decline transfer
export const PUT = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const validated = acceptTransferSchema.parse(body);

    // Get transfer details
    const { data: transfer, error: fetchError } = await supabase
      .from('ticket_transfers')
      .select('*, tickets(*)')
      .eq('id', validated.transfer_id)
      .single();

    if (fetchError || !transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    // Verify recipient
    if (transfer.recipient_email !== context.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already processed
    if (transfer.status !== 'pending') {
      return NextResponse.json({
        error: `Transfer already ${transfer.status}`
      }, { status: 400 });
    }

    // Check expiration
    if (new Date(transfer.expires_at) < new Date()) {
      await supabase
        .from('ticket_transfers')
        .update({ status: 'expired' })
        .eq('id', validated.transfer_id);

      await supabase
        .from('tickets')
        .update({ status: 'active' })
        .eq('id', transfer.ticket_id);

      return NextResponse.json({ error: 'Transfer has expired' }, { status: 400 });
    }

    if (validated.accept) {
      // Accept transfer
      const { error: updateError } = await supabase
        .from('ticket_transfers')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', validated.transfer_id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Transfer ticket ownership
      const { error: ticketError } = await supabase
        .from('tickets')
        .update({
          user_id: context.user.id,
          status: 'active',
          transferred_at: new Date().toISOString()
        })
        .eq('id', transfer.ticket_id);

      if (ticketError) {
        return NextResponse.json({ error: ticketError.message }, { status: 500 });
      }

      // Process payment if it's a sale
      if (transfer.transfer_type === 'sell' && transfer.price) {
        // Integrate with payment processing (Stripe Connect)
        // await processSecondaryMarketSale(transfer);
      }

      // Log transfer in audit trail
      await supabase.from('ticket_activity').insert({
        ticket_id: transfer.ticket_id,
        activity_type: 'transferred',
        from_user_id: transfer.sender_id,
        to_user_id: context.user.id,
        metadata: { transfer_id: validated.transfer_id }
      });

      return NextResponse.json({
        message: 'Transfer accepted successfully',
        ticket_id: transfer.ticket_id
      });
    } else {
      // Decline transfer
      const { error: updateError } = await supabase
        .from('ticket_transfers')
        .update({ status: 'declined' })
        .eq('id', validated.transfer_id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Unlock ticket
      await supabase
        .from('tickets')
        .update({ status: 'active' })
        .eq('id', transfer.ticket_id);

      return NextResponse.json({ message: 'Transfer declined' });
    }
  },
  {
    auth: true,
    validation: acceptTransferSchema,
    audit: { action: 'transfers:accept', resource: 'ticket_transfers' }
  }
);

// DELETE - Cancel transfer (sender only)
export const DELETE = apiRoute(
  async (request: NextRequest, context: any) => {
    const { searchParams } = new URL(request.url);
    const transfer_id = searchParams.get('transfer_id');

    if (!transfer_id) {
      return NextResponse.json({ error: 'transfer_id is required' }, { status: 400 });
    }

    // Get transfer
    const { data: transfer, error: fetchError } = await supabase
      .from('ticket_transfers')
      .select('*')
      .eq('id', transfer_id)
      .single();

    if (fetchError || !transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    // Verify sender
    if (transfer.sender_id !== context.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Can only cancel pending transfers
    if (transfer.status !== 'pending') {
      return NextResponse.json({
        error: `Cannot cancel ${transfer.status} transfer`
      }, { status: 400 });
    }

    // Cancel transfer
    const { error: updateError } = await supabase
      .from('ticket_transfers')
      .update({ status: 'cancelled' })
      .eq('id', transfer_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Unlock ticket
    await supabase
      .from('tickets')
      .update({ status: 'active' })
      .eq('id', transfer.ticket_id);

    return NextResponse.json({ message: 'Transfer cancelled successfully' });
  },
  {
    auth: true,
    audit: { action: 'transfers:cancel', resource: 'ticket_transfers' }
  }
);
