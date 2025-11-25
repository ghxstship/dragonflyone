import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const contentType = searchParams.get('content_type');
    const hashtag = searchParams.get('hashtag');
    const eventId = searchParams.get('event_id');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('ugc_posts')
      .select(`
        *,
        event:events(id, title)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (platform) {
      query = query.eq('platform', platform);
    }

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    if (hashtag) {
      query = query.contains('hashtags', [hashtag]);
    }

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const posts = data?.map(p => ({
      id: p.id,
      platform: p.platform,
      content_type: p.content_type,
      content_url: p.content_url,
      thumbnail_url: p.thumbnail_url,
      caption: p.caption,
      author_name: p.author_name,
      author_handle: p.author_handle,
      author_avatar: p.author_avatar,
      hashtags: p.hashtags || [],
      event_id: p.event_id,
      event_name: (p.event as any)?.title,
      likes: p.likes || 0,
      comments: p.comments || 0,
      shares: p.shares || 0,
      is_featured: p.is_featured || false,
      created_at: p.created_at,
    })) || [];

    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
