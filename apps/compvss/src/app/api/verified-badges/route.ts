import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Verified badge system with background checks
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const vendorId = searchParams.get('vendor_id');

    let query = supabase.from('verification_badges').select('*');
    if (userId) query = query.eq('user_id', userId);
    if (vendorId) query = query.eq('vendor_id', vendorId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ badges: data });
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
    const { action } = body;

    if (action === 'request_verification') {
      const { entity_type, entity_id, verification_type, documents } = body;

      const { data, error } = await supabase.from('verification_requests').insert({
        entity_type, entity_id, verification_type,
        documents: documents || [], status: 'pending',
        requested_by: user.id, requested_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ request: data }, { status: 201 });
    }

    if (action === 'approve') {
      const { request_id, badge_type, expiry_date } = body;

      const { data: req } = await supabase.from('verification_requests').select('*')
        .eq('id', request_id).single();

      if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

      await supabase.from('verification_badges').insert({
        user_id: req.entity_type === 'user' ? req.entity_id : null,
        vendor_id: req.entity_type === 'vendor' ? req.entity_id : null,
        badge_type, verified_at: new Date().toISOString(),
        expiry_date, verified_by: user.id
      });

      await supabase.from('verification_requests').update({ status: 'approved' }).eq('id', request_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
