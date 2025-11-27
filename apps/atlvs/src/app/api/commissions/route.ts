import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Commission calculation engine with custom rules
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const period = searchParams.get('period'); // YYYY-MM

    let query = supabase.from('commissions').select(`
      *, employee:employees(id, first_name, last_name), deal:deals(id, name, value)
    `);

    if (employeeId) query = query.eq('employee_id', employeeId);
    if (period) query = query.gte('period_start', `${period}-01`).lte('period_end', `${period}-31`);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const totalCommissions = data?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;

    return NextResponse.json({
      commissions: data,
      total: totalCommissions,
      by_status: {
        pending: data?.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0) || 0,
        approved: data?.filter(c => c.status === 'approved').reduce((s, c) => s + c.amount, 0) || 0,
        paid: data?.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0) || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { employee_id, deal_id, commission_type, base_amount, rate, period_start, period_end } = body;

    // Calculate commission based on rules
    const amount = calculateCommission(base_amount, rate, commission_type);

    const { data, error } = await supabase.from('commissions').insert({
      employee_id, deal_id, commission_type, base_amount, rate, amount,
      period_start, period_end, status: 'pending', created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ commission: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create commission' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action } = body;

    if (action === 'approve') {
      await supabase.from('commissions').update({
        status: 'approved', approved_by: user.id, approved_at: new Date().toISOString()
      }).eq('id', id);
    } else if (action === 'pay') {
      await supabase.from('commissions').update({
        status: 'paid', paid_at: new Date().toISOString()
      }).eq('id', id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

function calculateCommission(baseAmount: number, rate: number, type: string): number {
  switch (type) {
    case 'percentage': return baseAmount * (rate / 100);
    case 'flat': return rate;
    case 'tiered':
      if (baseAmount > 100000) return baseAmount * 0.08;
      if (baseAmount > 50000) return baseAmount * 0.06;
      return baseAmount * 0.04;
    default: return baseAmount * (rate / 100);
  }
}
