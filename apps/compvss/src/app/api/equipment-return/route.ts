import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Equipment return verification and condition reporting
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const { data, error } = await supabase.from('equipment_returns').select(`
      *, equipment:equipment(id, name, asset_tag),
      checked_by:platform_users(first_name, last_name)
    `).eq('project_id', projectId).order('returned_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      returns: data,
      summary: {
        total: data?.length || 0,
        good: data?.filter(r => r.condition === 'good').length || 0,
        damaged: data?.filter(r => r.condition === 'damaged').length || 0,
        missing: data?.filter(r => r.condition === 'missing').length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { project_id, equipment_id, condition, notes, photo_urls } = body;

    const { data, error } = await supabase.from('equipment_returns').insert({
      project_id, equipment_id, condition, notes,
      photo_urls: photo_urls || [], checked_by: user.id,
      returned_at: new Date().toISOString()
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update equipment status
    await supabase.from('equipment').update({
      status: 'available', condition, last_checked: new Date().toISOString()
    }).eq('id', equipment_id);

    // Create damage report if needed
    if (condition === 'damaged') {
      await supabase.from('damage_assessments').insert({
        project_id, equipment_id, description: notes,
        severity: 'medium', status: 'pending', reported_by: user.id
      });
    }

    return NextResponse.json({ return: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
