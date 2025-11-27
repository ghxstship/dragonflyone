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

// Organic social content scheduler
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');

    let query = supabase.from('scheduled_posts').select('*');

    if (eventId) query = query.eq('event_id', eventId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('scheduled_at', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ posts: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'schedule') {
      const { event_id, platforms, content, media_urls, scheduled_at, hashtags } = body;

      const { data, error } = await supabase.from('scheduled_posts').insert({
        event_id, platforms: platforms || [], content, media_urls: media_urls || [],
        scheduled_at, hashtags: hashtags || [], status: 'scheduled', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ post: data }, { status: 201 });
    }

    if (action === 'bulk_schedule') {
      const { event_id, posts } = body;

      const { data, error } = await supabase.from('scheduled_posts').insert(
        posts.map((p: any) => ({
          event_id, platforms: p.platforms || [], content: p.content,
          media_urls: p.media_urls || [], scheduled_at: p.scheduled_at,
          hashtags: p.hashtags || [], status: 'scheduled', created_by: user.id
        }))
      ).select();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ posts: data }, { status: 201 });
    }

    if (action === 'cancel') {
      const { post_id } = body;

      await supabase.from('scheduled_posts').update({ status: 'cancelled' }).eq('id', post_id);
      return NextResponse.json({ success: true });
    }

    if (action === 'reschedule') {
      const { post_id, scheduled_at } = body;

      await supabase.from('scheduled_posts').update({ scheduled_at }).eq('id', post_id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
