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
    const ticketId = searchParams.get('ticket_id');
    const format = searchParams.get('format') || 'pdf';

    if (!ticketId) return NextResponse.json({ error: 'ticket_id required' }, { status: 400 });

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        id, ticket_type, section, row, seat, qr_code, barcode, price,
        event:events(id, name, start_date, end_date, venue:venues(name, address, city, state)),
        owner:platform_users(first_name, last_name)
      `)
      .eq('id', ticketId)
      .single();

    if (error) throw error;
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    // Generate security features
    const securityCode = generateSecurityCode(ticket.id, ticket.qr_code);
    const watermark = generateWatermark(ticket.id);

    const printableTicket = {
      ticket_id: ticket.id,
      ticket_type: ticket.ticket_type,
      section: ticket.section,
      row: ticket.row,
      seat: ticket.seat,
      price: ticket.price,
      qr_code: ticket.qr_code,
      barcode: ticket.barcode,
      security_code: securityCode,
      watermark,
      event: {
        name: (ticket.event as any)?.name,
        date: (ticket.event as any)?.start_date,
        venue: (ticket.event as any)?.venue?.name,
        address: `${(ticket.event as any)?.venue?.address}, ${(ticket.event as any)?.venue?.city}, ${(ticket.event as any)?.venue?.state}`,
      },
      attendee: {
        name: `${(ticket.owner as any)?.first_name} ${(ticket.owner as any)?.last_name}`,
      },
      print_instructions: [
        'Print on standard letter-size paper',
        'Use high-quality print settings for best barcode scanning',
        'Keep ticket dry and unfolded',
        'Present at venue entrance with valid ID',
      ],
      terms: 'This ticket is non-transferable. Valid ID matching the ticket holder name is required for entry.',
      generated_at: new Date().toISOString(),
    };

    if (format === 'html') {
      const html = generatePrintableHTML(printableTicket);
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return NextResponse.json({ printable_ticket: printableTicket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const action = body.action;

    if (action === 'log_print') {
      const { ticket_id, user_id } = body;

      const { data: log, error } = await supabase
        .from('ticket_print_logs')
        .insert({
          ticket_id,
          user_id,
          printed_at: new Date().toISOString(),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ logged: true, print_count: 1 });
    }

    if (action === 'verify_print') {
      const { ticket_id, security_code } = body;

      const { data: ticket } = await supabase
        .from('tickets')
        .select('id, qr_code')
        .eq('id', ticket_id)
        .single();

      if (!ticket) return NextResponse.json({ valid: false, reason: 'Ticket not found' });

      const expectedCode = generateSecurityCode(ticket.id, ticket.qr_code);
      const valid = security_code === expectedCode;

      return NextResponse.json({ valid, ticket_id: ticket.id });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateSecurityCode(ticketId: string, qrCode: string): string {
  const data = `${ticketId}:${qrCode}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).toUpperCase().substring(0, 8);
}

function generateWatermark(ticketId: string): string {
  return `VALID-${ticketId.substring(0, 8).toUpperCase()}`;
}

function generatePrintableHTML(ticket: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Print Ticket - ${ticket.event.name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .ticket { border: 2px solid #000; padding: 20px; max-width: 600px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
    .event-name { font-size: 24px; font-weight: bold; }
    .details { margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin: 5px 0; }
    .qr-section { text-align: center; margin: 20px 0; }
    .security { font-size: 12px; color: #666; text-align: center; }
    .watermark { position: absolute; opacity: 0.1; font-size: 48px; transform: rotate(-45deg); }
    .instructions { font-size: 10px; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="watermark">${ticket.watermark}</div>
    <div class="header">
      <div class="event-name">${ticket.event.name}</div>
      <div>${new Date(ticket.event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div>${ticket.event.venue}</div>
    </div>
    <div class="details">
      <div class="detail-row"><span>Ticket Type:</span><span>${ticket.ticket_type}</span></div>
      <div class="detail-row"><span>Section:</span><span>${ticket.section || 'GA'}</span></div>
      <div class="detail-row"><span>Row:</span><span>${ticket.row || '-'}</span></div>
      <div class="detail-row"><span>Seat:</span><span>${ticket.seat || '-'}</span></div>
      <div class="detail-row"><span>Attendee:</span><span>${ticket.attendee.name}</span></div>
    </div>
    <div class="qr-section">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.qr_code}" alt="QR Code" />
      <div>Barcode: ${ticket.barcode}</div>
    </div>
    <div class="security">
      Security Code: ${ticket.security_code} | Ticket ID: ${ticket.ticket_id.substring(0, 8)}
    </div>
    <div class="instructions">
      <strong>Instructions:</strong>
      <ul>
        ${ticket.print_instructions.map((i: string) => `<li>${i}</li>`).join('')}
      </ul>
      <p>${ticket.terms}</p>
    </div>
  </div>
  <button class="no-print" onclick="window.print()" style="margin: 20px auto; display: block; padding: 10px 20px;">Print Ticket</button>
</body>
</html>
  `;
}
