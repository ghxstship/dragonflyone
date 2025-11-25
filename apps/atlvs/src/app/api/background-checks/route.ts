import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Background check tracking and renewal alerts
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');
    const status = searchParams.get('status');

    let query = supabase.from('background_checks').select(`
      *, employee:employees(id, first_name, last_name, email, hire_date)
    `);

    if (employeeId) query = query.eq('employee_id', employeeId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Get checks expiring soon (within 90 days)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);

    const expiringSoon = data?.filter(c => 
      c.expiry_date && new Date(c.expiry_date) <= futureDate && new Date(c.expiry_date) > new Date()
    ) || [];

    return NextResponse.json({
      checks: data,
      expiring_soon: expiringSoon,
      pending: data?.filter(c => c.status === 'pending') || [],
      summary: {
        total: data?.length || 0,
        cleared: data?.filter(c => c.status === 'cleared').length || 0,
        pending: data?.filter(c => c.status === 'pending').length || 0,
        flagged: data?.filter(c => c.status === 'flagged').length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch checks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { employee_id, check_type, provider, package_level } = body;

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year validity

    const { data, error } = await supabase.from('background_checks').insert({
      employee_id, check_type, provider, package_level,
      status: 'pending', initiated_at: new Date().toISOString(),
      expiry_date: expiryDate.toISOString(), initiated_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ check: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initiate check' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action, status, results, notes } = body;

    if (action === 'update_status') {
      await supabase.from('background_checks').update({
        status, results, notes, completed_at: status !== 'pending' ? new Date().toISOString() : null,
        reviewed_by: user.id
      }).eq('id', id);

      return NextResponse.json({ success: true });
    }

    if (action === 'renew') {
      const { data: existing } = await supabase.from('background_checks').select('*').eq('id', id).single();
      
      const newExpiryDate = new Date();
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);

      const { data, error } = await supabase.from('background_checks').insert({
        employee_id: existing?.employee_id,
        check_type: existing?.check_type,
        provider: existing?.provider,
        package_level: existing?.package_level,
        status: 'pending',
        initiated_at: new Date().toISOString(),
        expiry_date: newExpiryDate.toISOString(),
        initiated_by: user.id,
        previous_check_id: id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ check: data, message: 'Renewal initiated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
