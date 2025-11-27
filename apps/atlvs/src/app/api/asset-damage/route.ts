import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Damage reporting and repair tracking
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('asset_id');
    const status = searchParams.get('status');

    let query = supabase.from('asset_damage_reports').select(`
      *, asset:assets(id, name, category), reported_by:platform_users!reported_by(id, first_name, last_name)
    `);

    if (assetId) query = query.eq('asset_id', assetId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('reported_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      reports: data,
      pending_repairs: data?.filter(r => r.status === 'pending_repair') || [],
      stats: {
        total: data?.length || 0,
        pending: data?.filter(r => r.status === 'pending_repair').length || 0,
        in_repair: data?.filter(r => r.status === 'in_repair').length || 0,
        completed: data?.filter(r => r.status === 'repaired').length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
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
    const { asset_id, project_id, damage_type, severity, description, photo_urls, estimated_repair_cost } = body;

    const { data, error } = await supabase.from('asset_damage_reports').insert({
      asset_id, project_id, damage_type, severity, description,
      photo_urls: photo_urls || [], estimated_repair_cost,
      reported_by: user.id, reported_at: new Date().toISOString(), status: 'pending_review'
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update asset status
    await supabase.from('assets').update({ status: 'damaged' }).eq('id', asset_id);

    return NextResponse.json({ report: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
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
    const { id, action, repair_vendor, actual_cost, repair_notes } = body;

    if (action === 'start_repair') {
      await supabase.from('asset_damage_reports').update({
        status: 'in_repair', repair_vendor, repair_started_at: new Date().toISOString()
      }).eq('id', id);
    } else if (action === 'complete_repair') {
      const { data: report } = await supabase.from('asset_damage_reports').select('asset_id').eq('id', id).single();
      
      await supabase.from('asset_damage_reports').update({
        status: 'repaired', actual_cost, repair_notes,
        repair_completed_at: new Date().toISOString(), repaired_by: user.id
      }).eq('id', id);

      await supabase.from('assets').update({ status: 'available' }).eq('id', report?.asset_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
