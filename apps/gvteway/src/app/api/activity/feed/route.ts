import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Get users that the current user follows
    const { data: following } = await supabase
      .from('user_follows')
      .select('followed_id')
      .eq('follower_id', user.id);

    const followedIds = following?.map(f => f.followed_id) || [];

    if (followedIds.length === 0) {
      return NextResponse.json({ activities: [] });
    }

    let query = supabase
      .from('user_activities')
      .select(`
        id,
        type,
        user_id,
        event_id,
        artist_id,
        venue_id,
        content,
        created_at,
        user:profiles!user_id(id, full_name, avatar_url),
        event:events(id, title, image),
        artist:artists(id, name),
        venue:venues(id, name)
      `)
      .in('user_id', followedIds)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const activities = data?.map(activity => ({
      id: activity.id,
      type: activity.type,
      user_id: activity.user_id,
      user_name: (activity.user as any)?.full_name || 'Unknown',
      user_avatar: (activity.user as any)?.avatar_url,
      event_id: activity.event_id,
      event_title: (activity.event as any)?.title,
      event_image: (activity.event as any)?.image,
      artist_id: activity.artist_id,
      artist_name: (activity.artist as any)?.name,
      venue_id: activity.venue_id,
      venue_name: (activity.venue as any)?.name,
      content: activity.content,
      created_at: activity.created_at,
    })) || [];

    return NextResponse.json({ activities });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
