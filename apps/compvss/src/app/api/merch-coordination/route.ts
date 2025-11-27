import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Merchandise coordination
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    const { data: booths } = await supabase.from('merch_booths').select(`
      *, staff:merch_staff(id, name, shift_start, shift_end)
    `).eq('event_id', eventId);

    const { data: inventory } = await supabase.from('merch_inventory').select('*')
      .eq('event_id', eventId);

    const { data: sales } = await supabase.from('merch_sales').select('*')
      .eq('event_id', eventId);

    const totalSales = sales?.reduce((s, sale) => s + sale.amount, 0) || 0;

    return NextResponse.json({
      booths,
      inventory,
      sales_summary: {
        total_sales: totalSales,
        transactions: sales?.length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, event_id } = body;

    if (action === 'setup_booth') {
      const { location, booth_number } = body;

      const { data, error } = await supabase.from('merch_booths').insert({
        event_id, location, booth_number, status: 'setup'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ booth: data }, { status: 201 });
    }

    if (action === 'load_inventory') {
      const { booth_id, items } = body;

      const records = items.map((i: any) => ({
        event_id, booth_id, product_id: i.product_id,
        quantity: i.quantity, price: i.price
      }));

      await supabase.from('merch_inventory').insert(records);
      return NextResponse.json({ success: true });
    }

    if (action === 'record_sale') {
      const { booth_id, items, payment_method, amount } = body;

      const { data, error } = await supabase.from('merch_sales').insert({
        event_id, booth_id, items, payment_method, amount,
        sold_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Update inventory
      for (const item of items) {
        await supabase.rpc('decrement_merch_inventory', {
          p_event_id: event_id,
          p_product_id: item.product_id,
          p_quantity: item.quantity
        });
      }

      return NextResponse.json({ sale: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
