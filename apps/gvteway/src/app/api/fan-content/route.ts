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

// Fan-created content showcases
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const artistId = searchParams.get('artist_id');
    const featured = searchParams.get('featured') === 'true';

    let query = supabase.from('fan_content').select(`
      *, creator:users(id, display_name, avatar_url),
      event:events(id, name), likes:fan_content_likes(count)
    `).eq('status', 'approved');

    if (eventId) query = query.eq('event_id', eventId);
    if (artistId) query = query.eq('artist_id', artistId);
    if (featured) query = query.eq('featured', true);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      content: data?.map(c => ({
        ...c,
        like_count: c.likes?.length || 0
      }))
    });
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

    if (action === 'submit') {
      const { event_id, artist_id, content_type, title, description, media_url } = body;

      const { data, error } = await supabase.from('fan_content').insert({
        creator_id: user.id, event_id, artist_id, content_type,
        title, description, media_url, status: 'pending'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ content: data }, { status: 201 });
    }

    if (action === 'like') {
      const { content_id } = body;
      await supabase.from('fan_content_likes').upsert({
        content_id, user_id: user.id
      }, { onConflict: 'content_id,user_id' });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
