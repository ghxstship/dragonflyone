import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Video trailer and promo embedding
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

    const { data, error } = await supabase.from('event_videos').select('*')
      .eq('event_id', eventId).order('display_order', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ videos: data });
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

    if (action === 'add') {
      const { event_id, title, video_url, video_type, thumbnail_url, duration_seconds, display_order } = body;

      // Parse video URL to get embed info
      let embed_url = video_url;
      let platform = 'other';

      if (video_url.includes('youtube.com') || video_url.includes('youtu.be')) {
        platform = 'youtube';
        const videoId = video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
        embed_url = `https://www.youtube.com/embed/${videoId}`;
      } else if (video_url.includes('vimeo.com')) {
        platform = 'vimeo';
        const videoId = video_url.match(/vimeo\.com\/(\d+)/)?.[1];
        embed_url = `https://player.vimeo.com/video/${videoId}`;
      }

      const { data, error } = await supabase.from('event_videos').insert({
        event_id, title, video_url, embed_url, platform, video_type: video_type || 'promo',
        thumbnail_url, duration_seconds, display_order: display_order || 0, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ video: data }, { status: 201 });
    }

    if (action === 'reorder') {
      const { videos } = body;

      await Promise.all(videos.map((v: any, i: number) =>
        supabase.from('event_videos').update({ display_order: i }).eq('id', v.id)
      ));

      return NextResponse.json({ success: true });
    }

    if (action === 'remove') {
      const { video_id } = body;

      await supabase.from('event_videos').delete().eq('id', video_id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
