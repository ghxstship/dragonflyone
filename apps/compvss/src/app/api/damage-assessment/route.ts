import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Damage assessment with photo evidence
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const equipmentId = searchParams.get('equipment_id');

    let query = supabase.from('damage_assessments').select(`
      *, equipment:equipment(id, name, asset_tag),
      photos:damage_photos(id, url, caption),
      reported_by:platform_users(first_name, last_name)
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (equipmentId) query = query.eq('equipment_id', equipmentId);

    const { data, error } = await query.order('reported_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      assessments: data,
      summary: {
        total: data?.length || 0,
        pending: data?.filter(a => a.status === 'pending').length || 0,
        total_cost: data?.reduce((s, a) => s + (a.repair_cost || 0), 0) || 0
      }
    });
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
    const { project_id, equipment_id, description, severity, photo_urls, estimated_cost } = body;

    const { data: assessment, error } = await supabase.from('damage_assessments').insert({
      project_id, equipment_id, description, severity,
      estimated_cost, status: 'pending',
      reported_by: user.id, reported_at: new Date().toISOString()
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Add photos
    if (photo_urls?.length) {
      const photoRecords = photo_urls.map((url: string) => ({
        assessment_id: assessment.id, url
      }));
      await supabase.from('damage_photos').insert(photoRecords);
    }

    // Update equipment status
    await supabase.from('equipment').update({ condition: 'damaged' }).eq('id', equipment_id);

    return NextResponse.json({ assessment }, { status: 201 });
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
    const { id, action, repair_cost, repair_notes, status } = body;

    if (action === 'resolve') {
      await supabase.from('damage_assessments').update({
        status: 'resolved', repair_cost, repair_notes,
        resolved_at: new Date().toISOString()
      }).eq('id', id);

      // Update equipment condition
      const { data: assessment } = await supabase.from('damage_assessments').select('equipment_id').eq('id', id).single();
      if (assessment) {
        await supabase.from('equipment').update({ condition: 'good' }).eq('id', assessment.equipment_id);
      }

      return NextResponse.json({ success: true });
    }

    await supabase.from('damage_assessments').update({ status }).eq('id', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
