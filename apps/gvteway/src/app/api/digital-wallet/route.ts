import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Digital wallet integration (Apple Wallet, Google Pay)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticket_id');

    if (ticketId) {
      // Get ticket details for wallet pass
      const { data: ticket, error } = await supabase.from('tickets').select(`
        *, event:events(id, name, date, venue, image_url)
      `).eq('id', ticketId).single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({
        ticket,
        wallet_pass_data: generateWalletPassData(ticket)
      });
    }

    // Get all user's tickets eligible for wallet
    const { data: tickets, error } = await supabase.from('tickets').select(`
      *, event:events(id, name, date, venue)
    `).eq('user_id', user.id).eq('status', 'active').gte('event.date', new Date().toISOString());

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wallet data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { ticket_id, wallet_type } = body; // 'apple', 'google'

    const { data: ticket, error } = await supabase.from('tickets').select(`
      *, event:events(*)
    `).eq('id', ticket_id).eq('user_id', user.id).single();

    if (error || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Generate wallet pass URL
    const passData = generateWalletPassData(ticket);
    
    // Record wallet addition
    await supabase.from('wallet_passes').insert({
      ticket_id, user_id: user.id, wallet_type,
      pass_data: passData, created_at: new Date().toISOString()
    });

    // In production, this would generate actual .pkpass or Google Pay JWT
    const passUrl = wallet_type === 'apple' 
      ? `/api/digital-wallet/apple/${ticket_id}.pkpass`
      : `/api/digital-wallet/google/${ticket_id}`;

    return NextResponse.json({
      success: true,
      pass_url: passUrl,
      pass_data: passData
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to wallet' }, { status: 500 });
  }
}

function generateWalletPassData(ticket: any) {
  const event = ticket.event;
  return {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.gvteway.ticket',
    serialNumber: ticket.id,
    teamIdentifier: 'GVTEWAY',
    organizationName: 'GVTEWAY',
    description: `Ticket for ${event?.name}`,
    logoText: 'GVTEWAY',
    foregroundColor: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(60, 65, 76)',
    eventTicket: {
      primaryFields: [{
        key: 'event',
        label: 'EVENT',
        value: event?.name
      }],
      secondaryFields: [{
        key: 'date',
        label: 'DATE',
        value: event?.date ? new Date(event.date).toLocaleDateString() : ''
      }, {
        key: 'time',
        label: 'TIME',
        value: event?.date ? new Date(event.date).toLocaleTimeString() : ''
      }],
      auxiliaryFields: [{
        key: 'venue',
        label: 'VENUE',
        value: event?.venue || ''
      }, {
        key: 'seat',
        label: 'SEAT',
        value: ticket.seat_info || 'General Admission'
      }],
      backFields: [{
        key: 'terms',
        label: 'Terms & Conditions',
        value: 'This ticket is non-transferable. Present QR code at entry.'
      }]
    },
    barcode: {
      format: 'PKBarcodeFormatQR',
      message: ticket.qr_code || ticket.id,
      messageEncoding: 'iso-8859-1'
    },
    relevantDate: event?.date
  };
}
