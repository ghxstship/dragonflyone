import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const locationId = searchParams.get('location_id');
    const terminalId = searchParams.get('terminal_id');

    if (type === 'by_location') {
      let query = supabase
        .from('pos_transactions')
        .select(`total, terminal:pos_terminals(id, terminal_name, location)`)
        .eq('transaction_type', 'sale');

      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data: transactions } = await query;

      const byLocation = transactions?.reduce((acc: Record<string, { total: number; count: number }>, t) => {
        const loc = (t.terminal as any)?.location || 'Unknown';
        if (!acc[loc]) acc[loc] = { total: 0, count: 0 };
        acc[loc].total += t.total;
        acc[loc].count++;
        return acc;
      }, {});

      return NextResponse.json({ sales_by_location: byLocation });
    }

    if (type === 'by_period') {
      const period = searchParams.get('period') || 'day';

      let query = supabase
        .from('pos_transactions')
        .select('total, created_at')
        .eq('transaction_type', 'sale');

      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);
      if (terminalId) query = query.eq('terminal_id', terminalId);

      const { data: transactions } = await query;

      const byPeriod = transactions?.reduce((acc: Record<string, { total: number; count: number }>, t) => {
        let key: string;
        const date = new Date(t.created_at);

        if (period === 'hour') {
          key = `${t.created_at.substring(0, 13)}:00`;
        } else if (period === 'day') {
          key = t.created_at.substring(0, 10);
        } else if (period === 'week') {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().substring(0, 10);
        } else {
          key = t.created_at.substring(0, 7);
        }

        if (!acc[key]) acc[key] = { total: 0, count: 0 };
        acc[key].total += t.total;
        acc[key].count++;
        return acc;
      }, {});

      const sorted = Object.entries(byPeriod || {})
        .map(([period, data]) => ({ period, ...data }))
        .sort((a, b) => a.period.localeCompare(b.period));

      return NextResponse.json({ sales_by_period: sorted });
    }

    if (type === 'by_product') {
      let query = supabase
        .from('pos_transaction_items')
        .select(`
          product_name, quantity, total_price,
          transaction:pos_transactions!inner(created_at, terminal_id)
        `);

      if (startDate) query = query.gte('transaction.created_at', startDate);
      if (endDate) query = query.lte('transaction.created_at', endDate);

      const { data: items } = await query;

      const byProduct = items?.reduce((acc: Record<string, { quantity: number; revenue: number }>, item) => {
        const name = item.product_name || 'Unknown';
        if (!acc[name]) acc[name] = { quantity: 0, revenue: 0 };
        acc[name].quantity += item.quantity;
        acc[name].revenue += item.total_price;
        return acc;
      }, {});

      const sorted = Object.entries(byProduct || {})
        .map(([product, data]) => ({ product, ...data }))
        .sort((a, b) => b.revenue - a.revenue);

      return NextResponse.json({ sales_by_product: sorted });
    }

    if (type === 'summary') {
      let query = supabase
        .from('pos_transactions')
        .select('total, tax, tip, payment_method, transaction_type');

      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);
      if (terminalId) query = query.eq('terminal_id', terminalId);

      const { data: transactions } = await query;

      const sales = transactions?.filter(t => t.transaction_type === 'sale') || [];
      const refunds = transactions?.filter(t => t.transaction_type === 'refund') || [];

      const summary = {
        gross_sales: sales.reduce((sum, t) => sum + t.total, 0),
        refunds: Math.abs(refunds.reduce((sum, t) => sum + t.total, 0)),
        net_sales: sales.reduce((sum, t) => sum + t.total, 0) + refunds.reduce((sum, t) => sum + t.total, 0),
        total_tax: sales.reduce((sum, t) => sum + (t.tax || 0), 0),
        total_tips: sales.reduce((sum, t) => sum + (t.tip || 0), 0),
        transaction_count: sales.length,
        refund_count: refunds.length,
        average_transaction: sales.length > 0 ? sales.reduce((sum, t) => sum + t.total, 0) / sales.length : 0,
        by_payment_method: sales.reduce((acc: Record<string, number>, t) => {
          acc[t.payment_method] = (acc[t.payment_method] || 0) + t.total;
          return acc;
        }, {}),
      };

      return NextResponse.json({ summary });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
