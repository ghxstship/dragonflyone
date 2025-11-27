import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Cable runs and infrastructure mapping
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const department = searchParams.get('department');

    let query = supabase.from('cable_runs').select('*').eq('project_id', projectId);
    if (department) query = query.eq('department', department);

    const { data, error } = await query.order('run_number', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Group by department
    const byDept: Record<string, any[]> = {};
    data?.forEach(run => {
      const dept = run.department || 'general';
      if (!byDept[dept]) byDept[dept] = [];
      byDept[dept].push(run);
    });

    return NextResponse.json({ cable_runs: data, by_department: byDept });
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
    const { project_id, department, run_number, cable_type, length_m, source, destination, signal_type, notes } = body;

    const { data, error } = await supabase.from('cable_runs').insert({
      project_id, department, run_number, cable_type, length_m,
      source, destination, signal_type, notes, created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ cable_run: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
