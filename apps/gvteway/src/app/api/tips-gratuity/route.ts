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
    const terminalId = searchParams.get('terminal_id');
    const employeeId = searchParams.get('employee_id');

    if (type === 'suggestions') {
      const subtotal = parseFloat(searchParams.get('subtotal') || '0');

      const suggestions = [
        { percentage: 15, amount: Math.round(subtotal * 0.15 * 100) / 100, label: '15%' },
        { percentage: 18, amount: Math.round(subtotal * 0.18 * 100) / 100, label: '18%' },
        { percentage: 20, amount: Math.round(subtotal * 0.20 * 100) / 100, label: '20%' },
        { percentage: 25, amount: Math.round(subtotal * 0.25 * 100) / 100, label: '25%' },
      ];

      return NextResponse.json({ suggestions, subtotal });
    }

    if (type === 'report') {
      const startDate = searchParams.get('start_date');
      const endDate = searchParams.get('end_date');

      let query = supabase
        .from('tips')
        .select('amount, employee_id, created_at');

      if (terminalId) query = query.eq('terminal_id', terminalId);
      if (employeeId) query = query.eq('employee_id', employeeId);
      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data: tips } = await query;

      const totalTips = tips?.reduce((sum, t) => sum + t.amount, 0) || 0;
      const tipCount = tips?.length || 0;

      const byEmployee = tips?.reduce((acc: Record<string, number>, t) => {
        acc[t.employee_id] = (acc[t.employee_id] || 0) + t.amount;
        return acc;
      }, {});

      return NextResponse.json({
        summary: {
          total_tips: totalTips,
          tip_count: tipCount,
          average_tip: tipCount > 0 ? Math.round((totalTips / tipCount) * 100) / 100 : 0,
        },
        by_employee: byEmployee,
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id, amount, employee_id, terminal_id, payment_method } = body;

    const { data: tip, error } = await supabase
      .from('tips')
      .insert({
        transaction_id,
        amount,
        employee_id,
        terminal_id,
        payment_method,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ tip }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
