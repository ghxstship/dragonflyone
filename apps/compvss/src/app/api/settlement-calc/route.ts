import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Settlement calculations
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    const { data: settlement } = await supabase.from('event_settlements').select(`
      *, line_items:settlement_line_items(id, category, description, amount, type)
    `).eq('event_id', eventId).single();

    if (!settlement) {
      // Calculate from source data
      const { data: tickets } = await supabase.from('ticket_sales').select('total_amount')
        .eq('event_id', eventId);
      const { data: merch } = await supabase.from('merch_sales').select('amount')
        .eq('event_id', eventId);
      const { data: expenses } = await supabase.from('event_expenses').select('amount')
        .eq('event_id', eventId);

      const ticketRevenue = tickets?.reduce((s, t) => s + t.total_amount, 0) || 0;
      const merchRevenue = merch?.reduce((s, m) => s + m.amount, 0) || 0;
      const totalExpenses = expenses?.reduce((s, e) => s + e.amount, 0) || 0;

      return NextResponse.json({
        calculated: {
          ticket_revenue: ticketRevenue,
          merch_revenue: merchRevenue,
          total_revenue: ticketRevenue + merchRevenue,
          total_expenses: totalExpenses,
          net: ticketRevenue + merchRevenue - totalExpenses
        }
      });
    }

    return NextResponse.json({ settlement });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, event_id } = body;

    if (action === 'create') {
      const { line_items } = body;

      const revenue = line_items?.filter((i: any) => i.type === 'revenue').reduce((s: number, i: any) => s + i.amount, 0) || 0;
      const expenses = line_items?.filter((i: any) => i.type === 'expense').reduce((s: number, i: any) => s + i.amount, 0) || 0;

      const { data, error } = await supabase.from('event_settlements').insert({
        event_id, total_revenue: revenue, total_expenses: expenses,
        net_amount: revenue - expenses, status: 'draft', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (line_items?.length) {
        await supabase.from('settlement_line_items').insert(
          line_items.map((i: any) => ({ settlement_id: data.id, ...i }))
        );
      }

      return NextResponse.json({ settlement: data }, { status: 201 });
    }

    if (action === 'finalize') {
      const { settlement_id } = body;

      await supabase.from('event_settlements').update({
        status: 'finalized', finalized_by: user.id, finalized_at: new Date().toISOString()
      }).eq('id', settlement_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
