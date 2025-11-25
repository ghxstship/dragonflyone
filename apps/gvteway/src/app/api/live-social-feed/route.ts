import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Live social media feeds on event pages
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!eventId) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

    // Get event hashtags
    const { data: event } = await supabase.from('events').select('hashtags').eq('id', eventId).single();

    // Get aggregated social posts
    const { data, error } = await supabase.from('social_feed_posts').select('*')
      .eq('event_id', eventId).eq('moderated', true)
      .order('posted_at', { ascending: false }).limit(limit);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      posts: data,
      hashtags: event?.hashtags || [],
      total: data?.length || 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'configure') {
      const { event_id, hashtags, platforms, auto_moderate, filter_keywords } = body;

      const { data, error } = await supabase.from('social_feed_config').upsert({
        event_id, hashtags: hashtags || [], platforms: platforms || [],
        auto_moderate: auto_moderate || false, filter_keywords: filter_keywords || []
      }, { onConflict: 'event_id' }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ config: data });
    }

    if (action === 'ingest') {
      const { event_id, platform, post_id, author, content, media_url, posted_at } = body;

      const { data, error } = await supabase.from('social_feed_posts').insert({
        event_id, platform, external_post_id: post_id, author,
        content, media_url, posted_at, moderated: false
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ post: data }, { status: 201 });
    }

    if (action === 'moderate') {
      const { post_id, approved } = body;

      if (approved) {
        await supabase.from('social_feed_posts').update({ moderated: true }).eq('id', post_id);
      } else {
        await supabase.from('social_feed_posts').delete().eq('id', post_id);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
