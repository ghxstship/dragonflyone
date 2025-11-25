import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Retainer and deposit management
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const status = searchParams.get('status');

    let query = supabase.from('retainers').select(`
      *, client:contacts(id, name, email), project:projects(id, name)
    `);

    if (clientId) query = query.eq('client_id', clientId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const totalRetained = data?.filter(r => r.status === 'active').reduce((s, r) => s + r.amount, 0) || 0;
    const totalDeposits = data?.filter(r => r.type === 'deposit').reduce((s, r) => s + r.amount, 0) || 0;

    return NextResponse.json({
      retainers: data,
      summary: { total_retained: totalRetained, total_deposits: totalDeposits }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch retainers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { client_id, project_id, type, amount, terms, start_date, end_date } = body;

    const { data, error } = await supabase.from('retainers').insert({
      client_id, project_id, type, amount, terms, start_date, end_date,
      balance: amount, status: 'active', created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ retainer: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create retainer' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action, amount, description } = body;

    if (action === 'apply') {
      const { data: retainer } = await supabase.from('retainers').select('*').eq('id', id).single();
      if (!retainer) return NextResponse.json({ error: 'Retainer not found' }, { status: 404 });

      const newBalance = retainer.balance - amount;
      await supabase.from('retainers').update({ balance: newBalance }).eq('id', id);

      await supabase.from('retainer_transactions').insert({
        retainer_id: id, type: 'application', amount: -amount, description, balance_after: newBalance
      });

      return NextResponse.json({ success: true, new_balance: newBalance });
    }

    if (action === 'refund') {
      const { data: retainer } = await supabase.from('retainers').select('*').eq('id', id).single();
      await supabase.from('retainers').update({ status: 'refunded', balance: 0 }).eq('id', id);

      await supabase.from('retainer_transactions').insert({
        retainer_id: id, type: 'refund', amount: -retainer?.balance, description
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
