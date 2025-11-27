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
    const status = searchParams.get('status');
    const eventId = searchParams.get('event_id');

    let query = supabase
      .from('ugc_campaigns')
      .select(`
        *,
        event:events(id, title)
      `)
      .order('start_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const campaigns = data?.map(c => ({
      id: c.id,
      name: c.name,
      hashtag: c.hashtag,
      event_id: c.event_id,
      event_name: (c.event as any)?.title,
      start_date: c.start_date,
      end_date: c.end_date,
      post_count: c.post_count || 0,
      total_engagement: c.total_engagement || 0,
      status: c.status,
    })) || [];

    return NextResponse.json({ campaigns });
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
    const { name, hashtag, event_id, start_date, end_date } = body;

    if (!name || !hashtag || !start_date) {
      return NextResponse.json(
        { error: 'Name, hashtag, and start date are required' },
        { status: 400 }
      );
    }

    // Determine status based on dates
    const now = new Date();
    const startDate = new Date(start_date);
    const endDate = end_date ? new Date(end_date) : null;

    let status = 'scheduled';
    if (startDate <= now) {
      status = endDate && endDate < now ? 'ended' : 'active';
    }

    const { data, error } = await supabase
      .from('ugc_campaigns')
      .insert({
        name,
        hashtag: hashtag.replace('#', ''),
        event_id,
        start_date,
        end_date,
        status,
        post_count: 0,
        total_engagement: 0,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaign: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
