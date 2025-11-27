import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('photo_galleries')
      .select(`
        *,
        event:events(id, title, date)
      `)
      .order('created_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const galleries = data?.map(g => ({
      id: g.id,
      event_id: g.event_id,
      event_name: (g.event as any)?.title || 'Unknown Event',
      event_date: (g.event as any)?.date,
      cover_photo: g.cover_photo_url,
      photo_count: g.photo_count || 0,
      status: g.status,
    })) || [];

    return NextResponse.json({ galleries });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event_id } = body;

    if (!event_id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    // Check if gallery already exists
    const { data: existing } = await supabase
      .from('photo_galleries')
      .select('id')
      .eq('event_id', event_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Gallery already exists for this event' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('photo_galleries')
      .insert({
        event_id,
        status: 'collecting',
        photo_count: 0,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ gallery: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
