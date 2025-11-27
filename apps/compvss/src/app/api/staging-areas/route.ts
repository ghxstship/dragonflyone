import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Staging area assignment and management
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const venueId = searchParams.get('venue_id');

    let query = supabase.from('staging_areas').select(`
      *, assignments:staging_assignments(*, equipment:equipment(id, name))
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (venueId) query = query.eq('venue_id', venueId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      staging_areas: data,
      available: data?.filter(a => a.status === 'available') || [],
      occupied: data?.filter(a => a.status === 'occupied') || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch staging areas' }, { status: 500 });
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
    const { project_id, venue_id, name, location, capacity, dimensions, access_notes } = body;

    const { data, error } = await supabase.from('staging_areas').insert({
      project_id, venue_id, name, location, capacity, dimensions, access_notes,
      status: 'available', created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ staging_area: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create staging area' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action, equipment_ids, department, time_slot } = body;

    if (action === 'assign') {
      await supabase.from('staging_areas').update({ status: 'occupied' }).eq('id', id);

      const assignments = equipment_ids.map((eqId: string) => ({
        staging_area_id: id, equipment_id: eqId, department, time_slot, assigned_by: user.id
      }));

      await supabase.from('staging_assignments').insert(assignments);
      return NextResponse.json({ success: true });
    }

    if (action === 'release') {
      await supabase.from('staging_areas').update({ status: 'available' }).eq('id', id);
      await supabase.from('staging_assignments').delete().eq('staging_area_id', id);
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from('staging_areas').update(body).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
