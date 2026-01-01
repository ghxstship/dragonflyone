export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const format = searchParams.get('format') || 'json';
    const status = searchParams.get('status');

    let query = supabase
      .from('legend_products')
      .select(`
        id, barcode, attendee_name, attendee_email, attendee_phone,
        status, checked_in_at,
        ticket_type:ticket_types(id, name, price),
        order:ticket_orders(id, order_number, purchaser_name, purchaser_email)
      `)
      .eq('event_id', id)
      .order('attendee_name');

    if (status) {
      query = query.eq('status', status);
    }

    const { data: tickets, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const summary = {
      total: tickets?.length || 0,
      checked_in: tickets?.filter(t => t.status === 'used').length || 0,
      pending: tickets?.filter(t => t.status === 'valid').length || 0,
      cancelled: tickets?.filter(t => t.status === 'cancelled').length || 0,
    };

    if (format === 'csv') {
      const headers = ['Name', 'Email', 'Phone', 'Ticket Type', 'Barcode', 'Status', 'Checked In'];
      const rows = (tickets || []).map(t => [
        t.attendee_name || '',
        t.attendee_email || '',
        t.attendee_phone || '',
        ((t.ticket_type as unknown) as { name: string } | undefined)?.name || '',
        t.barcode,
        t.status,
        t.checked_in_at || '',
      ]);

      const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="guest-list-${id}.csv"`,
        },
      });
    }

    return NextResponse.json({
      guests: tickets,
      summary,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
