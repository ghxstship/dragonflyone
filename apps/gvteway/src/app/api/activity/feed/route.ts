export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}



export async function GET(request: NextRequest) {
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
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ activities: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    interface UserInfo { full_name?: string; avatar_url?: string }
    interface EventInfo { title?: string; image?: string }
    interface ArtistInfo { name?: string }
    interface VenueInfo { name?: string }
    const activities = data?.map(activity => {
      const user = activity.user as UserInfo | null;
      const event = activity.event as EventInfo | null;
      const artist = activity.artist as ArtistInfo | null;
      const venue = activity.venue as VenueInfo | null;
      return {
        id: activity.id,
        type: activity.type,
        user_id: activity.user_id,
        user_name: user?.full_name || 'Unknown',
        user_avatar: user?.avatar_url,
        event_id: activity.event_id,
        event_title: event?.title,
        event_image: event?.image,
        artist_id: activity.artist_id,
        artist_name: artist?.name,
        venue_id: activity.venue_id,
        venue_name: venue?.name,
        content: activity.content,
        created_at: activity.created_at,
      };
    }) || [];

    return NextResponse.json({ activities });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ activities: [] });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
