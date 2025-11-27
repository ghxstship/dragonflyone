import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Waste disposal and recycling coordination
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const { data, error } = await supabase.from('waste_disposal').select(`
      *, vendor:vendors(id, name, contact_phone)
    `).eq('project_id', projectId).order('scheduled_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate totals by type
    const totals = {
      general: data?.filter(d => d.waste_type === 'general').reduce((s, d) => s + (d.quantity || 0), 0) || 0,
      recycling: data?.filter(d => d.waste_type === 'recycling').reduce((s, d) => s + (d.quantity || 0), 0) || 0,
      hazardous: data?.filter(d => d.waste_type === 'hazardous').reduce((s, d) => s + (d.quantity || 0), 0) || 0
    };

    return NextResponse.json({ disposals: data, totals });
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
    const { project_id, waste_type, quantity, unit, vendor_id, scheduled_at, location } = body;

    const { data, error } = await supabase.from('waste_disposal').insert({
      project_id, waste_type, quantity, unit, vendor_id,
      scheduled_at, location, status: 'scheduled', created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ disposal: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, status, actual_quantity, manifest_number } = body;

    await supabase.from('waste_disposal').update({
      status, actual_quantity, manifest_number,
      completed_at: status === 'completed' ? new Date().toISOString() : null
    }).eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
