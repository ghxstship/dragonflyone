import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Delivery tracking and receiving with signature capture
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');

    let query = supabase.from('deliveries').select(`
      *, vendor:vendors(id, name), received_by:platform_users(id, first_name, last_name)
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('expected_date', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      deliveries: data,
      pending: data?.filter(d => d.status === 'pending') || [],
      in_transit: data?.filter(d => d.status === 'in_transit') || [],
      received: data?.filter(d => d.status === 'received') || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 });
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
    const { project_id, vendor_id, po_number, items, expected_date, delivery_location, notes } = body;

    const { data, error } = await supabase.from('deliveries').insert({
      project_id, vendor_id, po_number, items: items || [], expected_date,
      delivery_location, notes, status: 'pending', created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ delivery: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create delivery' }, { status: 500 });
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
    const { id, action, signature_data, received_items, condition_notes, photo_urls } = body;

    if (action === 'receive') {
      await supabase.from('deliveries').update({
        status: 'received', received_by: user.id, received_at: new Date().toISOString(),
        signature_data, received_items: received_items || [], condition_notes,
        photo_urls: photo_urls || []
      }).eq('id', id);

      return NextResponse.json({ success: true, message: 'Delivery received' });
    }

    if (action === 'update_status') {
      await supabase.from('deliveries').update({
        status: body.status, tracking_number: body.tracking_number
      }).eq('id', id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
