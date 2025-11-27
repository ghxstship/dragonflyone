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

    let query = supabase.from('asset_checkouts').select(`
      *, asset:assets(id, name, category), 
      checked_out_by:platform_users!checked_out_by(id, email, first_name, last_name),
      project:projects(id, name)
    `);

    if (assetId) query = query.eq('asset_id', assetId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('checkout_date', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      checkouts: data,
      currently_out: data?.filter(c => c.status === 'checked_out') || [],
      overdue: data?.filter(c => c.status === 'checked_out' && new Date(c.expected_return) < new Date()) || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch checkouts' }, { status: 500 });
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
    const { asset_id, project_id, expected_return, purpose, requires_approval } = body;

    // Check asset availability
    const { data: existing } = await supabase.from('asset_checkouts')
      .select('id').eq('asset_id', asset_id).eq('status', 'checked_out').single();

    if (existing) {
      return NextResponse.json({ error: 'Asset already checked out' }, { status: 400 });
    }

    const { data, error } = await supabase.from('asset_checkouts').insert({
      asset_id, project_id, expected_return, purpose,
      checked_out_by: user.id, checkout_date: new Date().toISOString(),
      status: requires_approval ? 'pending_approval' : 'checked_out'
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update asset status
    await supabase.from('assets').update({ status: 'checked_out' }).eq('id', asset_id);

    return NextResponse.json({ checkout: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to checkout asset' }, { status: 500 });
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
    const { id, action, condition_notes, damage_reported } = body;

    if (action === 'return') {
      const { data: checkout } = await supabase.from('asset_checkouts').select('asset_id').eq('id', id).single();
      
      await supabase.from('asset_checkouts').update({
        status: 'returned', return_date: new Date().toISOString(),
        returned_by: user.id, condition_notes, damage_reported: damage_reported || false
      }).eq('id', id);

      await supabase.from('assets').update({ 
        status: damage_reported ? 'needs_repair' : 'available' 
      }).eq('id', checkout?.asset_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'approve') {
      await supabase.from('asset_checkouts').update({
        status: 'checked_out', approved_by: user.id, approved_at: new Date().toISOString()
      }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update checkout' }, { status: 500 });
  }
}
