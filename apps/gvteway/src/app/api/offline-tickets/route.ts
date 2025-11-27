import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const ticketId = searchParams.get('ticket_id');
    const type = searchParams.get('type');

    if (type === 'offline_bundle' && userId) {
      // Get all tickets for upcoming events
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          id, ticket_type, section, row, seat, qr_code, barcode,
          event:events(id, name, start_date, end_date, venue:venues(name, address))
        `)
        .eq('owner_id', userId)
        .eq('status', 'active')
        .gte('event.start_date', new Date().toISOString());

      if (error) throw error;

      // Generate offline-compatible data
      const offlineBundle = {
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tickets: tickets?.map(t => ({
          id: t.id,
          ticket_type: t.ticket_type,
          section: t.section,
          row: t.row,
          seat: t.seat,
          qr_code: t.qr_code,
          barcode: t.barcode,
          event: t.event,
          offline_verification_hash: generateOfflineHash(t.id, t.qr_code),
        })),
      };

      return NextResponse.json({ offline_bundle: offlineBundle });
    }

    if (type === 'verify' && ticketId) {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('id, status, qr_code, owner_id')
        .eq('id', ticketId)
        .single();

      if (error) throw error;

      return NextResponse.json({
        valid: ticket?.status === 'active',
        ticket_id: ticket?.id,
        status: ticket?.status,
      });
    }

    if (ticketId) {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select(`
          id, ticket_type, section, row, seat, qr_code, barcode, status,
          event:events(id, name, start_date, end_date, venue:venues(name, address, city))
        `)
        .eq('id', ticketId)
        .single();

      if (error) throw error;

      const offlineTicket = {
        ...ticket,
        offline_verification_hash: generateOfflineHash(ticket.id, ticket.qr_code),
        cached_at: new Date().toISOString(),
        valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      return NextResponse.json({ ticket: offlineTicket });
    }

    return NextResponse.json({ error: 'user_id or ticket_id required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'sync_offline_checkins') {
      const { checkins } = body.data;

      const results = [];
      for (const checkin of checkins) {
        // Verify and process offline check-in
        const { data: ticket } = await supabase
          .from('tickets')
          .select('id, status')
          .eq('id', checkin.ticket_id)
          .single();

        if (ticket && ticket.status === 'active') {
          await supabase
            .from('tickets')
            .update({ status: 'checked_in', checked_in_at: checkin.checked_in_at })
            .eq('id', checkin.ticket_id);

          results.push({ ticket_id: checkin.ticket_id, synced: true });
        } else {
          results.push({ ticket_id: checkin.ticket_id, synced: false, reason: 'Invalid ticket' });
        }
      }

      return NextResponse.json({ sync_results: results });
    }

    if (action === 'generate_offline_pass') {
      const { ticket_id } = body;

      const { data: ticket } = await supabase
        .from('tickets')
        .select(`
          id, ticket_type, section, row, seat, qr_code, barcode,
          event:events(id, name, start_date, venue:venues(name, address))
        `)
        .eq('id', ticket_id)
        .single();

      if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

      const offlinePass = {
        ticket_id: ticket.id,
        qr_code: ticket.qr_code,
        barcode: ticket.barcode,
        event_name: (ticket.event as any)?.name,
        event_date: (ticket.event as any)?.start_date,
        venue: (ticket.event as any)?.venue?.name,
        seat_info: `${ticket.section || ''} ${ticket.row || ''} ${ticket.seat || ''}`.trim(),
        verification_hash: generateOfflineHash(ticket.id, ticket.qr_code),
        generated_at: new Date().toISOString(),
        valid_for_hours: 48,
      };

      return NextResponse.json({ offline_pass: offlinePass });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateOfflineHash(ticketId: string, qrCode: string): string {
  // Simple hash for offline verification
  const data = `${ticketId}:${qrCode}:${new Date().toDateString()}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).toUpperCase();
}
