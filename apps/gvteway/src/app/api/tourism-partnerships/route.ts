import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Partnership with local businesses and tourism boards
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const partnerType = searchParams.get('type');

    let query = supabase.from('tourism_partnerships').select(`
      *, partner:local_partners(id, name, type, logo_url, website)
    `);

    if (eventId) query = query.eq('event_id', eventId);
    if (partnerType) query = query.eq('partner.type', partnerType);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ partnerships: data });
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
    const { action } = body;

    if (action === 'create_partner') {
      const { name, type, description, logo_url, website, contact_info, location } = body;

      const { data, error } = await supabase.from('local_partners').insert({
        name, type, description, logo_url, website, contact_info, location
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ partner: data }, { status: 201 });
    }

    if (action === 'create_partnership') {
      const { event_id, partner_id, partnership_type, benefits, terms, start_date, end_date } = body;

      const { data, error } = await supabase.from('tourism_partnerships').insert({
        event_id, partner_id, partnership_type, benefits: benefits || [],
        terms, start_date, end_date, status: 'active', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ partnership: data }, { status: 201 });
    }

    if (action === 'update_status') {
      const { partnership_id, status } = body;

      await supabase.from('tourism_partnerships').update({ status }).eq('id', partnership_id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
