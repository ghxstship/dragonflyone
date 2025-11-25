import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Workers compensation claims tracking
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const status = searchParams.get('status');

    let query = supabase.from('workers_comp_claims').select(`
      *, employee:employees(id, first_name, last_name, department),
      incident:incident_reports(id, description, incident_date)
    `);

    if (employeeId) query = query.eq('employee_id', employeeId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('filed_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const totalPaid = data?.reduce((s, c) => s + (c.amount_paid || 0), 0) || 0;
    const totalReserved = data?.reduce((s, c) => s + (c.reserve_amount || 0), 0) || 0;

    return NextResponse.json({
      claims: data,
      summary: {
        total_claims: data?.length || 0,
        open: data?.filter(c => c.status === 'open').length || 0,
        closed: data?.filter(c => c.status === 'closed').length || 0,
        total_paid: totalPaid,
        total_reserved: totalReserved
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { employee_id, incident_id, injury_type, injury_description, body_part, treatment_type, medical_provider, reserve_amount } = body;

    const claimNumber = `WC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const { data, error } = await supabase.from('workers_comp_claims').insert({
      employee_id, incident_id, claim_number: claimNumber, injury_type,
      injury_description, body_part, treatment_type, medical_provider,
      reserve_amount: reserve_amount || 0, status: 'open',
      filed_at: new Date().toISOString(), filed_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ claim: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to file claim' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action, amount, notes } = body;

    if (action === 'add_payment') {
      const { data: claim } = await supabase.from('workers_comp_claims').select('amount_paid').eq('id', id).single();
      
      await supabase.from('workers_comp_payments').insert({
        claim_id: id, amount, payment_date: new Date().toISOString(), notes, processed_by: user.id
      });

      await supabase.from('workers_comp_claims').update({
        amount_paid: (claim?.amount_paid || 0) + amount
      }).eq('id', id);

      return NextResponse.json({ success: true });
    }

    if (action === 'close') {
      await supabase.from('workers_comp_claims').update({
        status: 'closed', closed_at: new Date().toISOString(), closure_notes: notes
      }).eq('id', id);

      return NextResponse.json({ success: true });
    }

    if (action === 'update_reserve') {
      await supabase.from('workers_comp_claims').update({ reserve_amount: amount }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
