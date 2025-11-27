import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('asset_id');
    const status = searchParams.get('status');

    let query = supabase.from('asset_maintenance').select(`
      *, asset:assets(id, name, category, serial_number)
    `);

    if (assetId) query = query.eq('asset_id', assetId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('scheduled_date', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const upcoming = data?.filter(m => 
      m.status === 'scheduled' && new Date(m.scheduled_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ) || [];

    return NextResponse.json({
      maintenance_records: data,
      upcoming_maintenance: upcoming,
      overdue: data?.filter(m => m.status === 'scheduled' && new Date(m.scheduled_date) < new Date()) || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch maintenance' }, { status: 500 });
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
    const { asset_id, maintenance_type, scheduled_date, description, vendor_id, estimated_cost, recurring, recurring_interval_days } = body;

    const { data, error } = await supabase
      .from('asset_maintenance')
      .insert({
        asset_id, maintenance_type, scheduled_date, description, vendor_id,
        estimated_cost, recurring: recurring || false, recurring_interval_days,
        status: 'scheduled', created_by: user.id
      })
      .select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ maintenance: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to schedule maintenance' }, { status: 500 });
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
    const { id, action, ...updateData } = body;

    if (action === 'complete') {
      const { actual_cost, notes, next_scheduled } = updateData;
      await supabase.from('asset_maintenance').update({
        status: 'completed', completed_date: new Date().toISOString(),
        actual_cost, completion_notes: notes, completed_by: user.id
      }).eq('id', id);

      // Schedule next if recurring
      if (next_scheduled) {
        const { data: original } = await supabase.from('asset_maintenance').select('*').eq('id', id).single();
        if (original?.recurring) {
          await supabase.from('asset_maintenance').insert({
            ...original, id: undefined, scheduled_date: next_scheduled,
            status: 'scheduled', created_at: undefined
          });
        }
      }
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from('asset_maintenance').update(updateData).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update maintenance' }, { status: 500 });
  }
}
