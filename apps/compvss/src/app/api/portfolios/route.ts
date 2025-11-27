import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Portfolio and past work showcase
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const vendorId = searchParams.get('vendor_id');

    let query = supabase.from('portfolios').select(`
      *, items:portfolio_items(id, title, description, media_url, media_type, project_date)
    `);

    if (userId) query = query.eq('user_id', userId);
    if (vendorId) query = query.eq('vendor_id', vendorId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ portfolios: data });
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

    if (action === 'create') {
      const { vendor_id, title, description, specialties } = body;

      const { data, error } = await supabase.from('portfolios').insert({
        user_id: vendor_id ? null : user.id, vendor_id,
        title, description, specialties: specialties || []
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ portfolio: data }, { status: 201 });
    }

    if (action === 'add_item') {
      const { portfolio_id, title, description, media_url, media_type, project_date, client, role } = body;

      const { data, error } = await supabase.from('portfolio_items').insert({
        portfolio_id, title, description, media_url, media_type, project_date, client, role
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ item: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
